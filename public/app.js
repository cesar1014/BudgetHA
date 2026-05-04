import { fetchSameOrigin } from "./app/api-client.js";

const state = {
  topicos: [],
  resumo: { rows: [], totalGeral: 0 },
  detalhes: { items: [], total: 0 },
  detalhesRequestSeq: 0,
  refreshRequestSeq: 0,
  resumoAbortController: null,
  detalhesAbortController: null,
  selectedTopicoId: null,
  editMode: false,
  editLancamentoId: null,
  selectedCompraGrupo: "__ALL__",
  teamHiresUnlocked: false,
  configTopicDrafts: {},
  configGroupFilter: "__ALL_GROUPS__",
  expandedResumoGroups: {},
  expandedTopicosGroups: {},
  activeView: "resumo",
  reportSort: "spent",
  loading: {
    refresh: false,
    resumo: false,
    detalhes: false,
  },
  filters: {
    ano: String(new Date().getFullYear()),
    semestre: "",
    dataInicio: "",
    dataFim: "",
    search: "",
  },
  auth: {
    username: "",
    projectCode: "",
    projectName: "",
    projectBrandName: "",
    activeProjectCode: "",
    accountType: "user",
    allowedProjects: [],
    requiresProjectSelection: false,
    role: "viewer",
    permissions: {
      canWriteLancamentos: false,
      canManageConfig: false,
      canViewDiagnostics: false,
    },
  },
};

const GROUP_ORDER = [
  "TEAM HIRES",
  "PERSONNEL",
  "DIRECT COSTS",
  "COMMUNICATIONS & PUBLICATIONS",
  "INFRASTRUCTURE AND EQUIPMENT",
  "THIRD PARTY SERVICES",
];

const GROUP_LABELS_PT = {
  "TEAM HIRES": "Contratações da Equipe",
  PERSONNEL: "Pessoal",
  "DIRECT COSTS": "Custos Diretos",
  "COMMUNICATIONS & PUBLICATIONS": "Comunicação e Publicações",
  "THIRD PARTY SERVICES": "Serviços de Terceiros",
  "INFRASTRUCTURE & EQUIPMENT": "Infraestrutura e Equipamentos",
  "INFRASTRUCTURE AND EQUIPMENT": "Infraestrutura e Equipamentos",
};
const ALL_GROUPS_OPTION = "__ALL__";
const ALL_CONFIG_GROUPS_OPTION = "__ALL_GROUPS__";
const GROUP_ORDER_SET = new Set(GROUP_ORDER);
const GROUP_KEY_BY_FOLDED = new Map(
  Object.entries(GROUP_LABELS_PT).flatMap(([key, label]) => {
    const keyFolded = String(key)
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const labelFolded = String(label)
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return [
      [keyFolded, key],
      [labelFolded, key],
    ];
  })
);

const TOPIC_LABELS_PT = {
  "Nurse 1": "Enfermeiro 1",
  "Nurse 2": "Enfermeiro 2",
  "Project Coordinator": "Coordenador do Projeto",
  "Administrative Assistant 1": "Assistente Administrativo 1",
  "Administrative Assistant 2": "Assistente Administrativo 2",
  "Medical resident grant": "Residência médica",
  "Nursing resident grant": "Residência em enfermagem",
  "Administrative assistant salary": "Assistente administrativo",
  "Project coordinator salary": "Coordenador de projeto",
  "Audiovisual salary": "Audiovisual",
  "Nurse salary": "Enfermeiro",
  "Operational fees (PG Lato Sensu/COREME)": "Custos operacionais (PG Lato Sensu/COREME)",
  "Infrastructure and equipement": "Infraestrutura e equipamentos",
  "Infrastructure and equipment": "Infraestrutura e equipamentos",
  "Transportation/operational reserve - External internships":
    "Transporte/reserva operacional - Estágios externos",
  "Advertising fees (Marketing/press)": "Publicidade (Marketing/imprensa)",
  "Scientific and cultural events fee (Harena)": "Eventos científicos e culturais (Harena)",
  "Resident support fee": "Apoio ao residente",
  Computer: "Computador",
  "Didactic Material": "Material Didático",
  Publications: "Publicações",
  "Technical Equipment & Infrastructure": "Equipamentos Técnicos e Infraestrutura",
  "Team Transportation & Meals": "Transporte e Alimentação da Equipe",
  "Events & Conferences": "Eventos e Conferências",
  "Just Mine": "Just Mine",
  "External Consultant": "Consultor Externo",
  "Digital Marketing": "Marketing Digital",
};

const VIEW_TOOLBAR_META = {
  resumo: {
    title: "Visão Geral",
    subtitle: "Monitoramento financeiro e controle de gastos.",
    showSaldo: true,
    showApply: true,
    showClear: false,
    applyLabel: "Atualizar",
    showFilters: true,
  },
  topicos: {
    title: "Tópicos",
    subtitle: "Acompanhamento por grupo e status de execução.",
    showSaldo: false,
    showApply: false,
    showClear: false,
    applyLabel: "Atualizar",
    showFilters: false,
  },
  relatorios: {
    title: "Relatórios",
    subtitle: "Exportação dos dados conforme os filtros ativos.",
    showSaldo: false,
    showApply: true,
    showClear: true,
    applyLabel: "Atualizar",
    showFilters: true,
  },
  config: {
    title: "Configurações",
    subtitle: "Gestão de tópicos, orçamentos e permissões de lançamento.",
    showSaldo: false,
    showApply: false,
    showClear: false,
    applyLabel: "Atualizar dados",
    showFilters: false,
  },
};

const refs = {
  navLinks: document.querySelectorAll(".nav-link"),
  views: document.querySelectorAll(".view"),
  brandProjectCode: document.getElementById("brand-project-code"),
  brandProjectName: document.getElementById("brand-project-name"),
  toolbar: document.getElementById("global-toolbar"),
  toolbarTitle: document.getElementById("toolbar-title"),
  toolbarSubtitle: document.getElementById("toolbar-subtitle"),
  headerBalanceContainer: document.getElementById("header-balance-container"),
  headerBalanceValue: document.getElementById("header-balance-value"),
  toolbarFilters: document.getElementById("toolbar-filters"),
  ano: document.getElementById("filter-ano"),
  semestre: document.getElementById("filter-semestre"),
  dataInicio: document.getElementById("filter-data-inicio"),
  dataFim: document.getElementById("filter-data-fim"),
  filterSearch: document.getElementById("filter-search"),
  applyFilters: document.getElementById("apply-filters"),
  clearFilters: document.getElementById("clear-filters"),
  themeToggle: document.getElementById("theme-toggle"),
  logoutButton: document.getElementById("btn-logout"),
  hubLink: document.getElementById("btn-hub-link"),
  projectSwitcherWrap: document.getElementById("project-switcher-wrap"),
  projectSwitcher: document.getElementById("project-switcher"),
  resumoHead: document.getElementById("resumo-head"),
  resumoBody: document.getElementById("resumo-body"),
  detalhesTitulo: document.getElementById("detalhes-titulo"),
  detalhesBody: document.getElementById("detalhes-body"),
  detalhesTotal: document.getElementById("detalhes-total"),
  kpiGrid: document.getElementById("kpi-grid"),
  kpiOrcamento: document.getElementById("kpi-orcamento"),
  kpiGasto: document.getElementById("kpi-gasto"),
  kpiSaldo: document.getElementById("kpi-saldo"),
  kpiPercentual: document.getElementById("kpi-percentual"),
  kpiStatus: document.getElementById("kpi-status"),
  groupDistributionChart: document.getElementById("group-distribution-chart"),
  chartBar: document.getElementById("chart-bar"),
  reportFilterSummary: document.getElementById("report-filter-summary"),
  reportTotalTopicos: document.getElementById("report-total-topicos"),
  reportGruposAtivos: document.getElementById("report-grupos-ativos"),
  reportTopicosCriticos: document.getElementById("report-topicos-criticos"),
  reportTicketMedio: document.getElementById("report-ticket-medio"),
  reportKpiOrcamento: document.getElementById("report-kpi-orcamento"),
  reportKpiGasto: document.getElementById("report-kpi-gasto"),
  reportKpiSaldo: document.getElementById("report-kpi-saldo"),
  reportExecutionGauge: document.getElementById("report-execution-gauge"),
  reportExecutionValue: document.getElementById("report-execution-value"),
  reportGaugeStatus: document.getElementById("report-gauge-status"),
  reportGaugeCopy: document.getElementById("report-gauge-copy"),
  reportNarrative: document.getElementById("report-narrative"),
  reportHighlights: document.getElementById("report-highlights"),
  reportStatusBar: document.getElementById("report-status-bar"),
  reportStatusList: document.getElementById("report-status-list"),
  reportRankingList: document.getElementById("report-ranking-list"),
  reportAttentionList: document.getElementById("report-attention-list"),
  reportExportSummary: document.getElementById("report-export-summary"),
  reportSortButtons: document.querySelectorAll("[data-report-sort]"),
  topicosGrid: document.getElementById("topicos-grid"),
  topicosCount: document.getElementById("topicos-count"),
  btnNovaCompra: document.getElementById("btn-nova-compra"),
  exportExcel: document.getElementById("export-excel"),
  exportCsv: document.getElementById("export-csv"),
  exportPdf: document.getElementById("export-pdf"),
  btnAddTopico: document.getElementById("btn-add-topico"),
  editModeControl: document.getElementById("edit-mode-control"),
  toggleEditMode: document.getElementById("toggle-edit-mode"),
  editModeState: document.getElementById("edit-mode-state"),
  configGroupFilter: document.getElementById("config-group-filter"),
  configTopicosBody: document.getElementById("config-topicos-body"),
  configReactRoot: document.getElementById("config-react-root"),
  configLegacyShell: document.getElementById("config-legacy-shell"),
  toggleTeamHires: document.getElementById("toggle-team-hires"),
  teamHiresText: document.getElementById("team-hires-text"),
  teamHiresHint: document.getElementById("team-hires-hint"),
  modal: document.getElementById("modal-compra"),
  modalTitle: document.getElementById("modal-title"),
  closeModal: document.getElementById("close-modal"),
  cancelModal: document.getElementById("cancel-modal"),
  formCompra: document.getElementById("form-compra"),
  submitCompra: document.getElementById("submit-compra"),
  compraGrupo: document.getElementById("compra-grupo"),
  compraTopico: document.getElementById("compra-topico"),
  compraData: document.getElementById("compra-data"),
  compraDescricao: document.getElementById("compra-descricao"),
  compraFornecedor: document.getElementById("compra-fornecedor"),
  compraResponsavel: document.getElementById("compra-responsavel"),
  compraValor: document.getElementById("compra-valor"),
  topicModal: document.getElementById("modal-topico"),
  closeTopicModal: document.getElementById("close-modal-topico"),
  cancelTopicModal: document.getElementById("cancel-modal-topico"),
  topicForm: document.getElementById("form-topico"),
  submitTopico: document.getElementById("submit-topico"),
  topicName: document.getElementById("topico-nome"),
  topicGroup: document.getElementById("topico-grupo"),
  topicBudget: document.getElementById("topico-orcamento"),
  topicIncluirResumo: document.getElementById("topico-incluir-resumo"),
  topicPermitirLancamento: document.getElementById("topico-permitir-lancamento"),
  projectPicker: document.getElementById("project-picker"),
  projectPickerList: document.getElementById("project-picker-list"),
  projectPickerError: document.getElementById("project-picker-error"),
  projectPickerSwitchUser: document.getElementById("project-picker-switch-user"),
};

const CONFIG_REACT_BUNDLE = "./react/config-app.js";
const CONFIG_REACT_CSS = "./react/config-app.css";
const CONFIG_REACT_STYLE_ID = "config-react-bundle-style";
const configReactRuntime = {
  mounted: false,
  failed: false,
  mountPromise: null,
  stylePromise: null,
  unmount: null,
  failureToastShown: false,
};
const dialogFocusState = new Map();

function getAuthPermissions() {
  const permissions = state.auth?.permissions ?? {};
  return {
    canWriteLancamentos: Boolean(permissions.canWriteLancamentos),
    canManageConfig: Boolean(permissions.canManageConfig),
    canViewDiagnostics: Boolean(permissions.canViewDiagnostics),
    canManageUsers: Boolean(permissions.canManageUsers),
  };
}

function canWriteLancamentos() {
  return getAuthPermissions().canWriteLancamentos;
}

function canManageConfig() {
  return getAuthPermissions().canManageConfig;
}

function isAbortError(error) {
  return error?.name === "AbortError";
}

