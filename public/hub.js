import { fetchSameOrigin } from "./app/api-client.js";

const refs = {
  search: document.getElementById("hub-search"),
  status: document.getElementById("hub-status"),
  greeting: document.getElementById("hub-greeting"),
  subtitle: document.getElementById("hub-subtitle"),
  department: document.getElementById("hub-department"),
  statusTabs: document.getElementById("hub-status-tabs"),
  clearFilters: document.getElementById("hub-clear-filters"),
  grid: document.getElementById("hub-grid"),
  empty: document.getElementById("hub-empty"),
  themeToggle: document.getElementById("hub-theme-toggle"),
  logoutButton: document.getElementById("hub-logout"),
  reportLink: document.getElementById("hub-report-link"),
  adminLink: document.getElementById("hub-admin-link"),
  newProjectLink: document.getElementById("hub-new-project"),
};

const STATUS_TABS = [
  { key: "todos", label: "Todos" },
  { key: "ativos", label: "Ativos" },
  { key: "inativos", label: "Inativos" },
];

const state = {
  auth: {
    username: "",
    isSuperAdmin: false,
    activeProjectCode: "",
  },
  projects: [],
  searchTerm: "",
  selectedDepartment: "",
  selectedStatus: "todos",
  openingProjectCode: "",
};

function getStoredTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function applyTheme(theme, options = {}) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.classList.toggle("theme-dark", nextTheme === "dark");
  if (options.persist !== false) {
    localStorage.setItem("theme", nextTheme);
  }

  if (refs.themeToggle) {
    const isDark = nextTheme === "dark";
    refs.themeToggle.checked = isDark;
    refs.themeToggle.setAttribute("aria-checked", isDark ? "true" : "false");
    refs.themeToggle.setAttribute("title", isDark ? "Ativar tema claro" : "Ativar tema escuro");
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function normalizeProjectStatus(value, fallback = "ativo") {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "ativo" || normalized === "inativo" || normalized === "concluido") {
    return normalized;
  }
  return fallback;
}

function normalizeProject(project) {
  const code = String(project?.code ?? project ?? "")
    .trim()
    .toUpperCase();
  const name = String(project?.name ?? code).trim() || code;
  const department = String(project?.departmentName ?? project?.department ?? "").trim();
  const status = normalizeProjectStatus(
    project?.status,
    project?.isActive === false ? "inativo" : "ativo"
  );

  return {
    code,
    name,
    department,
    status,
    isActive: status === "ativo",
  };
}

function projectSort(a, b) {
  return (
    String(a.name ?? "").localeCompare(String(b.name ?? ""), "pt-BR") ||
    String(a.code ?? "").localeCompare(String(b.code ?? ""), "pt-BR")
  );
}

