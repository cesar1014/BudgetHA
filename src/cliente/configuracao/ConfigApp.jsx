import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { createTopico, deleteTopico, getAuthStatus, getTopicos, updateTopico } from "./api.js";
import { subscribeThemeChange } from "./theme.js";
import ConfigHeader from "./components/ConfigHeader.jsx";
import ConfigFiltersCard from "./components/ConfigFiltersCard.jsx";
import ConfigBudgetCard from "./components/ConfigBudgetCard.jsx";
import ConfigTopicsTable from "./components/ConfigTopicsTable.jsx";

const ALL_GROUPS_VALUE = "Todos";
const GROUP_LABELS_PT = {
  "TEAM HIRES": "Contratações da Equipe",
  "COMMUNICATIONS & PUBLICATIONS": "Comunicação e Publicações",
  "THIRD PARTY SERVICES": "Serviços de Terceiros",
};

const GROUP_LABELS_CANONICAL = new Map(
  Object.entries(GROUP_LABELS_PT).flatMap(([key, label]) => {
    const foldedKey = String(key)
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const foldedLabel = String(label)
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return [
      [foldedKey, label],
      [foldedLabel, label],
    ];
  })
);

function getGroupLabelPt(groupName) {
  const text = String(groupName ?? "").trim();
  if (!text) return "Sem grupo";
  const folded = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return GROUP_LABELS_CANONICAL.get(folded) || text;
}

function normalizeGroupText(value) {
  return String(value ?? "").trim();
}

function foldGroupText(value) {
  return normalizeGroupText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isTeamHiresGroup(value) {
  const normalized = foldGroupText(value);
  return normalized === "team hires" || normalized === foldGroupText(GROUP_LABELS_PT["TEAM HIRES"]);
}

function normalizeTopico(item) {
  return {
    id: String(item?.id ?? ""),
    nome: String(item?.nome ?? ""),
    grupo: getGroupLabelPt(item?.grupo),
    orcamentoProgramaBRL: Number(item?.orcamentoProgramaBRL ?? 0),
    incluirNoResumo: Boolean(item?.incluirNoResumo),
    permitirLancamento: Boolean(item?.permitirLancamento),
    permitirLancamentoEfetivo: Boolean(item?.permitirLancamentoEfetivo),
  };
}

function buildDraftMap(topicos) {
  const entries = {};
  for (const topic of topicos) {
    entries[topic.id] = {
      nome: topic.nome,
      grupo: getGroupLabelPt(topic.grupo),
      orcamentoProgramaBRL: String(Number(topic.orcamentoProgramaBRL ?? 0)),
      incluirNoResumo: Boolean(topic.incluirNoResumo),
      permitirLancamento: Boolean(topic.permitirLancamento),
    };
  }
  return entries;
}

function parseBudget(value) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(parsed)) return NaN;
  return parsed;
}