function money(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function percent(value) {
  const n = Number.isFinite(value) ? value : 0;
  return `${n.toFixed(2).replace(".", ",")}%`;
}

function dateBr(dateIso) {
  if (!dateIso) return "";
  const [ano, mes, dia] = dateIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function quickSearchMatches(value, normalizedSearch) {
  if (!normalizedSearch) return true;
  return normalizeSearchText(value).includes(normalizedSearch);
}

function statusFromPercent(percentualExecutado) {
  if (percentualExecutado > 100) return { chave: "alerta", rotulo: "Ultrapassou o orçamento" };
  if (Math.abs(percentualExecutado - 100) < 0.01)
    return { chave: "limite", rotulo: "No limite do orçamento" };
  if (percentualExecutado >= 90) return { chave: "proximo", rotulo: "Próximo do limite" };
  return { chave: "ok", rotulo: "Dentro do orçamento" };
}

function toneClassFromStatus(statusExecucao) {
  const chave = statusExecucao?.chave || "ok";
  return `tone-${chave}`;
}

function hasExplicitDateRangeFilter(filters = state.filters) {
  return Boolean(filters?.dataInicio || filters?.dataFim);
}

function makeQuery(extra = {}) {
  const params = new URLSearchParams();
  const merged = { ...state.filters, ...extra };

  if (hasExplicitDateRangeFilter(merged)) {
    if (merged.dataInicio) params.set("dataInicio", merged.dataInicio);
    if (merged.dataFim) params.set("dataFim", merged.dataFim);
  } else {
    if (merged.ano) params.set("ano", merged.ano);
    if (merged.semestre) params.set("semestre", merged.semestre);
  }
  if (merged.topicoId) params.set("topicoId", merged.topicoId);

  return params.toString();
}

function normalizeAllowedProjects(rawProjects, fallbackProjects = []) {
  const source = Array.isArray(rawProjects) ? rawProjects : [];
  const fallback = Array.isArray(fallbackProjects) ? fallbackProjects : [];

  function mapProject(project) {
    if (typeof project === "string") {
      const code = String(project).trim().toUpperCase();
      if (!code) return null;
      return { code, name: code, brandName: code };
    }

    const code = String(project?.code ?? project?.projectCode ?? "")
      .trim()
      .toUpperCase();
    if (!code) return null;
    const name = String(project?.name ?? project?.projectName ?? code).trim() || code;
    const brandName =
      String(project?.brandName ?? project?.projectBrandName ?? name).trim() || name;
    return { code, name, brandName };
  }

  const normalized = source.map(mapProject).filter(Boolean);
  if (normalized.length === 0 && fallback.length > 0) {
    return normalizeAllowedProjects(fallback, []);
  }

  const unique = [];
  const seen = new Set();
  for (const project of normalized) {
    if (seen.has(project.code)) continue;
    seen.add(project.code);
    unique.push(project);
  }
  return unique;
}

function getCurrentAllowedProjects() {
  return normalizeAllowedProjects(state.auth?.allowedProjects, []);
}

function isHubNavigationRequired() {
  const allowedProjects = getCurrentAllowedProjects();
  if (allowedProjects.length <= 1) return false;
  const activeProjectCode = String(
    state.auth?.projectCode ?? state.auth?.activeProjectCode ?? ""
  ).trim();
  return !activeProjectCode;
}

function redirectToHub(options = {}) {
  if (window.location.pathname === "/hub" || window.location.pathname === "/hub/") {
    return;
  }

  if (options?.replace) {
    window.location.replace("/hub");
    return;
  }
  window.location.href = "/hub";
}

async function setActiveProject(projectCode, options = {}) {
  const normalizedProjectCode = String(projectCode ?? "")
    .trim()
    .toUpperCase();
  if (!normalizedProjectCode) return null;

  const status = await request("/api/auth/active-project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectCode: normalizedProjectCode }),
    retryOnProjectSelection: options.retryOnProjectSelection ?? false,
  });
  applyAuthStatus(status);
  return status;
}

async function request(url, options = {}) {
  const { retryOnProjectSelection = true, ...fetchOptions } = options;
  const response = await fetchSameOrigin(url, fetchOptions);
  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    let message = "Erro inesperado.";
    let body = null;
    try {
      body = await response.json();
      message = body.error || message;
    } catch {
      message = response.statusText || message;
    }

    if (
      response.status === 409 &&
      retryOnProjectSelection &&
      body?.code === "PROJECT_SELECTION_REQUIRED"
    ) {
      const allowedProjects = normalizeAllowedProjects(
        body.allowedProjects,
        getCurrentAllowedProjects()
      );
      if (allowedProjects.length > 0) {
        state.auth.allowedProjects = allowedProjects;
        syncProjectNavigationUI();
      }

      if (allowedProjects.length === 1) {
        try {
          await setActiveProject(allowedProjects[0].code, { retryOnProjectSelection: false });
          state.auth.requiresProjectSelection = false;
          syncProjectBranding();
          return request(url, { ...fetchOptions, retryOnProjectSelection: false });
        } catch (selectionError) {
          message = selectionError?.message || message;
        }
      }

      state.auth.projectCode = "";
      state.auth.activeProjectCode = "";
      state.auth.requiresProjectSelection = allowedProjects.length > 1;
      syncProjectBranding();
      syncProjectNavigationUI();
      if (allowedProjects.length > 1) {
        redirectToHub({ replace: true });
        return new Promise(() => {});
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  const isApiRoute = typeof url === "string" && url.startsWith("/api/");

  if (isApiRoute && !contentType.includes("application/json")) {
    throw new Error("API indisponível ou desatualizada. Reinicie o servidor com npm run dev.");
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

async function logoutAndRedirect() {
  try {
    await fetchSameOrigin("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Ignore network/logout errors and force a fresh login screen.
  }
  window.location.href = "/login?switch=1";
}

function toast(message) {
  let node = document.querySelector(".toast");
  if (!node) {
    node = document.createElement("div");
    node.className = "toast";
    document.body.appendChild(node);
  }

  node.textContent = message;
  node.classList.add("show");
  clearTimeout(node._timer);
  node._timer = setTimeout(() => node.classList.remove("show"), 2400);
}

function getApplyLabelForView(viewName = state.activeView) {
  const meta = VIEW_TOOLBAR_META[viewName] ?? VIEW_TOOLBAR_META.resumo;
  return meta.applyLabel || "Atualizar";
}

function syncLoadingUI() {
  const busy = Boolean(state.loading.refresh || state.loading.resumo || state.loading.detalhes);

  if (refs.applyFilters) {
    refs.applyFilters.disabled = busy;
    refs.applyFilters.setAttribute("aria-busy", busy ? "true" : "false");
    refs.applyFilters.textContent = busy ? "Atualizando..." : getApplyLabelForView();
  }
  if (refs.clearFilters) refs.clearFilters.disabled = busy;
  if (refs.exportExcel) refs.exportExcel.disabled = busy;
  if (refs.exportCsv) refs.exportCsv.disabled = busy;
  if (refs.exportPdf) refs.exportPdf.disabled = busy;
  if (refs.resumoBody)
    refs.resumoBody.setAttribute("aria-busy", state.loading.resumo ? "true" : "false");
  if (refs.detalhesBody)
    refs.detalhesBody.setAttribute("aria-busy", state.loading.detalhes ? "true" : "false");
  if (refs.kpiGrid) refs.kpiGrid.setAttribute("aria-busy", state.loading.resumo ? "true" : "false");
}

function setLoadingState(key, isLoading) {
  state.loading[key] = Boolean(isLoading);
  syncLoadingUI();
}

function syncNavAriaCurrent(viewName) {
  refs.navLinks.forEach((btn) => {
    if (btn.dataset.view === viewName) {
      btn.setAttribute("aria-current", "page");
      return;
    }
    btn.removeAttribute("aria-current");
  });
}

function getFocusableElements(container) {
  return [
    ...container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ),
  ].filter((node) => !node.hasAttribute("hidden") && node.getAttribute("aria-hidden") !== "true");
}

function openDialog(dialog, preferredFocusSelector = "") {
  if (!dialog) return;
  const lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialogFocusState.set(dialog, { lastFocused });
  dialog.showModal();

  const preferred = preferredFocusSelector ? dialog.querySelector(preferredFocusSelector) : null;
  const fallback = getFocusableElements(dialog)[0] ?? dialog;
  requestAnimationFrame(() => {
    (preferred ?? fallback)?.focus?.();
  });
}

function closeDialog(dialog) {
  if (!dialog?.open) return;
  dialog.close();
}

function trapDialogFocus(dialog, event) {
  if (event.key !== "Tab") return;
  const focusable = getFocusableElements(dialog);
  if (!focusable.length) {
    event.preventDefault();
    dialog.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
    return;
  }
  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function setupDialogAccessibility(dialog) {
  if (!dialog) return;

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog(dialog);
      return;
    }
    trapDialogFocus(dialog, event);
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog(dialog);
  });

  dialog.addEventListener("close", () => {
    const context = dialogFocusState.get(dialog);
    dialogFocusState.delete(dialog);
    context?.lastFocused?.focus?.();
  });
}

function setBusyButton(button, isBusy, labels) {
  if (!button) return;
  const busyLabel = labels?.busy ?? "Salvando...";

  if (isBusy) {
    button.dataset.idleLabel = labels?.idle ?? button.textContent;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.textContent = busyLabel;
    return;
  }

  const idleLabel = labels?.idle ?? button.dataset.idleLabel ?? button.textContent;
  delete button.dataset.idleLabel;
  button.disabled = false;
  button.setAttribute("aria-busy", "false");
  button.textContent = idleLabel;
}

function canLaunchTopico(topico) {
  if (!topico) return false;
  if (typeof topico.permitirLancamentoEfetivo === "boolean") {
    return topico.permitirLancamentoEfetivo;
  }
  return (
    Boolean(topico.permitirLancamento) ||
    (state.teamHiresUnlocked && isTeamHiresGroup(topico.grupo))
  );
}

function getTopicosAtivos() {
  return state.topicos.filter((topico) => canLaunchTopico(topico));
}

function foldGroupName(value) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeGroupName(groupName) {
  const text = String(groupName ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!text) return "SEM GRUPO";
  return GROUP_KEY_BY_FOLDED.get(foldGroupName(text)) || text;
}

function isTeamHiresGroup(groupName) {
  return normalizeGroupName(groupName) === "TEAM HIRES";
}

function getGroupLabelPt(groupName) {
  const normalized = normalizeGroupName(groupName);
  return GROUP_LABELS_PT[normalized] || normalized;
}

function getTopicLabelPt(topicName) {
  return TOPIC_LABELS_PT[topicName] || topicName;
}

function getTopicoDisplayGroup(topico) {
  return normalizeGroupName(topico?.grupo);
}

function isResumoGroupExpanded(groupName) {
  return state.expandedResumoGroups[groupName] === true;
}

function isTopicosGroupExpanded(groupName) {
  return state.expandedTopicosGroups[groupName] === true;
}

function getResumoMapByTopico() {
  return new Map(state.resumo.rows.map((row) => [row.topicoId, row]));
}

function getGroupsFromTopicosList(topicosList) {
  const allGroups = [...new Set(topicosList.map((topico) => getTopicoDisplayGroup(topico)))];
  const extras = allGroups
    .filter((group) => !GROUP_ORDER_SET.has(group))
    .sort((a, b) => getGroupLabelPt(a).localeCompare(getGroupLabelPt(b)));
  return [...GROUP_ORDER.filter((group) => allGroups.includes(group)), ...extras];
}

function getGroupsFromTopicos() {
  return getGroupsFromTopicosList(state.topicos);
}

function getGroupedTopicos(options = {}) {
  const incluirApenasResumo = Boolean(options.incluirApenasResumo);
  const resumoMap = getResumoMapByTopico();
  const topicosFonte = incluirApenasResumo
    ? state.topicos.filter((topico) => topico?.incluirNoResumo !== false)
    : state.topicos;
  const topicosOrdenados = [...topicosFonte].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  const buckets = new Map();

  topicosOrdenados.forEach((topico) => {
    const group = getTopicoDisplayGroup(topico);
    if (!buckets.has(group)) buckets.set(group, []);

    const resumo = resumoMap.get(topico.id);
    const orcamentoProgramaBRL = Number(
      resumo?.orcamentoProgramaBRL ?? topico.orcamentoProgramaBRL ?? 0
    );
    const despesasAnteriores = Number(resumo?.despesasAnteriores ?? resumo?.totalS1 ?? 0);
    const despesasPeriodo = Number(resumo?.despesasPeriodo ?? resumo?.totalS2 ?? 0);
    const despesasAteData = Number(resumo?.despesasAteData ?? resumo?.totalAno ?? 0);
    const saldoRemanescente = Number(
      resumo?.saldoRemanescente ?? round2(orcamentoProgramaBRL - despesasAteData)
    );
    const percentualExecutado = Number(
      resumo?.percentualExecutado ??
        (orcamentoProgramaBRL > 0 ? round2((despesasAteData / orcamentoProgramaBRL) * 100) : 0)
    );
    const statusExecucao = resumo?.statusExecucao ?? statusFromPercent(percentualExecutado);

    buckets.get(group).push({
      topicoId: topico.id,
      nome: topico.nome,
      nomeExibicao: getTopicLabelPt(topico.nome),
      grupo: group,
      grupoExibicao: getGroupLabelPt(group),
      permitirLancamento: canLaunchTopico(topico),
      incluirNoResumo: topico.incluirNoResumo,
      orcamentoProgramaBRL,
      despesasAnteriores,
      despesasPeriodo,
      despesasAteData,
      saldoRemanescente,
      percentualExecutado,
      statusExecucao,
    });
  });

  return getGroupsFromTopicosList(topicosOrdenados).map((groupName) => ({
    groupName,
    items: buckets.get(groupName) ?? [],
  }));
}

function getTopicoNome(topicoId) {
  const original = state.topicos.find((topico) => topico.id === topicoId)?.nome ?? topicoId;
  return getTopicLabelPt(original);
}

function isTotalMode() {
  return !state.filters.ano && !hasExplicitDateRangeFilter();
}

function syncPeriodFilterAvailability() {
  const explicitDateRange = hasExplicitDateRangeFilter();
  if (refs.ano) refs.ano.disabled = explicitDateRange;
  if (refs.semestre) refs.semestre.disabled = explicitDateRange || !state.filters.ano;
}

function syncFilterInputs() {
  refs.ano.value = state.filters.ano;
  refs.semestre.value = state.filters.semestre;
  if (refs.dataInicio) refs.dataInicio.value = state.filters.dataInicio;
  if (refs.dataFim) refs.dataFim.value = state.filters.dataFim;
  if (refs.filterSearch) refs.filterSearch.value = state.filters.search;
  syncPeriodFilterAvailability();
}

function renderResumoHeader() {
  if (isTotalMode()) {
    refs.resumoHead.innerHTML = `<tr>
      <th>Tópico</th>
      <th>Orçamento Total do Programa</th>
      <th>Despesas Totais</th>
      <th>Saldo Remanescente</th>
    </tr>`;
    return;
  }

  refs.resumoHead.innerHTML = `<tr>
    <th>Tópico</th>
    <th>Orçamento Total do Programa</th>
    <th>Total de Despesas Anteriores</th>
    <th>Despesas Deste Período</th>
    <th>Despesas Totais</th>
    <th>Saldo Remanescente</th>
  </tr>`;
}

function renderResumoKpis() {
  const indicadores = state.resumo?.indicadores ?? {};
  const orcamento = Number(indicadores.orcamentoProgramaBRL ?? 0);
  const gasto = Number(indicadores.despesasAteData ?? state.resumo?.totalGeral ?? 0);
  const saldo = Number(indicadores.saldoRemanescente ?? orcamento - gasto);
  const percentual = Number(
    indicadores.percentualExecutado ?? (orcamento > 0 ? (gasto / orcamento) * 100 : 0)
  );
  const status = indicadores.statusExecucao ?? statusFromPercent(percentual);

  if (refs.kpiOrcamento) refs.kpiOrcamento.textContent = money(orcamento);
  if (refs.kpiGasto) refs.kpiGasto.textContent = money(gasto);
  if (refs.kpiSaldo) refs.kpiSaldo.textContent = money(saldo);
  if (refs.kpiPercentual) refs.kpiPercentual.textContent = percent(percentual);
  if (refs.kpiStatus) {
    refs.kpiStatus.className = `legend-item ${String(status?.chave || "ok").replace(/[^a-z-]/gi, "") || "ok"}`;
    refs.kpiStatus.textContent = status?.rotulo || "Dentro do orçamento";
  }
}

function readThemeColor(variableName, fallback) {
  const value = getComputedStyle(document.body).getPropertyValue(variableName).trim();
  return value || fallback;
}

function truncateChartLabel(value, maxLength = 26) {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
}

function getReportChartItems() {
  const normalizedSearch = normalizeSearchText(state.filters.search);
  return (Array.isArray(state.resumo?.rows) ? state.resumo.rows : [])
    .filter((row) => row?.incluirNoResumo !== false)
    .map((row) => {
      const groupName = String(row?.grupo ?? "SEM GRUPO").trim() || "SEM GRUPO";
      const topicName = String(row?.topico ?? row?.topicoId ?? "").trim() || String(row?.topicoId ?? "");
      return {
        topicoId: String(row?.topicoId ?? ""),
        nome: topicName,
        nomeExibicao: getTopicLabelPt(topicName),
        grupo: groupName,
        grupoExibicao: getGroupLabelPt(groupName),
        orcamentoProgramaBRL: Number(row?.orcamentoProgramaBRL ?? 0),
        despesasAnteriores: Number(row?.despesasAnteriores ?? 0),
        despesasPeriodo: Number(row?.despesasPeriodo ?? 0),
        despesasAteData: Number(row?.despesasAteData ?? 0),
        saldoRemanescente: Number(row?.saldoRemanescente ?? 0),
        percentualExecutado: Number(row?.percentualExecutado ?? 0),
        statusExecucao: row?.statusExecucao ?? statusFromPercent(Number(row?.percentualExecutado ?? 0)),
      };
    })
    .filter((item) => {
      if (!normalizedSearch) return true;
      return (
        quickSearchMatches(item.nomeExibicao, normalizedSearch) ||
        quickSearchMatches(item.grupoExibicao, normalizedSearch)
      );
    });
}

function buildReportFilterChips() {
  const chips = [];
  if (state.filters.ano) chips.push(`Ano ${state.filters.ano}`);
  if (state.filters.semestre) chips.push(state.filters.semestre === "S1" ? "1º semestre" : "2º semestre");
  if (state.filters.dataInicio && state.filters.dataFim) {
    chips.push(`${dateBr(state.filters.dataInicio)} até ${dateBr(state.filters.dataFim)}`);
  } else if (state.filters.dataInicio) {
    chips.push(`A partir de ${dateBr(state.filters.dataInicio)}`);
  } else if (state.filters.dataFim) {
    chips.push(`Até ${dateBr(state.filters.dataFim)}`);
  }
  if (state.filters.search) {
    chips.push(`Busca: ${state.filters.search}`);
  }
  if (!chips.length) {
    chips.push("Visão anual completa");
  }
  return chips;
}

function getReportInsights() {
  const items = getReportChartItems();
  const totalBudget = round2(
    items.reduce((sum, item) => sum + Number(item?.orcamentoProgramaBRL ?? 0), 0)
  );
  const totalSpent = round2(
    items.reduce((sum, item) => sum + Number(item?.despesasAteData ?? 0), 0)
  );
  const spentTopics = items.filter((item) => Number(item?.despesasAteData ?? 0) > 0);
  const avgTicket = spentTopics.length ? round2(totalSpent / spentTopics.length) : 0;
  const executionPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const statusCounts = {
    ok: 0,
    proximo: 0,
    limite: 0,
    alerta: 0,
  };

  const grouped = new Map();
  items.forEach((item) => {
    const statusKey = String(item?.statusExecucao?.chave ?? statusFromPercent(item?.percentualExecutado).chave);
    statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
    const key = String(item?.grupo ?? "SEM GRUPO").trim() || "SEM GRUPO";
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        label: String(item?.grupoExibicao ?? getGroupLabelPt(key) ?? key).trim() || key,
        spent: 0,
        budget: 0,
        count: 0,
      });
    }
    const bucket = grouped.get(key);
    bucket.spent += Number(item?.despesasAteData ?? 0);
    bucket.budget += Number(item?.orcamentoProgramaBRL ?? 0);
    bucket.count += 1;
  });

  const groups = [...grouped.values()]
    .map((group) => ({
      ...group,
      spent: round2(group.spent),
      budget: round2(group.budget),
      share: totalSpent > 0 ? (group.spent / totalSpent) * 100 : 0,
    }))
    .sort((a, b) => b.spent - a.spent || a.label.localeCompare(b.label, "pt-BR"));

  const biggestGroup = groups[0] ?? null;
  const sortedBySpent = [...items].sort(
    (a, b) =>
      Number(b?.despesasAteData ?? 0) - Number(a?.despesasAteData ?? 0) ||
      String(a?.nomeExibicao ?? "").localeCompare(String(b?.nomeExibicao ?? ""), "pt-BR")
  );
  const sortedByRemaining = [...items].sort(
    (a, b) =>
      Number(b?.saldoRemanescente ?? 0) - Number(a?.saldoRemanescente ?? 0) ||
      String(a?.nomeExibicao ?? "").localeCompare(String(b?.nomeExibicao ?? ""), "pt-BR")
  );
  const sortedByOverrun = [...items]
    .map((item) => ({
      ...item,
      excesso: round2(Number(item?.despesasAteData ?? 0) - Number(item?.orcamentoProgramaBRL ?? 0)),
    }))
    .filter((item) => item.excesso > 0)
    .sort((a, b) => b.excesso - a.excesso || Number(b?.percentualExecutado ?? 0) - Number(a?.percentualExecutado ?? 0));

  return {
    items,
    groups,
    chips: buildReportFilterChips(),
    totalBudget,
    totalSpent,
    avgTicket,
    executionPercent,
    topicCount: items.length,
    activeGroupCount: groups.length,
    spentTopicsCount: spentTopics.length,
    criticalTopicsCount: (statusCounts.proximo || 0) + (statusCounts.limite || 0) + (statusCounts.alerta || 0),
    overspentCount: statusCounts.alerta || 0,
    statusCounts,
    status: statusFromPercent(executionPercent),
    biggestGroup,
    topSpentTopic: sortedBySpent.find((item) => Number(item?.despesasAteData ?? 0) > 0) ?? null,
    topRemainingTopic: sortedByRemaining.find((item) => Number(item?.saldoRemanescente ?? 0) > 0) ?? null,
    topOverrunTopic: sortedByOverrun[0] ?? null,
  };
}