function formatDisplayName(username) {
  const clean = String(username ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  const parts = clean.split(" ").slice(0, 2);
  return parts
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

async function apiFetch(url, options = {}) {
  const response = await fetchSameOrigin(url, options);

  if (response.status === 401) {
    window.location.replace("/login");
    throw new Error("Sessao expirada.");
  }

  if (!response.ok) {
    let message = "Erro inesperado.";
    try {
      const body = await response.json();
      message = body?.error || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function setActiveProject(projectCode) {
  return apiFetch("/api/auth/active-project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectCode }),
  });
}

async function logoutAndRedirect() {
  try {
    await fetchSameOrigin("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Ignore network errors and force login.
  }
  window.location.replace("/login?switch=1");
}

function getDepartments() {
  const dedupe = new Map();
  for (const project of state.projects) {
    if (project.status === "concluido") continue;
    const department = String(project?.department ?? "").trim();
    if (!department) continue;
    const key = department.toLowerCase();
    if (!dedupe.has(key)) dedupe.set(key, department);
  }
  return [...dedupe.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function getFilteredProjects() {
  const normalizedSearch = state.searchTerm.toLowerCase();
  const selectedDept = String(state.selectedDepartment ?? "")
    .trim()
    .toLowerCase();

  return state.projects
    .filter((project) => {
      if (project.status === "concluido") return false;

      const searchableText = `${project.code} ${project.name} ${project.department}`.toLowerCase();
      if (normalizedSearch && !searchableText.includes(normalizedSearch)) {
        return false;
      }

      if (selectedDept) {
        const projectDept = String(project.department ?? "")
          .trim()
          .toLowerCase();
        if (projectDept !== selectedDept) return false;
      }

      if (state.selectedStatus === "ativos" && project.status !== "ativo") return false;
      if (state.selectedStatus === "inativos" && project.status !== "inativo") return false;

      return true;
    })
    .sort(projectSort);
}

function renderHeaderSummary(filteredCount, totalCount) {
  if (refs.greeting) {
    const displayName = formatDisplayName(state.auth.username) || "Usuario";
    refs.greeting.textContent = `Ola, ${displayName}`;
  }

  if (refs.subtitle) {
    const amount = Number.isFinite(filteredCount) ? filteredCount : totalCount;
    const projectWord = amount === 1 ? "projeto" : "projetos";
    refs.subtitle.textContent = `Tens ${amount} ${projectWord} disponiveis para acesso hoje.`;
  }
}

function renderStatus(filteredProjects) {
  const total = state.projects.filter((project) => project.status !== "concluido").length;
  const visible = filteredProjects.length;

  if (refs.status) {
    refs.status.textContent = `${visible} de ${total} projetos disponiveis`;
  }

  renderHeaderSummary(visible, total);
}

function renderDepartmentOptions() {
  if (!refs.department) return;
  const departments = getDepartments();
  const current = String(state.selectedDepartment ?? "");
  const hasCurrent = departments.some((dept) => dept.toLowerCase() === current.toLowerCase());
  if (current && !hasCurrent) state.selectedDepartment = "";

  const options = ['<option value="">Departamentos</option>'];
  for (const department of departments) {
    const selected =
      department.toLowerCase() === state.selectedDepartment.toLowerCase() ? " selected" : "";
    options.push(
      `<option value="${escapeHtml(department)}"${selected}>${escapeHtml(department)}</option>`
    );
  }
  refs.department.innerHTML = options.join("");
}

function renderStatusTabs() {
  if (!refs.statusTabs) return;
  refs.statusTabs.innerHTML = STATUS_TABS.map((tab) => {
    const active = tab.key === state.selectedStatus;
    return `<button type="button" class="hub-tab${active ? " active" : ""}" data-status="${escapeHtml(tab.key)}" aria-pressed="${active ? "true" : "false"}">${escapeHtml(tab.label)}</button>`;
  }).join("");
}

function renderProjects() {
  if (!refs.grid) return;
  const filteredProjects = getFilteredProjects();
  renderStatus(filteredProjects);

  if (filteredProjects.length === 0) {
    refs.grid.innerHTML = "";
    if (refs.empty) {
      const visibleCatalogCount = state.projects.filter(
        (project) => project.status !== "concluido"
      ).length;
      refs.empty.hidden = false;
      refs.empty.textContent =
        visibleCatalogCount === 0
          ? "Nenhum projeto disponivel para este login."
          : "Nenhum projeto encontrado para os filtros atuais.";
    }
    return;
  }

  if (refs.empty) refs.empty.hidden = true;

  refs.grid.innerHTML = filteredProjects
    .map((project) => {
      const opening = state.openingProjectCode === project.code;
      const openButtonLabel = opening ? "Abrindo..." : "Acessar projeto";
      const cardClasses = ["hub-card"];
      if (project.code === state.auth.activeProjectCode) cardClasses.push("hub-card-current");

      const statusLabel = project.status === "ativo" ? "Ativo" : "Inativo";
      const statusClass =
        project.status === "ativo" ? "hub-pill hub-pill-active" : "hub-pill hub-pill-inactive";

      return `
      <article class="${cardClasses.join(" ")}" data-project-card="${escapeHtml(project.code)}">
        <div class="hub-card-content">
          <strong class="hub-card-code">${escapeHtml(project.code)}</strong>
          <span class="hub-card-name">${escapeHtml(project.name || project.code)}</span>
          <span class="${statusClass}">${statusLabel}</span>
        </div>
        <div class="hub-card-actions">
          <button class="hub-open-btn" type="button" data-open-project="${escapeHtml(project.code)}"${opening ? " disabled" : ""}>${openButtonLabel}</button>
        </div>
      </article>
    `;
    })
    .join("");
}

async function openProject(projectCode) {
  if (!projectCode) return;
  state.openingProjectCode = projectCode;
  renderProjects();
  try {
    await setActiveProject(projectCode);
    window.location.replace("/");
  } catch (error) {
    toast(error?.message || "Nao foi possivel abrir o projeto.");
    state.openingProjectCode = "";
    renderProjects();
  }
}

function wireEvents() {
  if (refs.themeToggle) {
    refs.themeToggle.addEventListener("change", () => {
      applyTheme(refs.themeToggle.checked ? "dark" : "light");
    });
  }

  if (refs.logoutButton) {
    refs.logoutButton.addEventListener("click", async () => {
      refs.logoutButton.disabled = true;
      refs.logoutButton.setAttribute("aria-busy", "true");
      await logoutAndRedirect();
    });
  }

  if (refs.search) {
    refs.search.addEventListener("input", () => {
      state.searchTerm = String(refs.search.value ?? "").trim();
      renderProjects();
    });
  }

  if (refs.department) {
    refs.department.addEventListener("change", () => {
      state.selectedDepartment = String(refs.department.value ?? "").trim();
      renderProjects();
    });
  }

  if (refs.statusTabs) {
    refs.statusTabs.addEventListener("click", (event) => {
      const tab = event.target.closest("button[data-status]");
      if (!tab) return;
      const nextStatus = String(tab.dataset.status ?? "todos")
        .trim()
        .toLowerCase();
      if (!STATUS_TABS.some((item) => item.key === nextStatus)) return;
      state.selectedStatus = nextStatus;
      renderStatusTabs();
      renderProjects();
    });
  }

  if (refs.clearFilters) {
    refs.clearFilters.addEventListener("click", () => {
      state.searchTerm = "";
      state.selectedDepartment = "";
      state.selectedStatus = "todos";
      if (refs.search) refs.search.value = "";
      renderDepartmentOptions();
      renderStatusTabs();
      renderProjects();
    });
  }

  if (refs.grid) {
    refs.grid.addEventListener("click", async (event) => {
      const openButton = event.target.closest("button[data-open-project]");
      if (!openButton) return;
      const projectCode = String(openButton.dataset.openProject ?? "")
        .trim()
        .toUpperCase();
      await openProject(projectCode);
    });
  }
}

async function loadHubData() {
  const status = await apiFetch("/api/auth/status");
  if (!status?.authenticated) {
    window.location.replace("/login");
    return;
  }

  const allowedProjects = Array.isArray(status?.allowedProjects) ? status.allowedProjects : [];
  if (allowedProjects.length <= 1) {
    window.location.replace("/");
    return;
  }

  state.auth = {
    username: String(status?.username ?? ""),
    isSuperAdmin: status?.isSuperAdmin === true,
    activeProjectCode: String(status?.activeProjectCode ?? status?.projectCode ?? "")
      .trim()
      .toUpperCase(),
  };

  if (refs.reportLink) {
    refs.reportLink.hidden = false;
    refs.reportLink.href = "/?view=relatorios";
  }
  if (refs.adminLink) {
    refs.adminLink.hidden = state.auth.isSuperAdmin !== true;
  }
  if (refs.newProjectLink) {
    refs.newProjectLink.hidden = state.auth.isSuperAdmin !== true;
  }

  let catalogProjects = [];
  try {
    const catalog = await apiFetch("/api/projects/catalog");
    catalogProjects = Array.isArray(catalog?.projects) ? catalog.projects : [];
  } catch {
    toast("Catalogo indisponivel. Exibindo projetos permitidos.");
  }

  const source = catalogProjects.length > 0 ? catalogProjects : allowedProjects;
  state.projects = source
    .map((project) => normalizeProject(project))
    .filter((project) => Boolean(project.code))
    .sort(projectSort);
}

async function boot() {
  applyTheme(getStoredTheme(), { persist: false });
  wireEvents();

  try {
    await loadHubData();
    renderDepartmentOptions();
    renderStatusTabs();
    renderProjects();
  } catch (error) {
    toast(error?.message || "Nao foi possivel carregar a plataforma.");
  }
}

boot();