function isTopicDraftDirty(topic, draft) {
  if (!topic || !draft) return false;

  const topicNome = String(topic.nome ?? "").trim();
  const draftNome = String(draft.nome ?? "").trim();
  const topicGroup = foldGroupText(getGroupLabelPt(topic.grupo));
  const draftGroup = foldGroupText(draft.grupo);
  const topicBudget = Number(topic.orcamentoProgramaBRL ?? 0);
  const draftBudget = parseBudget(draft.orcamentoProgramaBRL);
  const budgetChanged =
    !Number.isFinite(draftBudget) || Math.abs(draftBudget - topicBudget) > 0.000001;
  const groupChanged = draftGroup !== topicGroup;
  const resumoChanged = Boolean(draft.incluirNoResumo) !== Boolean(topic.incluirNoResumo);
  const lancamentoChanged = Boolean(draft.permitirLancamento) !== Boolean(topic.permitirLancamento);

  return (
    draftNome !== topicNome || groupChanged || budgetChanged || resumoChanged || lancamentoChanged
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function addSetValue(currentSet, value) {
  const next = new Set(currentSet);
  next.add(value);
  return next;
}

function removeSetValue(currentSet, value) {
  const next = new Set(currentSet);
  next.delete(value);
  return next;
}

export default function ConfigApp({ onError }) {
  const [isDark, setIsDark] = useState(() => document.body.classList.contains("theme-dark"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [auth, setAuth] = useState(null);
  const [topics, setTopics] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [filterGroup, setFilterGroup] = useState(ALL_GROUPS_VALUE);
  const [isEditMode, setIsEditMode] = useState(false);
  const [savingIds, setSavingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [newTopic, setNewTopic] = useState({
    nome: "",
    grupo: "COMMUNICATIONS & PUBLICATIONS",
    orcamentoProgramaBRL: "0",
    incluirNoResumo: true,
    permitirLancamento: true,
  });

  const canManageConfig = Boolean(auth?.permissions?.canManageConfig);

  const onToggleTheme = useCallback(() => {
    const nextIsDark = !document.body.classList.contains("theme-dark");
    document.body.classList.toggle("theme-dark", nextIsDark);
    setIsDark(nextIsDark);

    try {
      localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    } catch {}

    const legacyToggle = document.getElementById("theme-toggle");
    if (legacyToggle && "checked" in legacyToggle) {
      legacyToggle.checked = nextIsDark;
      legacyToggle.setAttribute("aria-checked", nextIsDark ? "true" : "false");
      legacyToggle.setAttribute("title", nextIsDark ? "Ativar tema claro" : "Ativar tema escuro");
    }
  }, []);

  const emitTopicsChanged = useCallback(() => {
    window.dispatchEvent(new CustomEvent("config:topics-changed"));
  }, []);

  const pushError = useCallback(
    (message) => {
      const finalMessage = String(message || "Falha ao processar requisição.");
      setError(finalMessage);
      if (typeof onError === "function") {
        onError(finalMessage);
      }
    },
    [onError]
  );

  const loadTopics = useCallback(async () => {
    const payload = await getTopicos();
    const normalized = Array.isArray(payload) ? payload.map(normalizeTopico) : [];
    setTopics(normalized);
    setDrafts(buildDraftMap(normalized));
    return normalized;
  }, []);

  const loadAuth = useCallback(async () => {
    const status = await getAuthStatus();
    if (!status?.authenticated) {
      window.location.href = "/login";
      return null;
    }
    setAuth(status);
    return status;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadAuth(), loadTopics()]);
      } catch (loadError) {
        if (!active) return;
        pushError(loadError?.message || "Falha ao carregar dados da configuracao.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadAuth, loadTopics, pushError]);

  useEffect(() => {
    const unsubscribe = subscribeThemeChange(setIsDark);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!canManageConfig) {
      setIsEditMode(false);
      setShowCreatePanel(false);
    }
  }, [canManageConfig]);

  useEffect(() => {
    if (!error) return () => {};
    const timer = setTimeout(() => setError(""), 3600);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!notice) return () => {};
    const timer = setTimeout(() => setNotice(""), 2400);
    return () => clearTimeout(timer);
  }, [notice]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const topic of topics) {
      const label = getGroupLabelPt(topic.grupo);
      if (!label || label === "Sem grupo") continue;
      map.set(foldGroupText(label), label);
    }
    return [
      { value: ALL_GROUPS_VALUE, label: "Todos os Macro-Tópicos" },
      ...[...map.values()]
        .sort((a, b) => a.localeCompare(b))
        .map((label) => ({ value: label, label })),
    ];
  }, [topics]);

  const groupSuggestions = useMemo(() => {
    return groups.filter((group) => group.value !== ALL_GROUPS_VALUE).map((group) => group.label);
  }, [groups]);

  const filteredTopics = useMemo(() => {
    if (filterGroup === ALL_GROUPS_VALUE) return topics;
    return topics.filter((topic) => topic.grupo === filterGroup);
  }, [topics, filterGroup]);

  const totalBudget = useMemo(() => {
    return filteredTopics.reduce((sum, topic) => {
      const draft = drafts[topic.id];
      const fallback = Number(topic.orcamentoProgramaBRL ?? 0);
      const value = draft ? parseBudget(draft.orcamentoProgramaBRL) : fallback;
      return sum + (Number.isFinite(value) ? value : fallback);
    }, 0);
  }, [filteredTopics, drafts]);

  const selectedFilterLabel =
    groups.find((group) => group.value === filterGroup)?.label || "Todos os Macro-Tópicos";

  const dirtyTopicIds = useMemo(() => {
    return topics
      .filter((topic) => isTopicDraftDirty(topic, drafts[topic.id]))
      .map((topic) => topic.id);
  }, [drafts, topics]);

  const dirtyFilteredTopicIds = useMemo(() => {
    const visibleIds = new Set(filteredTopics.map((topic) => topic.id));
    return dirtyTopicIds.filter((topicId) => visibleIds.has(topicId));
  }, [dirtyTopicIds, filteredTopics]);

  const onFieldChange = useCallback((topicId, field, value) => {
    setDrafts((current) => {
      const currentDraft = {
        ...(current[topicId] || {}),
      };
      if (field === "grupo") {
        const nextGroup = String(value ?? "");
        const shouldDisableLaunch = isTeamHiresGroup(nextGroup);
        return {
          ...current,
          [topicId]: {
            ...currentDraft,
            grupo: nextGroup,
            permitirLancamento: shouldDisableLaunch
              ? false
              : Boolean(currentDraft.permitirLancamento),
          },
        };
      }
      return {
        ...current,
        [topicId]: {
          ...currentDraft,
          [field]: value,
        },
      };
    });
  }, []);

  const onToggleField = useCallback((topicId, field) => {
    setDrafts((current) => ({
      ...current,
      [topicId]: {
        ...(current[topicId] || {}),
        [field]: !Boolean(current?.[topicId]?.[field]),
      },
    }));
  }, []);

  const saveTopicDraft = useCallback(
    async (topicId) => {
      if (!canManageConfig || !isEditMode) return;
      const draft = drafts[topicId];
      if (!draft) return;

      const nome = String(draft.nome ?? "").trim();
      if (!nome) {
        throw new Error("Nome do topico e obrigatorio.");
      }

      const grupo = normalizeGroupText(draft.grupo);
      if (!grupo) {
        throw new Error("Grupo do topico e obrigatorio.");
      }

      const orcamento = parseBudget(draft.orcamentoProgramaBRL);
      if (!Number.isFinite(orcamento) || orcamento < 0) {
        throw new Error("Orcamento invalido.");
      }

      await updateTopico(topicId, {
        nome,
        grupo,
        orcamentoProgramaBRL: orcamento,
        incluirNoResumo: Boolean(draft.incluirNoResumo),
        permitirLancamento: isTeamHiresGroup(grupo) ? false : Boolean(draft.permitirLancamento),
      });
    },
    [canManageConfig, drafts, isEditMode]
  );

  const onSaveTopic = useCallback(
    async (topicId) => {
      if (!canManageConfig || !isEditMode) return;

      setSavingIds((current) => addSetValue(current, topicId));
      try {
        await saveTopicDraft(topicId);
        await loadTopics();
        emitTopicsChanged();
        setNotice("Topico atualizado com sucesso.");
      } catch (saveError) {
        pushError(saveError?.message || "Falha ao atualizar topico.");
      } finally {
        setSavingIds((current) => removeSetValue(current, topicId));
      }
    },
    [canManageConfig, emitTopicsChanged, isEditMode, loadTopics, pushError, saveTopicDraft]
  );

  const onSaveAllTopics = useCallback(async () => {
    if (!canManageConfig || !isEditMode) return;
    if (dirtyTopicIds.length === 0) {
      setNotice("Nenhuma alteracao pendente para salvar.");
      return;
    }

    const topicIdsToSave = [...dirtyTopicIds];
    const failedDraftSnapshot = {};
    for (const topicId of topicIdsToSave) {
      if (drafts[topicId]) {
        failedDraftSnapshot[topicId] = { ...drafts[topicId] };
      }
    }

    setIsSavingAll(true);
    try {
      const results = [];
      for (const topicId of topicIdsToSave) {
        setSavingIds((current) => addSetValue(current, topicId));
        try {
          await saveTopicDraft(topicId);
          results.push({ topicId, ok: true });
        } catch (saveError) {
          results.push({
            topicId,
            ok: false,
            message: saveError?.message || "Falha ao salvar topico.",
          });
        } finally {
          setSavingIds((current) => removeSetValue(current, topicId));
        }
      }

      const successCount = results.filter((item) => item.ok).length;
      const failed = results.filter((item) => !item.ok);

      if (successCount > 0) {
        await loadTopics();
        emitTopicsChanged();
        if (failed.length > 0) {
          setDrafts((current) => {
            const merged = { ...current };
            for (const item of failed) {
              const snapshot = failedDraftSnapshot[item.topicId];
              if (snapshot) {
                merged[item.topicId] = snapshot;
              }
            }
            return merged;
          });
        }
      }

      if (failed.length === 0) {
        setNotice(
          successCount === 1
            ? "1 topico salvo com sucesso."
            : `${successCount} topicos salvos com sucesso.`
        );
      } else if (successCount === 0) {
        pushError(failed[0]?.message || "Falha ao salvar topicos.");
      } else {
        pushError(
          `Salvos ${successCount} topico(s); ${failed.length} com erro. Primeiro erro: ${failed[0]?.message || "Falha ao salvar."}`
        );
      }
    } finally {
      setIsSavingAll(false);
    }
  }, [
    canManageConfig,
    dirtyTopicIds,
    drafts,
    emitTopicsChanged,
    isEditMode,
    loadTopics,
    pushError,
    saveTopicDraft,
  ]);

  const onDeleteTopic = useCallback(
    async (topicId) => {
      if (!canManageConfig || !isEditMode) return;

      const topic = topics.find((item) => item.id === topicId);
      const topicLabel = topic?.nome || topicId;
      const confirmed = window.confirm(
        `Deseja remover o tópico "${topicLabel}"? Esta ação não pode ser desfeita.`
      );
      if (!confirmed) return;

      setDeletingIds((current) => addSetValue(current, topicId));
      try {
        await deleteTopico(topicId);
        await loadTopics();
        emitTopicsChanged();
        setNotice("Tópico removido com sucesso.");
      } catch (deleteError) {
        pushError(deleteError?.message || "Falha ao remover tópico.");
      } finally {
        setDeletingIds((current) => removeSetValue(current, topicId));
      }
    },
    [canManageConfig, emitTopicsChanged, isEditMode, loadTopics, pushError, topics]
  );

  const openCreatePanel = useCallback(() => {
    if (!canManageConfig || !isEditMode) {
      pushError("Ative o modo edição para acrescentar tópicos.");
      return;
    }
    const suggestedGroup =
      filterGroup !== ALL_GROUPS_VALUE
        ? filterGroup
        : topics[0]?.grupo || "COMMUNICATIONS & PUBLICATIONS";
    setNewTopic({
      nome: "",
      grupo: getGroupLabelPt(suggestedGroup),
      orcamentoProgramaBRL: "0",
      incluirNoResumo: true,
      permitirLancamento: !isTeamHiresGroup(suggestedGroup),
    });
    setShowCreatePanel(true);
  }, [canManageConfig, filterGroup, isEditMode, pushError, topics]);

  const closeCreatePanel = useCallback(() => {
    setShowCreatePanel(false);
  }, []);

  const onCreateFieldChange = useCallback((field, value) => {
    setNewTopic((current) => {
      if (field === "grupo") {
        const shouldAllowLaunch = !isTeamHiresGroup(value);
        return {
          ...current,
          grupo: value,
          permitirLancamento: shouldAllowLaunch ? current.permitirLancamento : false,
        };
      }
      return {
        ...current,
        [field]: value,
      };
    });
  }, []);

  const onCreateSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!canManageConfig || !isEditMode) {
        pushError("Ative o modo edição para salvar tópicos.");
        return;
      }

      const nome = String(newTopic.nome ?? "").trim();
      const grupo = normalizeGroupText(newTopic.grupo);
      const orcamento = parseBudget(newTopic.orcamentoProgramaBRL);

      if (!nome) {
        pushError("Nome do tópico é obrigatório.");
        return;
      }
      if (!grupo) {
        pushError("Grupo do tópico é obrigatório.");
        return;
      }
      if (!Number.isFinite(orcamento) || orcamento < 0) {
        pushError("Orçamento inválido.");
        return;
      }

      setIsCreating(true);
      try {
        const created = await createTopico({
          nome,
          grupo,
          orcamentoProgramaBRL: orcamento,
          incluirNoResumo: Boolean(newTopic.incluirNoResumo),
          permitirLancamento: isTeamHiresGroup(grupo)
            ? false
            : Boolean(newTopic.permitirLancamento),
        });
        setFilterGroup(created?.grupo || grupo);
        setShowCreatePanel(false);
        await loadTopics();
        emitTopicsChanged();
        setNotice("Tópico criado com sucesso.");
      } catch (createError) {
        pushError(createError?.message || "Falha ao criar tópico.");
      } finally {
        setIsCreating(false);
      }
    },
    [canManageConfig, emitTopicsChanged, isEditMode, loadTopics, newTopic, pushError]
  );

  if (loading) {
    return (
      <div
        className={`config-react-scope rounded-2xl border p-6 ${
          isDark
            ? "border-slate-800/60 bg-slate-900/45 text-slate-300"
            : "border-slate-200 bg-white text-slate-700"
        }`}
      >
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className={`config-react-scope space-y-6 ${isDark ? "text-slate-200" : "text-slate-900"}`}>
      <ConfigHeader
        canManageConfig={canManageConfig}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode((current) => !current)}
        onOpenCreateModal={openCreatePanel}
        onToggleTheme={onToggleTheme}
        isDark={isDark}
      />

      {error ? (
        <div
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            isDark
              ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
              : "border-rose-300 bg-rose-50 text-rose-700"
          }`}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {notice ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            isDark
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
              : "border-emerald-300 bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice}
        </div>
      ) : null}

      {showCreatePanel ? (
        <div
          className={`rounded-2xl border p-5 shadow-xl ${
            isDark ? "border-slate-800/60 bg-slate-900/45" : "border-slate-200 bg-white"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-bold">Novo tópico</h4>
            <button
              type="button"
              onClick={closeCreatePanel}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                isDark
                  ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <X size={16} />
            </button>
          </div>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onCreateSubmit}>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Nome do tópico
              <input
                type="text"
                value={newTopic.nome}
                onChange={(event) => onCreateFieldChange("nome", event.target.value)}
                className={`rounded-lg border px-3 py-2 outline-none transition-all ${
                  isDark
                    ? "border-slate-700 bg-slate-950/45 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/60"
                    : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                }`}
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              Grupo
              <input
                type="text"
                value={newTopic.grupo}
                onChange={(event) => onCreateFieldChange("grupo", event.target.value)}
                list="config-group-suggestions"
                placeholder="Ex.: Comunicação e Publicações"
                className={`rounded-lg border px-3 py-2 outline-none transition-all ${
                  isDark
                    ? "border-slate-700 bg-slate-950/45 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/60"
                    : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                }`}
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold">
              Orçamento (BRL)
              <input
                type="number"
                min="0"
                step="0.01"
                value={newTopic.orcamentoProgramaBRL}
                onChange={(event) =>
                  onCreateFieldChange("orcamentoProgramaBRL", event.target.value)
                }
                className={`rounded-lg border px-3 py-2 outline-none transition-all ${
                  isDark
                    ? "border-slate-700 bg-slate-950/45 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/60"
                    : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                }`}
              />
            </label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={newTopic.incluirNoResumo}
                  onChange={(event) => onCreateFieldChange("incluirNoResumo", event.target.checked)}
                />
                Incluir no resumo
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={newTopic.permitirLancamento}
                  onChange={(event) =>
                    onCreateFieldChange("permitirLancamento", event.target.checked)
                  }
                  disabled={isTeamHiresGroup(newTopic.grupo)}
                />
                Lançamento ativo
              </label>
            </div>

            <div className="col-span-full flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeCreatePanel}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                  isDark
                    ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Salvando..." : "Criar tópico"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ConfigFiltersCard
          filterGroup={filterGroup}
          groups={groups}
          onChangeFilter={setFilterGroup}
          isDark={isDark}
        />
        <ConfigBudgetCard
          totalBudget={totalBudget}
          formatCurrency={formatCurrency}
          filterLabel={filterGroup === ALL_GROUPS_VALUE ? "Geral" : selectedFilterLabel}
          isDark={isDark}
        />
      </div>

      <ConfigTopicsTable
        filteredTopics={filteredTopics}
        drafts={drafts}
        filterLabel={selectedFilterLabel}
        isEditMode={isEditMode}
        canManageConfig={canManageConfig}
        isDark={isDark}
        savingIds={savingIds}
        deletingIds={deletingIds}
        isSavingAllTopics={isSavingAll}
        pendingTotalCount={dirtyTopicIds.length}
        pendingVisibleCount={dirtyFilteredTopicIds.length}
        getGroupLabel={getGroupLabelPt}
        groupSuggestions={groupSuggestions}
        onFieldChange={onFieldChange}
        onToggleField={onToggleField}
        onSaveAllTopics={onSaveAllTopics}
        onSaveTopic={onSaveTopic}
        onDeleteTopic={onDeleteTopic}
      />

      <div
        className={`flex flex-col items-center justify-between gap-4 rounded-xl border px-4 py-3 text-xs font-semibold sm:flex-row ${
          isDark
            ? "border-slate-800/60 bg-slate-950/35 text-slate-400"
            : "border-slate-200 bg-slate-50 text-slate-500"
        }`}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-500/90">
          <AlertCircle size={14} />
          <span>As alterações ficam pendentes até clicar em salvar.</span>
        </div>
        <span>
          A mostrar {filteredTopics.length} de {topics.length} tópicos
        </span>
      </div>
    </div>
  );
}