function renderReportOverview(insights) {
  const saldo = round2(Number(insights.totalBudget || 0) - Number(insights.totalSpent || 0));

  if (refs.reportTotalTopicos) refs.reportTotalTopicos.textContent = String(insights.topicCount || 0);
  if (refs.reportGruposAtivos) refs.reportGruposAtivos.textContent = String(insights.activeGroupCount || 0);
  if (refs.reportTopicosCriticos) refs.reportTopicosCriticos.textContent = String(insights.criticalTopicsCount || 0);
  if (refs.reportTicketMedio) refs.reportTicketMedio.textContent = money(insights.avgTicket || 0);
  if (refs.reportKpiOrcamento) refs.reportKpiOrcamento.textContent = money(insights.totalBudget || 0);
  if (refs.reportKpiGasto) refs.reportKpiGasto.textContent = money(insights.totalSpent || 0);
  if (refs.reportKpiSaldo) refs.reportKpiSaldo.textContent = `Restam ${money(saldo)}`;

  const chipMarkup = (insights.chips || [])
    .map((chip) => `<span class="report-filter-chip">${escapeHtml(chip)}</span>`)
    .join("");
  if (refs.reportFilterSummary) refs.reportFilterSummary.innerHTML = chipMarkup;
  if (refs.reportExportSummary) {
    refs.reportExportSummary.innerHTML = `${chipMarkup}<span class="report-filter-chip">${escapeHtml(`${insights.topicCount} tópicos`)}</span>`;
  }

  if (!refs.reportExecutionGauge) return;
  const gaugePercent = Math.max(0, Math.min(100, Number(insights.executionPercent ?? 0)));
  refs.reportExecutionGauge.style.setProperty("--gauge-fill", `${gaugePercent.toFixed(2)}%`);
  refs.reportExecutionGauge.dataset.status = String(insights.status?.chave ?? "ok");
  if (refs.reportExecutionValue) refs.reportExecutionValue.textContent = percent(insights.executionPercent || 0);
  if (refs.reportGaugeStatus) {
    refs.reportGaugeStatus.className = `legend-item ${insights.status?.chave ?? "ok"}`;
    refs.reportGaugeStatus.textContent = insights.status?.rotulo ?? "Dentro do orçamento";
  }
  if (refs.reportGaugeCopy) {
    refs.reportGaugeCopy.textContent = `${money(insights.totalSpent)} gastos de ${money(insights.totalBudget)} previstos no recorte atual.`;
  }
}

function renderReportExecutiveSummary(insights) {
  if (!refs.reportNarrative || !refs.reportHighlights) return;
  if (!insights.topicCount) {
    refs.reportNarrative.textContent = "Não há tópicos para exibir com os filtros atuais.";
    refs.reportHighlights.innerHTML = '<div class="report-empty-state">Ajuste os filtros para gerar uma leitura executiva.</div>';
    return;
  }

  const totalGroupsText = insights.biggestGroup
    ? `${insights.biggestGroup.label} concentra ${percent(insights.biggestGroup.share)} do gasto total.`
    : "Ainda não há concentração relevante de gastos por grupo.";
  refs.reportNarrative.innerHTML = `Com os filtros atuais, o projeto executou <strong>${escapeHtml(percent(insights.executionPercent))}</strong> do orçamento selecionado. ${escapeHtml(totalGroupsText)} Há <strong>${escapeHtml(String(insights.criticalTopicsCount))}</strong> tópico(s) em zona de atenção.`;

  const highlightItems = [
    insights.biggestGroup
      ? {
          title: "Grupo com maior peso",
          copy: `${insights.biggestGroup.label} · ${money(insights.biggestGroup.spent)}`,
        }
      : null,
    insights.topSpentTopic
      ? {
          title: "Maior gasto individual",
          copy: `${insights.topSpentTopic.nomeExibicao} · ${money(insights.topSpentTopic.despesasAteData)}`,
        }
      : null,
    insights.topRemainingTopic
      ? {
          title: "Maior folga orçamentária",
          copy: `${insights.topRemainingTopic.nomeExibicao} · saldo ${money(insights.topRemainingTopic.saldoRemanescente)}`,
        }
      : null,
  ].filter(Boolean);

  refs.reportHighlights.innerHTML = highlightItems
    .map(
      (item) => `
        <article class="report-highlight-item">
          <strong>${escapeHtml(item.title)}</strong>
          <span class="report-highlight-copy">${escapeHtml(item.copy)}</span>
        </article>
      `
    )
    .join("");
}

function renderReportStatusBreakdown(insights) {
  if (!refs.reportStatusBar || !refs.reportStatusList) return;
  const statuses = [
    { key: "ok", label: "Dentro do orçamento", count: insights.statusCounts.ok || 0 },
    { key: "proximo", label: "Próximo do limite", count: insights.statusCounts.proximo || 0 },
    { key: "limite", label: "No limite", count: insights.statusCounts.limite || 0 },
    { key: "alerta", label: "Ultrapassou", count: insights.statusCounts.alerta || 0 },
  ];

  if (!insights.topicCount) {
    refs.reportStatusBar.innerHTML = "";
    refs.reportStatusList.innerHTML = '<div class="report-empty-state">Sem distribuição de status para os filtros atuais.</div>';
    return;
  }

  refs.reportStatusBar.innerHTML = statuses
    .filter((status) => status.count > 0)
    .map((status) => {
      const width = Math.max(8, (status.count / insights.topicCount) * 100);
      return `<span class="report-status-segment ${status.key}" style="width:${width.toFixed(2)}%"></span>`;
    })
    .join("");

  refs.reportStatusList.innerHTML = statuses
    .map(
      (status) => `
        <article class="report-status-item">
          <small>${escapeHtml(status.label)}</small>
          <strong>${escapeHtml(String(status.count))}</strong>
          <span>${escapeHtml(percent(insights.topicCount ? (status.count / insights.topicCount) * 100 : 0))} dos tópicos</span>
        </article>
      `
    )
    .join("");
}

function getRankingMetric(item, sortMode) {
  if (sortMode === "percent") return Math.max(0, Number(item?.percentualExecutado ?? 0));
  if (sortMode === "remaining") return Math.max(0, Number(item?.saldoRemanescente ?? 0));
  return Math.max(0, Number(item?.despesasAteData ?? 0));
}

function getRankingValueLabel(item, sortMode) {
  if (sortMode === "percent") return percent(Number(item?.percentualExecutado ?? 0));
  if (sortMode === "remaining") return money(Number(item?.saldoRemanescente ?? 0));
  return money(Number(item?.despesasAteData ?? 0));
}

