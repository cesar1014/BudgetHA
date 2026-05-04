import React from "react";
import EmptyState from "./EmptyState.jsx";
import ConfigTopicRow from "./ConfigTopicRow.jsx";

export default function ConfigTopicsTable({
  filteredTopics,
  drafts,
  filterLabel,
  isEditMode,
  canManageConfig,
  isDark,
  savingIds,
  deletingIds,
  isSavingAllTopics,
  pendingTotalCount,
  pendingVisibleCount,
  getGroupLabel,
  groupSuggestions,
  onFieldChange,
  onToggleField,
  onSaveAllTopics,
  onSaveTopic,
  onDeleteTopic,
}) {
  const safeGroupSuggestions = Array.isArray(groupSuggestions) ? groupSuggestions : [];

  return (
    <div
      className={`overflow-hidden rounded-2xl border shadow-2xl ${
        isDark ? "border-slate-800/60 bg-slate-900/45" : "border-slate-200 bg-white/95"
      }`}
    >
      {canManageConfig && isEditMode ? (
        <div
          className={`flex flex-col items-start justify-between gap-3 border-b px-5 py-4 sm:flex-row sm:items-center ${
            isDark ? "border-slate-800/60 bg-slate-950/35" : "border-slate-200 bg-slate-50"
          }`}
        >
          <span
            className={`text-xs font-semibold uppercase tracking-[0.12em] ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Alteracoes pendentes: {pendingTotalCount}
            {pendingVisibleCount !== pendingTotalCount ? ` (${pendingVisibleCount} no filtro)` : ""}
          </span>
          <button
            type="button"
            onClick={onSaveAllTopics}
            disabled={isSavingAllTopics || pendingTotalCount === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingAllTopics
              ? "Salvando..."
              : pendingTotalCount > 0
                ? `Salvar tudo (${pendingTotalCount})`
                : "Salvar tudo"}
          </button>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <datalist id="config-group-suggestions">
          {safeGroupSuggestions.map((groupName) => (
            <option key={groupName} value={groupName} />
          ))}
        </datalist>
        <table className="w-full border-collapse">
          <thead>
            <tr
              className={`border-b text-left text-xs font-bold uppercase tracking-[0.14em] ${
                isDark
                  ? "border-slate-800/60 bg-slate-950/55 text-slate-400"
                  : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
            >
              <th className="whitespace-nowrap px-6 py-5">Tópico</th>
              <th className="whitespace-nowrap px-6 py-5">Grupo</th>
              <th className="whitespace-nowrap px-6 py-5 text-right">Orçamento</th>
              <th className="whitespace-nowrap px-6 py-5 text-center">No Resumo</th>
              <th className="whitespace-nowrap px-6 py-5 text-center">Lançamento</th>
              <th className="whitespace-nowrap px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className={isDark ? "divide-y divide-slate-800/55" : "divide-y divide-slate-200"}>
            {filteredTopics.length === 0 ? (
              <EmptyState filterLabel={filterLabel} isDark={isDark} />
            ) : (
              filteredTopics.map((topic) => (
                <ConfigTopicRow
                  key={topic.id}
                  topic={topic}
                  draft={drafts[topic.id]}
                  isEditMode={isEditMode}
                  canManageConfig={canManageConfig}
                  isDark={isDark}
                  isSaving={savingIds.has(topic.id)}
                  isDeleting={deletingIds.has(topic.id)}
                  getGroupLabel={getGroupLabel}
                  groupSuggestionsListId="config-group-suggestions"
                  onFieldChange={onFieldChange}
                  onToggleField={onToggleField}
                  onSave={onSaveTopic}
                  onDelete={onDeleteTopic}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