function renderReportRanking(insights) {
  if (!refs.reportRankingList) return;
  refs.reportSortButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.reportSort === state.reportSort);
  });

  if (!insights.topicCount) {
    refs.reportRankingList.innerHTML = '<div class="report-empty-state">Sem tópicos para montar o ranking.</div>';
    return;
  }

  const sortMode = state.reportSort || "spent";
  const items = [...insights.items]
    .sort((a, b) => getRankingMetric(b, sortMode) - getRankingMetric(a, sortMode))
    .slice(0, 8);
  const maxMetric = Math.max(1, ...items.map((item) => getRankingMetric(item, sortMode)));

  refs.reportRankingList.innerHTML = items
    .map((item) => {
      const metric = getRankingMetric(item, sortMode);
      const width = Math.max(6, (metric / maxMetric) * 100);
      const statusKey = String(item?.statusExecucao?.chave ?? statusFromPercent(item?.percentualExecutado).chave);
      return `
        <article class="report-ranking-item">
          <div class="report-ranking-head">
            <div>
              <span class="report-ranking-title">${escapeHtml(item.nomeExibicao)}</span>
              <span class="report-ranking-subtitle">${escapeHtml(item.grupoExibicao)} · ${escapeHtml(item.statusExecucao?.rotulo ?? statusFromPercent(item.percentualExecutado).rotulo)}</span>
            </div>
            <span class="report-ranking-value">${escapeHtml(getRankingValueLabel(item, sortMode))}</span>
          </div>
          <div class="report-ranking-track">
            <div class="report-ranking-fill ${statusKey}" style="width:${width.toFixed(2)}%"></div>
          </div>
          <div class="report-ranking-meta">
            <span>Executado ${escapeHtml(percent(item.percentualExecutado))}</span>
            <span>Saldo ${escapeHtml(money(item.saldoRemanescente))}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderReportAttention(insights) {
  if (!refs.reportAttentionList) return;
  if (!insights.topicCount) {
    refs.reportAttentionList.innerHTML = '<div class="report-empty-state">Sem alertas ou oportunidades para exibir.</div>';
    return;
  }

  const cards = [];
  if (insights.topOverrunTopic) {
    cards.push({
      tone: "alerta",
      title: "Maior estouro de orçamento",
      label: insights.topOverrunTopic.nomeExibicao,
      value: `+ ${money(insights.topOverrunTopic.excesso)}`,
      copy: `${percent(insights.topOverrunTopic.percentualExecutado)} executado.`,
    });
  }
  if (insights.topSpentTopic) {
    cards.push({
      tone: insights.topSpentTopic.percentualExecutado >= 90 ? "proximo" : "ok",
      title: "Maior consumo financeiro",
      label: insights.topSpentTopic.nomeExibicao,
      value: money(insights.topSpentTopic.despesasAteData),
      copy: `${insights.topSpentTopic.grupoExibicao} · orçamento ${money(insights.topSpentTopic.orcamentoProgramaBRL)}`,
    });
  }
  if (insights.topRemainingTopic) {
    cards.push({
      tone: "ok",
      title: "Maior oportunidade de realocação",
      label: insights.topRemainingTopic.nomeExibicao,
      value: money(insights.topRemainingTopic.saldoRemanescente),
      copy: `Saldo remanescente disponível no grupo ${insights.topRemainingTopic.grupoExibicao}.`,
    });
  }
  if (!cards.length && insights.biggestGroup) {
    cards.push({
      tone: "ok",
      title: "Maior concentração por grupo",
      label: insights.biggestGroup.label,
      value: money(insights.biggestGroup.spent),
      copy: `${percent(insights.biggestGroup.share)} do gasto filtrado está concentrado neste grupo.`,
    });
  }

  refs.reportAttentionList.innerHTML = cards
    .slice(0, 4)
    .map(
      (card) => `
        <article class="report-attention-item" data-tone="${escapeHtml(card.tone)}">
          <div class="report-attention-head">
            <div>
              <span class="report-attention-title">${escapeHtml(card.title)}</span>
              <span class="report-attention-label">${escapeHtml(card.label)}</span>
            </div>
            <span class="report-attention-value">${escapeHtml(card.value)}</span>
          </div>
          <span class="report-attention-copy">${escapeHtml(card.copy)}</span>
        </article>
      `
    )
    .join("");
}

function prepareCanvas(canvas, width, height) {
  if (!canvas) return null;
  const safeWidth = Math.max(220, Math.round(width));
  const safeHeight = Math.max(180, Math.round(height));
  const devicePixelRatio = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(safeWidth * devicePixelRatio);
  canvas.height = Math.round(safeHeight * devicePixelRatio);
  canvas.style.width = `${safeWidth}px`;
  canvas.style.height = `${safeHeight}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  ctx.clearRect(0, 0, safeWidth, safeHeight);
  return { ctx, width: safeWidth, height: safeHeight };
}

function drawCanvasMessage(canvas, message, options = {}) {
  const width = options.width ?? canvas?.parentElement?.clientWidth ?? 320;
  const height = options.height ?? 280;
  const prepared = prepareCanvas(canvas, width, height);
  if (!prepared) return;
  const { ctx } = prepared;
  ctx.fillStyle = readThemeColor("--text-secondary", "#7a8ca8");
  ctx.font = "600 15px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(message ?? ""), prepared.width / 2, prepared.height / 2);
}

function renderGroupDistributionState(message) {
  if (!refs.groupDistributionChart) return;
  refs.groupDistributionChart.innerHTML = `<div class="group-distribution-empty">${escapeHtml(message)}</div>`;
}

function renderGroupDistributionChart() {
  if (!refs.groupDistributionChart) return;
  if (state.loading.resumo) {
    renderGroupDistributionState("Carregando distribuicao...");
    return;
  }

  const items = getReportChartItems();
  const grouped = new Map();
  for (const item of items) {
    const key = String(item?.grupo ?? "SEM GRUPO").trim() || "SEM GRUPO";
    if (!grouped.has(key)) {
      grouped.set(key, {
        label: String(item?.grupoExibicao ?? getGroupLabelPt(key) ?? key).trim() || key,
        spent: 0,
      });
    }
    const bucket = grouped.get(key);
    bucket.spent += Number(item?.despesasAteData ?? 0);
  }

  const entries = [...grouped.values()]
    .map((entry) => ({
      label: entry.label,
      spent: round2(entry.spent),
    }))
    .filter((entry) => entry.spent > 0)
    .sort((a, b) => b.spent - a.spent || a.label.localeCompare(b.label, "pt-BR"));

  const totalSpent = entries.reduce((sum, entry) => sum + entry.spent, 0);
  if (entries.length === 0 || totalSpent <= 0) {
    renderGroupDistributionState("Sem gastos para os filtros atuais.");
    return;
  }

  const maxSpent = Math.max(1, ...entries.map((entry) => entry.spent));
  refs.groupDistributionChart.innerHTML = entries
    .map((entry) => {
      const share = totalSpent > 0 ? (entry.spent / totalSpent) * 100 : 0;
      const widthPercent = Math.max(4, (entry.spent / maxSpent) * 100);
      return `
        <article class="group-distribution-item">
          <div class="group-distribution-head">
            <span class="group-distribution-label">${escapeHtml(entry.label)}</span>
            <span class="group-distribution-value">${escapeHtml(money(entry.spent))}</span>
          </div>
          <div class="group-distribution-track">
            <div class="group-distribution-fill" style="width:${widthPercent.toFixed(2)}%"></div>
          </div>
          <div class="group-distribution-meta">${escapeHtml(percent(share))} do total</div>
        </article>
      `;
    })
    .join("");
}

function renderBudgetVsSpentChart() {
  if (!refs.chartBar) return;
  if (state.loading.resumo) {
    drawCanvasMessage(refs.chartBar, "Carregando comparativo...", { width: 640, height: 320 });
    return;
  }

  const items = getReportChartItems()
    .filter(
      (item) => Number(item?.orcamentoProgramaBRL ?? 0) > 0 || Number(item?.despesasAteData ?? 0) > 0
    )
    .sort(
      (a, b) =>
        Math.max(Number(b?.despesasAteData ?? 0), Number(b?.orcamentoProgramaBRL ?? 0)) -
          Math.max(Number(a?.despesasAteData ?? 0), Number(a?.orcamentoProgramaBRL ?? 0)) ||
        String(a?.nomeExibicao ?? "").localeCompare(String(b?.nomeExibicao ?? ""), "pt-BR")
    )
    .slice(0, 8);

  if (items.length === 0) {
    drawCanvasMessage(refs.chartBar, "Sem tópicos para comparar.", { width: 640, height: 320 });
    return;
  }

  const containerWidth = refs.chartBar.parentElement?.clientWidth || 640;
  const width = Math.max(560, containerWidth);
  const height = Math.max(280, 88 + items.length * 44);
  const prepared = prepareCanvas(refs.chartBar, width, height);
  if (!prepared) return;
  const { ctx } = prepared;

  const palette = {
    budget: readThemeColor("--primary", "#3b82f6"),
    spent: readThemeColor("--danger", "#d13d50"),
    track: readThemeColor("--border", "#d2deef"),
    text: readThemeColor("--text-main", "#edf3ff"),
    muted: readThemeColor("--text-secondary", "#7a8ca8"),
  };

  const labelColumnWidth = 190;
  const valueColumnWidth = 160;
  const chartWidth = width - labelColumnWidth - valueColumnWidth - 24;
  const chartStartX = labelColumnWidth;
  const chartEndX = chartStartX + chartWidth;
  const rowStartY = 56;
  const rowHeight = 44;
  const maxValue = Math.max(
    1,
    ...items.map((item) =>
      Math.max(Number(item?.orcamentoProgramaBRL ?? 0), Number(item?.despesasAteData ?? 0))
    )
  );

  ctx.font = "600 12px Manrope, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillStyle = palette.muted;
  ctx.fillText("Orçamento", chartStartX, 18);
  ctx.fillStyle = palette.budget;
  ctx.fillRect(chartStartX + 68, 13, 24, 8);
  ctx.fillStyle = palette.muted;
  ctx.fillText("Gasto", chartStartX + 112, 18);
  ctx.fillStyle = palette.spent;
  ctx.fillRect(chartStartX + 150, 13, 24, 8);

  items.forEach((item, index) => {
    const budget = round2(Number(item?.orcamentoProgramaBRL ?? 0));
    const spent = round2(Number(item?.despesasAteData ?? 0));
    const budgetWidth = (budget / maxValue) * chartWidth;
    const spentWidth = (spent / maxValue) * chartWidth;
    const rowY = rowStartY + index * rowHeight;

    ctx.fillStyle = palette.text;
    ctx.font = "600 12px Manrope, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(truncateChartLabel(item?.nomeExibicao ?? item?.nome ?? item?.topicoId ?? ""), 0, rowY);

    ctx.fillStyle = palette.track;
    ctx.fillRect(chartStartX, rowY - 12, chartWidth, 8);
    ctx.fillRect(chartStartX, rowY + 2, chartWidth, 8);

    ctx.fillStyle = palette.budget;
    ctx.fillRect(chartStartX, rowY - 12, budgetWidth, 8);

    ctx.fillStyle = palette.spent;
    ctx.fillRect(chartStartX, rowY + 2, spentWidth, 8);

    ctx.fillStyle = palette.muted;
    ctx.textAlign = "right";
    ctx.fillText(`${money(spent)} / ${money(budget)}`, width - 2, rowY - 1);
  });

  ctx.strokeStyle = palette.track;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chartStartX, rowStartY - 26);
  ctx.lineTo(chartEndX, rowStartY - 26);
  ctx.stroke();
}

function renderReportCharts() {
  if (state.activeView !== "relatorios") return;
  const insights = getReportInsights();
  renderReportOverview(insights);
  renderReportExecutiveSummary(insights);
  renderReportStatusBreakdown(insights);
  renderReportRanking(insights);
  renderReportAttention(insights);
  renderGroupDistributionChart();
  renderBudgetVsSpentChart();
}

function renderTeamHiresToggle() {
  if (!canManageConfig()) {
    refs.toggleTeamHires.hidden = true;
    if (refs.teamHiresHint) refs.teamHiresHint.hidden = true;
    return;
  }

  refs.toggleTeamHires.hidden = false;
  if (refs.teamHiresHint) refs.teamHiresHint.hidden = false;
  const unlocked = Boolean(state.teamHiresUnlocked);
  refs.toggleTeamHires.classList.toggle("unlocked", unlocked);
  refs.toggleTeamHires.classList.toggle("locked", !unlocked);
  refs.toggleTeamHires.setAttribute("aria-pressed", unlocked ? "true" : "false");
  refs.teamHiresText.textContent = unlocked ? "Desbloqueado" : "Travado";
  refs.toggleTeamHires.title = unlocked
    ? "Clique para travar contratações da equipe"
    : "Clique para desbloquear contratações da equipe";
  if (refs.teamHiresHint) {
    refs.teamHiresHint.textContent = unlocked
      ? "Modo desbloqueado. Clique para travar."
      : "Modo travado. Clique para desbloquear.";
  }
}

function getStoredTheme() {
  const saved = window.localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme, options = {}) {
  const persist = options.persist !== false;
  const isDark = theme === "dark";
  document.body.classList.toggle("theme-dark", isDark);
  if (refs.themeToggle) {
    refs.themeToggle.checked = isDark;
    refs.themeToggle.setAttribute("aria-checked", isDark ? "true" : "false");
    refs.themeToggle.setAttribute("title", isDark ? "Ativar tema claro" : "Ativar tema escuro");
  }
  if (persist) {
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }
}

function setConfigRenderer(useReactConfig) {
  if (refs.configLegacyShell) {
    refs.configLegacyShell.hidden = Boolean(useReactConfig);
  }
  if (refs.configReactRoot) {
    refs.configReactRoot.hidden = !useReactConfig;
  }
}

function ensureConfigReactStylesheet() {
  if (configReactRuntime.stylePromise) {
    return configReactRuntime.stylePromise;
  }

  configReactRuntime.stylePromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(CONFIG_REACT_STYLE_ID);
    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.id = CONFIG_REACT_STYLE_ID;
    link.rel = "stylesheet";
    link.href = CONFIG_REACT_CSS;
    link.onload = () => resolve();
    link.onerror = () =>
      reject(new Error("Não foi possível carregar os estilos React de configuração."));
    document.head.appendChild(link);
  });

  return configReactRuntime.stylePromise;
}

async function ensureConfigReactMounted() {
  if (!refs.configReactRoot) {
    return false;
  }
  if (configReactRuntime.mounted) {
    setConfigRenderer(true);
    return true;
  }
  if (configReactRuntime.failed) {
    setConfigRenderer(false);
    return false;
  }
  if (configReactRuntime.mountPromise) {
    return configReactRuntime.mountPromise;
  }

  configReactRuntime.mountPromise = (async () => {
    try {
      await ensureConfigReactStylesheet();
      const mod = await import(CONFIG_REACT_BUNDLE);
      if (typeof mod.mountConfigApp !== "function") {
        throw new Error("Bundle React inválido: mountConfigApp ausente.");
      }

      const unmount = mod.mountConfigApp({
        root: refs.configReactRoot,
        onError: (message) => {
          if (message) toast(message);
        },
      });
      configReactRuntime.unmount = typeof unmount === "function" ? unmount : null;
      configReactRuntime.mounted = true;
      setConfigRenderer(true);
      return true;
    } catch (error) {
      configReactRuntime.failed = true;
      if (!configReactRuntime.failureToastShown) {
        toast(
          "Falha ao carregar a nova tela de configurações. Rode `npm run build:ui` e recarregue a página."
        );
        configReactRuntime.failureToastShown = true;
      }
      setConfigRenderer(false);
      console.error("[config-react] erro ao montar configurações:", error);
      return false;
    } finally {
      configReactRuntime.mountPromise = null;
    }
  })();

  return configReactRuntime.mountPromise;
}

function setEditMode(enabled) {
  const allowed = canManageConfig();
  state.editMode = Boolean(enabled) && allowed;
  document.body.classList.toggle("edit-mode", state.editMode);
  if (refs.toggleEditMode) {
    refs.toggleEditMode.checked = state.editMode;
    refs.toggleEditMode.disabled = !allowed;
    refs.toggleEditMode.setAttribute("aria-checked", state.editMode ? "true" : "false");
  }
  if (refs.editModeState) {
    refs.editModeState.textContent = state.editMode ? "Ativado" : "Desativado";
  }
  if (refs.btnAddTopico) {
    refs.btnAddTopico.disabled = !state.editMode || !allowed;
    refs.btnAddTopico.hidden = !allowed || !state.editMode;
  }
}

function applyPermissionUI() {
  const permissions = getAuthPermissions();
  const configNav = [...refs.navLinks].find((btn) => btn.dataset.view === "config");

  if (configNav) {
    configNav.hidden = !permissions.canManageConfig;
    if (!permissions.canManageConfig && configNav.classList.contains("active")) {
      configNav.classList.remove("active");
      setView("resumo");
    }
  }

  if (refs.btnNovaCompra) refs.btnNovaCompra.disabled = !permissions.canWriteLancamentos;
  if (refs.toggleTeamHires) refs.toggleTeamHires.hidden = !permissions.canManageConfig;
  if (refs.teamHiresHint) refs.teamHiresHint.hidden = !permissions.canManageConfig;
  if (refs.editModeControl) refs.editModeControl.hidden = !permissions.canManageConfig;
  if (refs.configGroupFilter) refs.configGroupFilter.disabled = !permissions.canManageConfig;

  // Admin link visibility
  const adminLink = document.getElementById("btn-admin-link");
  if (adminLink) adminLink.hidden = !permissions.canManageUsers;

  if (!permissions.canManageConfig) {
    setEditMode(false);
  } else {
    setEditMode(state.editMode);
  }
}

function syncProjectNavigationUI() {
  const allowedProjects = getCurrentAllowedProjects();
  const isProjectAccount =
    String(state.auth?.accountType ?? "user")
      .trim()
      .toLowerCase() === "project";
  const activeProjectCode = String(state.auth?.projectCode ?? state.auth?.activeProjectCode ?? "").trim();
  const normalizedActiveProjectCode = activeProjectCode.toUpperCase();
  const normalizedUsername = String(state.auth?.username ?? "").trim().toUpperCase();
  const allowedProjectCodeSet = new Set(
    allowedProjects
      .map((project) => String(project?.code ?? "").trim().toUpperCase())
      .filter(Boolean)
  );
  const usernameMatchesAnyAllowedProject =
    normalizedUsername && allowedProjectCodeSet.has(normalizedUsername);
  const isProjectIdentitySession =
    isProjectAccount ||
    Boolean(normalizedActiveProjectCode && normalizedUsername === normalizedActiveProjectCode) ||
    Boolean(usernameMatchesAnyAllowedProject);
  const canNavigateHub = allowedProjects.length > 1 && !isProjectIdentitySession;

  if (refs.hubLink) {
    refs.hubLink.hidden = !canNavigateHub;
  }

  if (refs.projectSwitcherWrap) {
    refs.projectSwitcherWrap.hidden = !canNavigateHub;
  }

  if (!refs.projectSwitcher) return;

  if (!canNavigateHub) {
    refs.projectSwitcher.innerHTML = "";
    refs.projectSwitcher.disabled = true;
    return;
  }

  const options = [];
  if (!activeProjectCode) {
    options.push('<option value="">Selecione um projeto</option>');
  }
  for (const project of allowedProjects) {
    const selected = project.code === activeProjectCode ? " selected" : "";
    options.push(
      `<option value="${escapeHtml(project.code)}"${selected}>${escapeHtml(project.code)} - ${escapeHtml(project.brandName || project.name || project.code)}</option>`
    );
  }

  refs.projectSwitcher.innerHTML = options.join("");
  refs.projectSwitcher.value = activeProjectCode || "";
  refs.projectSwitcher.disabled = false;
}

function syncProjectBranding() {
  const projectCode = String(state.auth?.projectCode ?? "").trim();
  const projectName = String(state.auth?.projectBrandName ?? state.auth?.projectName ?? "").trim();
  const displayCode = projectCode || "PROJETO";
  const displayName =
    projectName ||
    (state.auth?.requiresProjectSelection ? "Selecione o projeto" : "Não selecionado");

  if (refs.brandProjectCode) refs.brandProjectCode.textContent = displayCode;
  if (refs.brandProjectName) refs.brandProjectName.textContent = displayName;
  document.title = `Gestão Orçamentária | ${displayName}`;
}

function applyAuthStatus(status) {
  const permissions = status?.permissions ?? {};
  const allowedProjects = normalizeAllowedProjects(status?.allowedProjects, []);
  const accountType =
    String(status?.accountType ?? "user")
      .trim()
      .toLowerCase() === "project"
      ? "project"
      : "user";

  const activeProjectCode = String(status?.activeProjectCode ?? status?.projectCode ?? "").trim();
  const activeProject = allowedProjects.find((project) => project.code === activeProjectCode);
  state.auth = {
    username: String(status?.username ?? ""),
    projectCode: activeProjectCode,
    activeProjectCode,
    accountType,
    projectName: String(status?.projectName ?? activeProject?.name ?? ""),
    projectBrandName: String(
      status?.projectBrandName ?? activeProject?.brandName ?? activeProject?.name ?? ""
    ),
    allowedProjects,
    requiresProjectSelection: Boolean(status?.requiresProjectSelection),
    role: String(status?.role ?? "viewer"),
    permissions: {
      canWriteLancamentos: Boolean(permissions.canWriteLancamentos),
      canManageConfig: Boolean(permissions.canManageConfig),
      canViewDiagnostics: Boolean(permissions.canViewDiagnostics),
      canManageUsers: Boolean(permissions.canManageUsers),
    },
  };

  syncProjectBranding();
  applyPermissionUI();
  syncProjectNavigationUI();
}

async function loadAuthStatus() {
  const status = await request("/api/auth/status");
  if (!status?.authenticated) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  applyAuthStatus(status);
}

function isProjectSelectionPending() {
  const allowed = getCurrentAllowedProjects();
  state.auth.allowedProjects = allowed;
  const hasActiveProject = Boolean(String(state.auth?.projectCode ?? "").trim());
  return allowed.length > 1 && (!hasActiveProject || state.auth?.requiresProjectSelection === true);
}

function disableLegacyProjectPicker() {
  document.body.classList.remove("project-picker-open");
  if (!refs.projectPicker) return;
  refs.projectPicker.hidden = true;
  refs.projectPicker.setAttribute("aria-hidden", "true");
  try {
    refs.projectPicker.remove();
  } catch {
    // Ignore if removal is not possible.
  }
}

async function ensureProjectSelection() {
  if (!isProjectSelectionPending()) return;
  redirectToHub({ replace: true });
  return new Promise(() => {});
}

function syncToolbar(viewName) {
  state.activeView = viewName;
  const meta = VIEW_TOOLBAR_META[viewName] ?? VIEW_TOOLBAR_META.resumo;
  const showFilters = Boolean(meta.showFilters);
  const showSaldo = Boolean(meta.showSaldo);
  const showApply = Boolean(meta.showApply);
  const showClear = Boolean(meta.showClear);
  const showToolbar = viewName !== "config";

  if (refs.toolbar) refs.toolbar.hidden = !showToolbar;

  if (refs.toolbarTitle) refs.toolbarTitle.textContent = meta.title;
  if (refs.toolbarSubtitle) refs.toolbarSubtitle.textContent = meta.subtitle;

  if (refs.toolbarFilters) refs.toolbarFilters.hidden = !showFilters;
  if (refs.headerBalanceContainer) refs.headerBalanceContainer.hidden = !showSaldo;
  if (refs.toolbar) {
    refs.toolbar.classList.toggle("resumo-hero", showSaldo);
    refs.toolbar.classList.toggle("compact", !showSaldo);
  }
  if (refs.applyFilters) {
    refs.applyFilters.hidden = !showApply;
    refs.applyFilters.textContent = getApplyLabelForView(viewName);
  }
  if (refs.clearFilters) refs.clearFilters.hidden = !showClear;
  syncLoadingUI();
}

function setView(viewName) {
  if (viewName === "config" && !canManageConfig()) {
    viewName = "resumo";
  }

  refs.navLinks.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });
  syncNavAriaCurrent(viewName);

  refs.views.forEach((view) => {
    const isActive = view.id === `view-${viewName}`;
    view.classList.toggle("active", isActive);
  });

  syncToolbar(viewName);

  if (viewName === "config") {
    void ensureConfigReactMounted();
  }
  if (viewName === "relatorios") {
    renderReportCharts();
  }
}

function getInitialViewFromLocation() {
  const aliases = {
    dashboard: "resumo",
    resumo: "resumo",
    topicos: "topicos",
    relatorio: "relatorios",
    relatorios: "relatorios",
    reports: "relatorios",
    config: "config",
    configuracao: "config",
    configuracoes: "config",
  };

  const normalize = (value) =>
    String(value ?? "")
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const queryParams = new URLSearchParams(window.location.search);
  const queryView = aliases[normalize(queryParams.get("view"))];
  if (queryView && VIEW_TOOLBAR_META[queryView]) return queryView;

  const hashView = aliases[normalize(window.location.hash.replace(/^#/, ""))];
  if (hashView && VIEW_TOOLBAR_META[hashView]) return hashView;

  return "";
}

function renderResumo() {
  renderResumoHeader();
  renderResumoKpis();
  const totalMode = isTotalMode();
  const emptyColspan = totalMode ? 4 : 6;
  const normalizedSearch = normalizeSearchText(state.filters.search);

  if (state.loading.resumo) {
    refs.resumoBody.innerHTML = `<tr><td colspan="${emptyColspan}" class="empty-cell loading-cell"><span class="loading-inline">Carregando resumo...</span></td></tr>`;
    return;
  }

  const groupedTopicos = getGroupedTopicos({ incluirApenasResumo: true })
    .map((group) => ({
      ...group,
      items: normalizedSearch
        ? (group.items ?? []).filter(
            (item) =>
              quickSearchMatches(item.nomeExibicao, normalizedSearch) ||
              quickSearchMatches(item.grupoExibicao, normalizedSearch)
          )
        : group.items,
    }))
    .filter((group) => Array.isArray(group.items) && group.items.length > 0);
  const totalTopicosResumo = groupedTopicos.reduce(
    (count, group) => count + (Array.isArray(group.items) ? group.items.length : 0),
    0
  );

  if (totalTopicosResumo === 0) {
    const emptyMessage = normalizedSearch
      ? "Nenhum tópico encontrado para a busca informada."
      : "Nenhum dado para os filtros atuais.";
    refs.resumoBody.innerHTML = `<tr><td colspan="${emptyColspan}" class="empty-cell">${emptyMessage}</td></tr>`;
  } else {
    refs.resumoBody.innerHTML = groupedTopicos
      .map(({ groupName, items }) => {
        const expanded = isResumoGroupExpanded(groupName);
        const icon = expanded ? "▼" : "▶";
        const totalGroupOrcamento = items.reduce((sum, item) => sum + item.orcamentoProgramaBRL, 0);
        const totalGroupAnteriores = items.reduce((sum, item) => sum + item.despesasAnteriores, 0);
        const totalGroupPeriodo = items.reduce((sum, item) => sum + item.despesasPeriodo, 0);
        const totalGroupAteData = items.reduce((sum, item) => sum + item.despesasAteData, 0);
        const totalGroupSaldo = items.reduce((sum, item) => sum + item.saldoRemanescente, 0);
        const totalGroupPercentual =
          totalGroupOrcamento > 0 ? (totalGroupAteData / totalGroupOrcamento) * 100 : 0;
        const statusGroup = statusFromPercent(totalGroupPercentual);
        const toneGroup = toneClassFromStatus(statusGroup);

        if (totalMode) {
          const rows = expanded
            ? items
                .map((item) => {
                  const selectedClass =
                    item.topicoId === state.selectedTopicoId ? "clickable selected" : "clickable";
                  const rowClass = `${selectedClass} topic-row ${item.statusExecucao?.chave === "alerta" ? "over-budget" : ""}`;
                  const safeTopicoId = escapeHtml(item.topicoId);
                  const safeNomeExibicao = escapeHtml(item.nomeExibicao);
                  const blockedLabel = item.permitirLancamento
                    ? ""
                    : `<span class="muted-label">Bloqueado</span>`;
                  const toneItem = toneClassFromStatus(item.statusExecucao);

                  return `<tr class="${rowClass}" data-topic-row="${safeTopicoId}">
                    <td>
                      <div class="topic-cell">
                        <span>${safeNomeExibicao}</span>
                        ${blockedLabel}
                      </div>
                    </td>
                    <td>${money(item.orcamentoProgramaBRL)}</td>
                    <td>
                      <strong class="metric-value ${toneItem}">${money(item.despesasAteData)}</strong>
                    </td>
                    <td>${money(item.saldoRemanescente)}</td>
                  </tr>`;
                })
                .join("")
            : "";

          const safeGroupName = escapeHtml(groupName);
          const safeGroupLabel = escapeHtml(getGroupLabelPt(groupName));
          return `<tr class="group-row clickable" data-group-toggle="${safeGroupName}">
              <td>
                <div class="group-title-cell">
                  <span>${icon} ${safeGroupLabel}</span>
                  <small>${expanded ? "Clique para recolher" : "Clique para expandir"}</small>
                </div>
              </td>
              <td><strong>${money(totalGroupOrcamento)}</strong></td>
              <td>
                <strong class="metric-value ${toneGroup}">${money(totalGroupAteData)}</strong>
              </td>
              <td><strong>${money(totalGroupSaldo)}</strong></td>
            </tr>${rows}`;
        }

        const rows = expanded
          ? items
              .map((item) => {
                const selectedClass =
                  item.topicoId === state.selectedTopicoId ? "clickable selected" : "clickable";
                const rowClass = `${selectedClass} topic-row ${item.statusExecucao?.chave === "alerta" ? "over-budget" : ""}`;
                const safeTopicoId = escapeHtml(item.topicoId);
                const safeNomeExibicao = escapeHtml(item.nomeExibicao);
                const blockedLabel = item.permitirLancamento
                  ? ""
                  : `<span class="muted-label">Bloqueado</span>`;
                const toneItem = toneClassFromStatus(item.statusExecucao);

                return `<tr class="${rowClass}" data-topic-row="${safeTopicoId}">
                  <td>
                    <div class="topic-cell">
                      <span>${safeNomeExibicao}</span>
                      ${blockedLabel}
                    </div>
                  </td>
                  <td>${money(item.orcamentoProgramaBRL)}</td>
                  <td>${money(item.despesasAnteriores)}</td>
                  <td>${money(item.despesasPeriodo)}</td>
                  <td>
                    <strong class="metric-value ${toneItem}">${money(item.despesasAteData)}</strong>
                  </td>
                  <td>${money(item.saldoRemanescente)}</td>
                </tr>`;
              })
              .join("")
          : "";

        const safeGroupName = escapeHtml(groupName);
        const safeGroupLabel = escapeHtml(getGroupLabelPt(groupName));
        return `<tr class="group-row clickable" data-group-toggle="${safeGroupName}">
            <td>
              <div class="group-title-cell">
                <span>${icon} ${safeGroupLabel}</span>
                <small>${expanded ? "Clique para recolher" : "Clique para expandir"}</small>
              </div>
            </td>
            <td><strong>${money(totalGroupOrcamento)}</strong></td>
            <td><strong>${money(totalGroupAnteriores)}</strong></td>
            <td><strong>${money(totalGroupPeriodo)}</strong></td>
            <td>
              <strong class="metric-value ${toneGroup}">${money(totalGroupAteData)}</strong>
            </td>
            <td><strong>${money(totalGroupSaldo)}</strong></td>
          </tr>${rows}`;
      })
      .join("");
  }

  const saldoIndicadores = Number(state.resumo?.indicadores?.saldoRemanescente);
  const saldoLinhas = Array.isArray(state.resumo?.rows)
    ? state.resumo.rows.reduce((sum, row) => sum + Number(row?.saldoRemanescente ?? 0), 0)
    : 0;
  const saldoHeader = Number.isFinite(saldoIndicadores)
    ? saldoIndicadores
    : Number.isFinite(saldoLinhas)
      ? saldoLinhas
      : 0;

  if (refs.headerBalanceValue) {
    refs.headerBalanceValue.textContent = money(saldoHeader);
  }
}

function renderDetalhes() {
  const topicoNome = getTopicoNome(state.selectedTopicoId);
  refs.detalhesTitulo.textContent = `Detalhes do Tópico: ${topicoNome}`;
  refs.detalhesTotal.textContent = money(state.detalhes.total || 0);
  const normalizedSearch = normalizeSearchText(state.filters.search);

  if (state.loading.detalhes) {
    refs.detalhesBody.innerHTML =
      '<tr><td colspan="7" class="empty-cell loading-cell"><span class="loading-inline">Carregando detalhes...</span></td></tr>';
    return;
  }

  if (!state.selectedTopicoId) {
    refs.detalhesBody.innerHTML = `<tr><td colspan="7" class="empty-cell">Selecione um tópico no resumo.</td></tr>`;
    return;
  }

  if (!state.detalhes.items.length) {
    refs.detalhesBody.innerHTML = `<tr><td colspan="7" class="empty-cell">Sem lançamentos neste tópico para os filtros atuais.</td></tr>`;
    return;
  }

  const filteredItems = normalizedSearch
    ? state.detalhes.items.filter(
        (item) =>
          quickSearchMatches(item?.descricao, normalizedSearch) ||
          quickSearchMatches(item?.fornecedor, normalizedSearch) ||
          quickSearchMatches(item?.responsavel, normalizedSearch)
      )
    : state.detalhes.items;

  const filteredTotal = filteredItems.reduce((sum, item) => sum + Number(item?.valor ?? 0), 0);
  refs.detalhesTotal.textContent = money(
    normalizedSearch ? filteredTotal : state.detalhes.total || 0
  );

  if (filteredItems.length === 0) {
    refs.detalhesBody.innerHTML = `<tr><td colspan="7" class="empty-cell">Nenhum lançamento encontrado para a busca informada.</td></tr>`;
    return;
  }

  refs.detalhesBody.innerHTML = filteredItems
    .map((item) => {
      const actionsCell = canWriteLancamentos()
        ? `<div class="row-actions">
          <button class="ghost" data-edit-id="${escapeHtml(item.id)}">Editar</button>
          <button class="delete-btn" data-delete-id="${escapeHtml(item.id)}">Excluir</button>
        </div>`
        : '<span class="muted-label">Somente leitura</span>';

      return `<tr>
      <td>${dateBr(item.data)}</td>
      <td>${escapeHtml(item.descricao)}</td>
      <td>${escapeHtml(item.fornecedor || "-")}</td>
      <td>${escapeHtml(item.responsavel || "-")}</td>
      <td>${money(item.valor)}</td>
      <td><span class="badge">${escapeHtml(item.semestre)}</span></td>
      <td>
        ${actionsCell}
      </td>
    </tr>`;
    })
    .join("");
}

function renderTopicosGrid() {
  const groupedTopicos = getGroupedTopicos();
  refs.topicosCount.textContent = `${state.topicos.length} tópicos`;

  refs.topicosGrid.innerHTML = groupedTopicos
    .map(({ groupName, items }) => {
      const expanded = isTopicosGroupExpanded(groupName);
      const icon = expanded ? "▼" : "▶";
      const totalGroupAteData = items.reduce((sum, item) => sum + item.despesasAteData, 0);

      const cards = expanded
        ? items
            .map((item) => {
              const statusLabel = item.permitirLancamento
                ? "Ativo para lançamento"
                : "Bloqueado (RH)";
              const buttonClass = item.permitirLancamento ? "primary" : "ghost";
              const valueClass = `topico-value ${toneClassFromStatus(item.statusExecucao)}`;
              const safeTopicoId = escapeHtml(item.topicoId);
              const safeNomeExibicao = escapeHtml(item.nomeExibicao);
              const safeStatusLabel = escapeHtml(statusLabel);
              return `<article class="topico-card">
                <h4>${safeNomeExibicao}</h4>
                <small>${safeStatusLabel}</small>
                <strong class="${valueClass}">${money(item.despesasAteData)}</strong>
                <button class="${buttonClass}" data-open-topic="${safeTopicoId}">Ver detalhes</button>
              </article>`;
            })
            .join("")
        : `<p class="group-collapsed-note">Grupo oculto. Clique para expandir.</p>`;

      const safeGroupName = escapeHtml(groupName);
      const safeGroupLabel = escapeHtml(getGroupLabelPt(groupName));
      return `<section class="topico-group">
        <button class="topico-group-toggle" data-group-toggle-topicos="${safeGroupName}">
          <span>${icon} ${safeGroupLabel}</span>
          <strong>${money(totalGroupAteData)}</strong>
        </button>
        <div class="topicos-group-grid">${cards}</div>
      </section>`;
    })
    .join("");
}

function getCompraGroups() {
  const ativos = getTopicosAtivos();
  const groups = getGroupsFromTopicos().filter((groupName) => {
    if (isTeamHiresGroup(groupName) && !state.teamHiresUnlocked) return false;
    return ativos.some((topico) => getTopicoDisplayGroup(topico) === groupName);
  });
  return [ALL_GROUPS_OPTION, ...groups];
}

function fillCompraGrupoSelect() {
  const groups = getCompraGroups();
  refs.compraGrupo.innerHTML = groups
    .map((groupName) => {
      if (groupName === ALL_GROUPS_OPTION) {
        return `<option value="${ALL_GROUPS_OPTION}">Todos os tópicos</option>`;
      }
      return `<option value="${escapeHtml(groupName)}">${escapeHtml(getGroupLabelPt(groupName))}</option>`;
    })
    .join("");

  if (!groups.includes(state.selectedCompraGrupo)) {
    state.selectedCompraGrupo = groups[0] ?? ALL_GROUPS_OPTION;
  }
  refs.compraGrupo.value = state.selectedCompraGrupo;
}

function fillTopicoSelect() {
  const ativos = getTopicosAtivos();
  const filtrados =
    state.selectedCompraGrupo === ALL_GROUPS_OPTION
      ? ativos
      : ativos.filter((topico) => getTopicoDisplayGroup(topico) === state.selectedCompraGrupo);

  if (filtrados.length === 0) {
    refs.compraTopico.innerHTML = `<option value="">Sem tópicos disponíveis</option>`;
    refs.compraTopico.value = "";
    return;
  }

  refs.compraTopico.innerHTML = filtrados
    .map(
      (topico) =>
        `<option value="${escapeHtml(topico.id)}">${escapeHtml(getTopicLabelPt(topico.nome))}</option>`
    )
    .join("");

  if (!filtrados.some((topico) => topico.id === refs.compraTopico.value)) {
    refs.compraTopico.value = filtrados[0]?.id ?? "";
  }
}

function getAnosFallback() {
  const anoAtual = new Date().getFullYear();
  return [...new Set([2024, 2025, anoAtual])].sort((a, b) => a - b);
}

function renderAnoOptions(anos) {
  const options = [
    `<option value="">Total (todas as datas)</option>`,
    ...anos.map((ano) => `<option value="${ano}">${ano}</option>`),
  ];
  refs.ano.innerHTML = options.join("");
}

async function loadFiltros() {
  let anos = getAnosFallback();
  renderAnoOptions(anos);

  try {
    const meta = await request("/api/filtros");
    const apiAnos = Array.isArray(meta?.anos)
      ? meta.anos.map((ano) => Number(ano)).filter(Number.isFinite)
      : [];
    if (apiAnos.length > 0) {
      anos = [...new Set([...apiAnos, new Date().getFullYear()])].sort((a, b) => a - b);
      renderAnoOptions(anos);
    }
  } catch {
    // fallback ja aplicado acima
  }

  if (state.filters.ano && !anos.some((ano) => String(ano) === String(state.filters.ano))) {
    state.filters.ano = String(anos[anos.length - 1] ?? new Date().getFullYear());
    state.filters.semestre = "";
  }
  syncFilterInputs();
}

async function loadTeamHiresConfig() {
  if (!canManageConfig()) {
    state.teamHiresUnlocked = false;
    renderTeamHiresToggle();
    return;
  }

  try {
    const config = await request("/api/config/topicos-travados");
    state.teamHiresUnlocked = Boolean(config?.teamHiresUnlocked);
  } catch {
    state.teamHiresUnlocked = false;
  }
  renderTeamHiresToggle();
}

function fillConfigGroupFilter() {
  if (!refs.configGroupFilter) return;
  const groups = getGroupsFromTopicos();
  const totalGroups = groups.length;
  const allLabel =
    totalGroups > 0 ? `Todos os macro-tópicos (${totalGroups})` : "Todos os macro-tópicos";
  refs.configGroupFilter.innerHTML = [
    `<option value="${ALL_CONFIG_GROUPS_OPTION}">${allLabel}</option>`,
    ...groups.map(
      (groupName) =>
        `<option value="${escapeHtml(groupName)}">${escapeHtml(getGroupLabelPt(groupName))}</option>`
    ),
  ].join("");

  if (
    !groups.includes(state.configGroupFilter) &&
    state.configGroupFilter !== ALL_CONFIG_GROUPS_OPTION
  ) {
    state.configGroupFilter = ALL_CONFIG_GROUPS_OPTION;
  }

  refs.configGroupFilter.value = state.configGroupFilter;
}

function getConfigTopicosFiltered() {
  if (state.configGroupFilter === ALL_CONFIG_GROUPS_OPTION) {
    return state.topicos;
  }
  return state.topicos.filter(
    (topico) => getTopicoDisplayGroup(topico) === state.configGroupFilter
  );
}

function fillTopicGroupSelect() {
  if (!refs.topicGroup) return;
  const groups = getGroupsFromTopicos();
  refs.topicGroup.innerHTML = groups
    .map(
      (groupName) =>
        `<option value="${escapeHtml(groupName)}">${escapeHtml(getGroupLabelPt(groupName))}</option>`
    )
    .join("");

  if (!groups.some((groupName) => groupName === refs.topicGroup.value)) {
    refs.topicGroup.value = groups[0] ?? "COMMUNICATIONS & PUBLICATIONS";
  }
}

async function loadTopicos() {
  const payload = await request("/api/topicos");
  const loadedTopicos = Array.isArray(payload) ? payload : [];
  state.topicos = loadedTopicos.map((topico) => ({
    ...topico,
    grupo: normalizeGroupName(topico?.grupo),
  }));
  state.configTopicDrafts = Object.fromEntries(
    state.topicos.map((topico) => [
      topico.id,
      {
        nome: topico.nome,
        grupo: getTopicoDisplayGroup(topico),
        orcamentoProgramaBRL: Number(topico.orcamentoProgramaBRL ?? 0),
        incluirNoResumo: Boolean(topico.incluirNoResumo),
        permitirLancamento: Boolean(topico.permitirLancamento),
      },
    ])
  );
  fillCompraGrupoSelect();
  fillTopicoSelect();
  if (canManageConfig()) {
    fillConfigGroupFilter();
    fillTopicGroupSelect();
  }
  renderConfigTopicos();

  const ativos = getTopicosAtivos();
  if (!state.selectedTopicoId || !ativos.some((topico) => topico.id === state.selectedTopicoId)) {
    state.selectedTopicoId = ativos[0]?.id ?? state.topicos[0]?.id ?? null;
  }
}

function renderConfigTopicos() {
  if (!canManageConfig()) {
    refs.configTopicosBody.innerHTML =
      '<tr><td colspan="6" class="empty-cell">Sem permissão para gerenciar configurações.</td></tr>';
    return;
  }

  const filteredTopicos = getConfigTopicosFiltered();
  if (filteredTopicos.length === 0) {
    refs.configTopicosBody.innerHTML =
      '<tr><td colspan="6" class="empty-cell">Sem tópicos neste macro-tópico.</td></tr>';
    return;
  }

  refs.configTopicosBody.innerHTML = filteredTopicos
    .map((topico) => {
      const draft = state.configTopicDrafts[topico.id] ?? {
        nome: topico.nome,
        grupo: topico.grupo,
        orcamentoProgramaBRL: Number(topico.orcamentoProgramaBRL ?? 0),
        incluirNoResumo: Boolean(topico.incluirNoResumo),
        permitirLancamento: Boolean(topico.permitirLancamento),
      };

      const actionsMarkup = state.editMode
        ? `<div class="row-actions row-actions-config">
            <button class="primary" data-save-topic="${escapeHtml(topico.id)}">
              Salvar
            </button>
            <button
              class="delete-btn delete-icon-btn"
              data-delete-topic="${escapeHtml(topico.id)}"
              type="button"
              title="Remover tópico"
              aria-label="Remover tópico"
            >
              <svg class="icon-trash" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9zm1 12h8a2 2 0 0 0 2-2V9H6v10a2 2 0 0 0 2 2z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>`
        : '<span class="config-row-readonly">Ative o modo edição</span>';

      return `<tr data-config-topic-id="${escapeHtml(topico.id)}">
        <td>
          <input type="text" data-field="nome" value="${escapeHtml(draft.nome)}" ${state.editMode ? "" : "disabled"} />
        </td>
        <td>${escapeHtml(getGroupLabelPt(getTopicoDisplayGroup(topico)))}</td>
        <td>
          <input type="number" data-field="orcamentoProgramaBRL" step="0.01" min="0" value="${draft.orcamentoProgramaBRL}" ${
            state.editMode ? "" : "disabled"
          } />
        </td>
        <td>
          <label class="inline-check">
            <input type="checkbox" data-field="incluirNoResumo" ${draft.incluirNoResumo ? "checked" : ""} ${
              state.editMode ? "" : "disabled"
            } />
            Sim
          </label>
        </td>
        <td>
          <label class="inline-check">
            <input type="checkbox" data-field="permitirLancamento" ${draft.permitirLancamento ? "checked" : ""} ${
              state.editMode ? "" : "disabled"
            } />
            Sim
          </label>
        </td>
        <td class="config-actions-cell">
          ${actionsMarkup}
        </td>
      </tr>`;
    })
    .join("");
}

async function saveConfigTopic(topicId) {
  if (!canManageConfig()) return;
  if (!state.editMode) return;
  const draft = state.configTopicDrafts[topicId];
  if (!draft) return;

  const payload = {
    nome: String(draft.nome ?? "").trim(),
    orcamentoProgramaBRL: Number(draft.orcamentoProgramaBRL ?? 0),
    incluirNoResumo: Boolean(draft.incluirNoResumo),
    permitirLancamento: Boolean(draft.permitirLancamento),
  };

  if (!payload.nome) {
    throw new Error("Nome do tópico é obrigatório.");
  }
  if (!Number.isFinite(payload.orcamentoProgramaBRL) || payload.orcamentoProgramaBRL < 0) {
    throw new Error("Orçamento inválido.");
  }

  await request(`/api/topicos/${topicId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  await loadTopicos();
  await refreshEverything();
}

async function deleteConfigTopic(topicId) {
  if (!canManageConfig()) return false;
  if (!state.editMode) return false;
  const topic = state.topicos.find((item) => item.id === topicId);
  if (!topic) return false;

  const topicLabel = getTopicLabelPt(topic.nome);
  const confirmed = window.confirm(
    `Deseja remover o tópico "${topicLabel}"? Esta ação não pode ser desfeita.`
  );
  if (!confirmed) return false;

  await request(`/api/topicos/${topicId}`, {
    method: "DELETE",
  });

  if (state.selectedTopicoId === topicId) {
    state.selectedTopicoId = null;
  }

  delete state.configTopicDrafts[topicId];
  await loadTopicos();
  await refreshEverything();
  return true;
}

async function loadResumo() {
  if (state.resumoAbortController) {
    state.resumoAbortController.abort();
  }
  const controller = new AbortController();
  state.resumoAbortController = controller;
  setLoadingState("resumo", true);
  renderResumo();
  renderReportCharts();

  const query = makeQuery();
  try {
    state.resumo = await request(`/api/resumo?${query}`, { signal: controller.signal });
    renderResumo();
    renderReportCharts();
  } catch (error) {
    if (isAbortError(error)) return;
    throw error;
  } finally {
    if (state.resumoAbortController === controller) {
      state.resumoAbortController = null;
      setLoadingState("resumo", false);
      renderResumo();
      renderReportCharts();
    }
  }
}

async function loadDetalhes() {
  if (state.detalhesAbortController) {
    state.detalhesAbortController.abort();
  }
  const controller = new AbortController();
  state.detalhesAbortController = controller;
  setLoadingState("detalhes", true);
  renderDetalhes();

  const requestSeq = ++state.detalhesRequestSeq;
  const selectedTopicoId = state.selectedTopicoId;

  if (!state.selectedTopicoId) {
    if (requestSeq !== state.detalhesRequestSeq) return;
    state.detalhes = { items: [], total: 0 };
    renderDetalhes();
    if (state.detalhesAbortController === controller) {
      state.detalhesAbortController = null;
      setLoadingState("detalhes", false);
    }
    return;
  }

  const query = makeQuery();
  try {
    const detalhes = await request(`/api/topicos/${selectedTopicoId}/detalhes?${query}`, {
      signal: controller.signal,
    });
    if (requestSeq !== state.detalhesRequestSeq) return;
    if (selectedTopicoId !== state.selectedTopicoId) return;
    state.detalhes = detalhes;
    renderDetalhes();
  } catch (error) {
    if (isAbortError(error)) return;
    throw error;
  } finally {
    if (state.detalhesAbortController === controller) {
      state.detalhesAbortController = null;
      setLoadingState("detalhes", false);
      renderDetalhes();
    }
  }
}

async function refreshEverything() {
  const requestSeq = ++state.refreshRequestSeq;
  setLoadingState("refresh", true);
  try {
    await Promise.all([loadResumo(), loadDetalhes()]);
    if (requestSeq !== state.refreshRequestSeq) return;
    renderTopicosGrid();
    renderReportCharts();
  } finally {
    if (requestSeq === state.refreshRequestSeq) {
      setLoadingState("refresh", false);
    }
  }
}

function collectFilters() {
  state.filters.ano = refs.ano.value.trim();
  state.filters.semestre = state.filters.ano ? refs.semestre.value : "";
  state.filters.dataInicio = refs.dataInicio ? refs.dataInicio.value.trim() : "";
  state.filters.dataFim = refs.dataFim ? refs.dataFim.value.trim() : "";
  state.filters.search = refs.filterSearch ? refs.filterSearch.value.trim() : "";
  if (state.filters.dataInicio && state.filters.dataFim && state.filters.dataInicio > state.filters.dataFim) {
    [state.filters.dataInicio, state.filters.dataFim] = [state.filters.dataFim, state.filters.dataInicio];
    if (refs.dataInicio) refs.dataInicio.value = state.filters.dataInicio;
    if (refs.dataFim) refs.dataFim.value = state.filters.dataFim;
  }
  syncPeriodFilterAvailability();
}

function clearFilters() {
  state.filters.ano = "";
  state.filters.semestre = "";
  state.filters.dataInicio = "";
  state.filters.dataFim = "";
  state.filters.search = "";
  syncFilterInputs();
}

function resetTopicFormDefaults() {
  if (!refs.topicForm || !refs.topicGroup) return;
  refs.topicForm.reset();
  fillTopicGroupSelect();

  if (state.configGroupFilter && state.configGroupFilter !== ALL_CONFIG_GROUPS_OPTION) {
    refs.topicGroup.value = state.configGroupFilter;
  } else if (refs.topicGroup.querySelector('option[value="COMMUNICATIONS & PUBLICATIONS"]')) {
    refs.topicGroup.value = "COMMUNICATIONS & PUBLICATIONS";
  }

  refs.topicBudget.value = "0";
  refs.topicIncluirResumo.checked = true;
  refs.topicPermitirLancamento.checked = !isTeamHiresGroup(refs.topicGroup.value);
}

function openTopicModal() {
  if (!refs.topicModal) return;
  if (!canManageConfig()) {
    toast("Sem permissão para criar tópicos.");
    return;
  }
  if (!state.editMode) {
    toast("Ative o modo edição para acrescentar tópicos.");
    return;
  }

  resetTopicFormDefaults();
  openDialog(refs.topicModal, "#topico-nome");
}

function closeTopicModal() {
  if (!refs.topicModal) return;
  closeDialog(refs.topicModal);
}

async function handleCreateTopico(event) {
  event.preventDefault();
  if (!canManageConfig()) {
    throw new Error("Sem permissão para criar tópicos.");
  }
  if (!state.editMode) {
    throw new Error("Ative o modo edição para salvar tópicos.");
  }

  const payload = {
    nome: refs.topicName.value.trim(),
    grupo: refs.topicGroup.value,
    orcamentoProgramaBRL: Number(refs.topicBudget.value),
    incluirNoResumo: refs.topicIncluirResumo.checked,
    permitirLancamento: refs.topicPermitirLancamento.checked,
  };

  if (!payload.nome) {
    throw new Error("Nome do tópico é obrigatório.");
  }
  if (!payload.grupo) {
    throw new Error("Selecione um grupo para o tópico.");
  }
  if (!Number.isFinite(payload.orcamentoProgramaBRL) || payload.orcamentoProgramaBRL < 0) {
    throw new Error("Orçamento inválido.");
  }

  const created = await request("/api/topicos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!created || typeof created.id !== "string") {
    throw new Error("Falha ao criar tópico: resposta inválida da API.");
  }

  state.configGroupFilter = payload.grupo;
  state.selectedTopicoId = created?.id ?? state.selectedTopicoId;
  closeTopicModal();
  toast("Tópico criado com sucesso.");
  await loadTopicos();
  await refreshEverything();
}

function openModal() {
  if (!canWriteLancamentos()) {
    toast("Sem permissão para registrar lançamentos.");
    return;
  }
  state.editLancamentoId = null;
  refs.modalTitle.textContent = "Novo lançamento";
  refs.submitCompra.textContent = "Salvar compra";

  const today = new Date().toISOString().slice(0, 10);
  refs.compraData.value = today;

  if (state.selectedTopicoId) {
    const selectedTopico = state.topicos.find((topico) => topico.id === state.selectedTopicoId);
    if (selectedTopico && canLaunchTopico(selectedTopico)) {
      state.selectedCompraGrupo = getTopicoDisplayGroup(selectedTopico);
    }
  }

  fillCompraGrupoSelect();
  fillTopicoSelect();

  if (
    state.selectedTopicoId &&
    refs.compraTopico.querySelector(`option[value="${state.selectedTopicoId}"]`)
  ) {
    refs.compraTopico.value = state.selectedTopicoId;
  }

  openDialog(refs.modal, "#compra-data");
}

async function openModalForEdit(lancamentoId) {
  if (!canWriteLancamentos()) {
    toast("Sem permissão para editar lançamentos.");
    return;
  }

  const item = state.detalhes.items.find((entry) => entry.id === lancamentoId);
  if (!item) {
    toast("Lançamento não encontrado.");
    return;
  }

  state.editLancamentoId = item.id;
  refs.modalTitle.textContent = "Editar lançamento";
  refs.submitCompra.textContent = "Salvar alteração";

  const selectedTopico = state.topicos.find((topico) => topico.id === item.topicoId);
  state.selectedCompraGrupo = selectedTopico
    ? getTopicoDisplayGroup(selectedTopico)
    : ALL_GROUPS_OPTION;

  fillCompraGrupoSelect();
  fillTopicoSelect();

  refs.compraTopico.value = item.topicoId;
  refs.compraData.value = item.data;
  refs.compraDescricao.value = item.descricao ?? "";
  refs.compraFornecedor.value = item.fornecedor ?? "";
  refs.compraResponsavel.value = item.responsavel ?? "";
  refs.compraValor.value = Number(item.valor ?? 0);

  openDialog(refs.modal, "#compra-descricao");
}

function closeModal() {
  state.editLancamentoId = null;
  refs.modalTitle.textContent = "Novo lançamento";
  refs.submitCompra.textContent = "Salvar compra";
  closeDialog(refs.modal);
}

async function handleCreateLancamento(event) {
  event.preventDefault();
  if (!canWriteLancamentos()) {
    throw new Error("Sem permissão para salvar lançamentos.");
  }
  const payload = {
    topicoId: refs.compraTopico.value,
    data: refs.compraData.value,
    descricao: refs.compraDescricao.value.trim(),
    fornecedor: refs.compraFornecedor.value.trim(),
    responsavel: refs.compraResponsavel.value.trim(),
    valor: Number(refs.compraValor.value),
  };

  if (!payload.topicoId) {
    throw new Error("Selecione um tópico válido.");
  }

  const isEdit = Boolean(state.editLancamentoId);
  const endpoint = isEdit ? `/api/lancamentos/${state.editLancamentoId}` : "/api/lancamentos";
  const method = isEdit ? "PUT" : "POST";

  const saved = await request(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  state.selectedTopicoId = payload.topicoId;
  refs.formCompra.reset();
  closeDialog(refs.modal);
  if (saved?.syncStatus === "pending") {
    toast("Compra salva no sistema. Sincronização com BD pendente.");
  } else {
    toast(isEdit ? "Compra atualizada com sucesso." : "Compra adicionada com sucesso.");
  }
  state.editLancamentoId = null;
  refs.modalTitle.textContent = "Novo lançamento";
  refs.submitCompra.textContent = "Salvar compra";
  await refreshEverything();
}

async function handleDeleteLancamento(lancamentoId) {
  if (!canWriteLancamentos()) {
    throw new Error("Sem permissão para excluir lançamentos.");
  }
  const confirmed = window.confirm("Deseja realmente excluir este lançamento?");
  if (!confirmed) return;

  await request(`/api/lancamentos/${lancamentoId}`, { method: "DELETE" });
  toast("Lançamento excluído.");
  await refreshEverything();
}

async function updateTeamHiresLock(next) {
  if (!canManageConfig()) {
    throw new Error("Sem permissão para alterar bloqueio.");
  }
  const payload = { teamHiresUnlocked: next };
  let result = null;
  try {
    result = await request("/api/config/topicos-travados", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (primaryError) {
    try {
      result = await request("/api/config/topicos-travados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      throw primaryError;
    }
  }

  if (!result || typeof result.teamHiresUnlocked !== "boolean") {
    throw new Error("Falha ao atualizar bloqueio: resposta inválida da API.");
  }

  return result;
}

function wireEvents() {
  setupDialogAccessibility(refs.modal);
  setupDialogAccessibility(refs.topicModal);

  const autoRefreshDashboardFilters = async () => {
    const activeView = document.querySelector(".view.active")?.id?.replace("view-", "") || "resumo";
    if (activeView !== "resumo" && activeView !== "relatorios") return;
    collectFilters();
    await refreshEverything();
  };

  refs.navLinks.forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  refs.reportSortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextSort = button.dataset.reportSort || "spent";
      if (state.reportSort === nextSort) return;
      state.reportSort = nextSort;
      renderReportCharts();
    });
  });

  window.addEventListener("resize", () => {
    if (state.activeView !== "relatorios") return;
    window.requestAnimationFrame(() => renderReportCharts());
  });

  if (refs.themeToggle) {
    refs.themeToggle.addEventListener("change", () => {
      applyTheme(refs.themeToggle.checked ? "dark" : "light");
      renderReportCharts();
    });
  }

  if (refs.logoutButton) {
    refs.logoutButton.addEventListener("click", async () => {
      setBusyButton(refs.logoutButton, true, { busy: "Saindo..." });
      await logoutAndRedirect();
    });
  }

  if (refs.projectPickerSwitchUser) {
    refs.projectPickerSwitchUser.addEventListener("click", async () => {
      setBusyButton(refs.projectPickerSwitchUser, true, { busy: "Saindo..." });
      await logoutAndRedirect();
    });
  }

  if (refs.projectSwitcher) {
    refs.projectSwitcher.addEventListener("change", async () => {
      const nextProjectCode = String(refs.projectSwitcher.value ?? "")
        .trim()
        .toUpperCase();
      const currentProjectCode = String(state.auth?.projectCode ?? "")
        .trim()
        .toUpperCase();
      if (!nextProjectCode || nextProjectCode === currentProjectCode) return;

      refs.projectSwitcher.disabled = true;
      try {
        await setActiveProject(nextProjectCode, { retryOnProjectSelection: false });
        window.location.replace("/");
      } catch (error) {
        toast(error?.message || "Nao foi possivel trocar de projeto.");
        syncProjectNavigationUI();
      } finally {
        refs.projectSwitcher.disabled = false;
      }
    });
  }

  window.addEventListener("config:topics-changed", async () => {
    try {
      await loadTopicos();
      await refreshEverything();
    } catch (error) {
      toast(error?.message || "Falha ao sincronizar dados após alterações na configuração.");
    }
  });

  refs.toggleEditMode.addEventListener("change", () => {
    setEditMode(refs.toggleEditMode.checked);
    renderConfigTopicos();
    renderDetalhes();
  });

  refs.btnAddTopico.addEventListener("click", openTopicModal);
  refs.closeTopicModal.addEventListener("click", closeTopicModal);
  refs.cancelTopicModal.addEventListener("click", closeTopicModal);
  refs.topicGroup.addEventListener("change", () => {
    if (isTeamHiresGroup(refs.topicGroup.value)) {
      refs.topicPermitirLancamento.checked = false;
    }
  });
  refs.topicForm.addEventListener("submit", async (event) => {
    setBusyButton(refs.submitTopico, true, { busy: "Salvando..." });
    try {
      await handleCreateTopico(event);
    } catch (error) {
      toast(error.message || "Falha ao criar tópico.");
    } finally {
      setBusyButton(refs.submitTopico, false);
    }
  });

  refs.toggleTeamHires.addEventListener("click", async () => {
    const next = !state.teamHiresUnlocked;
    refs.toggleTeamHires.disabled = true;
    try {
      const config = await updateTeamHiresLock(next);
      state.teamHiresUnlocked = Boolean(config?.teamHiresUnlocked);
      renderTeamHiresToggle();
      await loadTopicos();
      await refreshEverything();
      renderConfigTopicos();
      toast(
        state.teamHiresUnlocked
          ? "Contratações de equipe destravadas."
          : "Contratações de equipe travadas."
      );
    } catch (error) {
      toast(error.message || "Não foi possível alterar o bloqueio.");
    } finally {
      refs.toggleTeamHires.disabled = false;
    }
  });

  refs.ano.addEventListener("change", async () => {
    try {
      await autoRefreshDashboardFilters();
    } catch (error) {
      toast(error.message || "Falha ao atualizar filtros.");
    }
  });

  refs.semestre.addEventListener("change", async () => {
    try {
      await autoRefreshDashboardFilters();
    } catch (error) {
      toast(error.message || "Falha ao atualizar filtros.");
    }
  });

  if (refs.dataInicio) {
    refs.dataInicio.addEventListener("change", async () => {
      try {
        await autoRefreshDashboardFilters();
      } catch (error) {
        toast(error.message || "Falha ao atualizar filtros.");
      }
    });
  }

  if (refs.dataFim) {
    refs.dataFim.addEventListener("change", async () => {
      try {
        await autoRefreshDashboardFilters();
      } catch (error) {
        toast(error.message || "Falha ao atualizar filtros.");
      }
    });
  }

  if (refs.filterSearch) {
    refs.filterSearch.addEventListener("input", () => {
      state.filters.search = refs.filterSearch.value.trim();
      renderResumo();
      renderDetalhes();
      renderReportCharts();
    });
  }

  refs.compraGrupo.addEventListener("change", () => {
    state.selectedCompraGrupo = refs.compraGrupo.value;
    fillTopicoSelect();
  });

  refs.configGroupFilter.addEventListener("change", () => {
    state.configGroupFilter = refs.configGroupFilter.value;
    renderConfigTopicos();
  });

  refs.configTopicosBody.addEventListener("input", (event) => {
    const row = event.target.closest("[data-config-topic-id]");
    if (!row) return;
    const topicId = row.dataset.configTopicId;
    const field = event.target.dataset.field;
    if (!topicId || !field || !state.configTopicDrafts[topicId]) return;

    if (event.target.type === "checkbox") {
      state.configTopicDrafts[topicId][field] = event.target.checked;
      return;
    }

    if (field === "orcamentoProgramaBRL") {
      state.configTopicDrafts[topicId][field] = Number(event.target.value);
      return;
    }

    state.configTopicDrafts[topicId][field] = event.target.value;
  });

  refs.configTopicosBody.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-save-topic]");
    if (button) {
      if (!state.editMode) {
        toast("Ative o modo edição para salvar alterações.");
        return;
      }

      button.disabled = true;
      try {
        await saveConfigTopic(button.dataset.saveTopic);
        toast("Tópico atualizado com sucesso.");
      } catch (error) {
        toast(error.message || "Falha ao atualizar tópico.");
      } finally {
        button.disabled = false;
      }
      return;
    }

    const deleteButton = event.target.closest("[data-delete-topic]");
    if (deleteButton) {
      if (!state.editMode) {
        toast("Ative o modo edição para remover tópicos.");
        return;
      }

      deleteButton.disabled = true;
      try {
        const removed = await deleteConfigTopic(deleteButton.dataset.deleteTopic);
        if (removed) {
          toast("Tópico removido com sucesso.");
        }
      } catch (error) {
        toast(error.message || "Falha ao remover tópico.");
      } finally {
        deleteButton.disabled = false;
      }
    }
  });

  refs.applyFilters.addEventListener("click", async () => {
    try {
      collectFilters();
      await refreshEverything();
    } catch (error) {
      toast(error.message || "Falha ao atualizar dados.");
    }
  });

  refs.clearFilters.addEventListener("click", async () => {
    try {
      clearFilters();
      await refreshEverything();
    } catch (error) {
      toast(error.message || "Falha ao limpar filtros.");
    }
  });

  refs.resumoBody.addEventListener("click", async (event) => {
    const groupToggle = event.target.closest("[data-group-toggle]");
    if (groupToggle) {
      const groupName = groupToggle.dataset.groupToggle;
      state.expandedResumoGroups[groupName] = !isResumoGroupExpanded(groupName);
      renderResumo();
      return;
    }

    const row = event.target.closest("[data-topic-row]");
    if (!row) return;
    state.selectedTopicoId = row.dataset.topicRow;
    renderResumo();
    await loadDetalhes();
  });

  refs.topicosGrid.addEventListener("click", async (event) => {
    const groupToggle = event.target.closest("[data-group-toggle-topicos]");
    if (groupToggle) {
      const groupName = groupToggle.dataset.groupToggleTopicos;
      state.expandedTopicosGroups[groupName] = !isTopicosGroupExpanded(groupName);
      renderTopicosGrid();
      return;
    }

    const button = event.target.closest("[data-open-topic]");
    if (!button) return;
    state.selectedTopicoId = button.dataset.openTopic;
    setView("resumo");
    renderResumo();
    await loadDetalhes();
  });

  refs.detalhesBody.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-id]");
    if (editButton) {
      try {
        await openModalForEdit(editButton.dataset.editId);
      } catch (error) {
        toast(error.message);
      }
      return;
    }

    const button = event.target.closest("[data-delete-id]");
    if (!button) return;
    try {
      await handleDeleteLancamento(button.dataset.deleteId);
    } catch (error) {
      toast(error.message);
    }
  });

  refs.btnNovaCompra.addEventListener("click", openModal);
  refs.closeModal.addEventListener("click", closeModal);
  refs.cancelModal.addEventListener("click", closeModal);
  refs.formCompra.addEventListener("submit", async (event) => {
    setBusyButton(refs.submitCompra, true, { busy: "Salvando..." });
    try {
      await handleCreateLancamento(event);
    } catch (error) {
      toast(error.message);
    } finally {
      if (refs.submitCompra) {
        refs.submitCompra.disabled = false;
        refs.submitCompra.setAttribute("aria-busy", "false");
        delete refs.submitCompra.dataset.idleLabel;
      }
    }
  });

  refs.exportExcel.addEventListener("click", () => {
    collectFilters();
    window.open(`/api/export/excel?${makeQuery()}`, "_blank");
  });

  refs.exportCsv.addEventListener("click", () => {
    collectFilters();
    window.open(`/api/export/csv?${makeQuery()}`, "_blank");
  });

  refs.exportPdf.addEventListener("click", () => {
    collectFilters();
    window.open(`/api/export/pdf?${makeQuery()}`, "_blank");
  });
}

async function boot() {
  try {
    setConfigRenderer(false);
    applyTheme(getStoredTheme(), { persist: false });
    disableLegacyProjectPicker();
    wireEvents();
    await loadAuthStatus();
    if (isHubNavigationRequired()) {
      redirectToHub({ replace: true });
      return;
    }
    await ensureProjectSelection();
    setEditMode(false);
    const initialView =
      getInitialViewFromLocation() ||
      document.querySelector(".nav-link.active")?.dataset.view ||
      "resumo";
    setView(initialView);
    await Promise.all([loadFiltros(), loadTeamHiresConfig()]);
    syncFilterInputs();
    renderResumoHeader();
    await loadTopicos();
    await refreshEverything();
  } catch (error) {
    toast(error.message || "Falha ao carregar dados.");
    console.error(error);
  }
}

boot();
