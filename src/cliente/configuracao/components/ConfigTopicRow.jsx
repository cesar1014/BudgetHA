import React from "react";
import { Save, Trash2 } from "lucide-react";

function normalizeSimple(value) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isTeamHiresGroupValue(value) {
  const normalized = normalizeSimple(value);
  return normalized === "team hires" || normalized === "contratacoes da equipe";
}

function TogglePill({ checked, disabled, onClick, tone = "indigo", isDark }) {
  const onClass = tone === "emerald" ? "bg-emerald-500" : "bg-indigo-500";
  const offClass = isDark ? "bg-slate-700" : "bg-slate-300";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
        checked ? onClass : offClass
      } ${disabled ? "cursor-default opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function ConfigTopicRow({
  topic,
  draft,
  isEditMode,
  canManageConfig,
  isDark,
  isSaving,
  isDeleting,
  onFieldChange,
  onToggleField,
  onSave,
  onDelete,
  getGroupLabel,
  groupSuggestionsListId,
}) {
  const editable = canManageConfig && isEditMode;
  const isTeamHires = isTeamHiresGroupValue(draft?.grupo);
  const cellInputClass = editable
    ? isDark
      ? "text-slate-200 border border-slate-700/40 hover:border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/60 bg-slate-950/40"
      : "text-slate-900 border border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 bg-white"
    : isDark
      ? "text-slate-300 border border-transparent bg-transparent cursor-default"
      : "text-slate-700 border border-transparent bg-transparent cursor-default";

  return (
    <tr
      className={`group/row transition-colors ${isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-100/70"}`}
    >
      <td className="px-6 py-4">
        <input
          type="text"
          value={draft.nome}
          readOnly={!editable}
          onChange={(event) => onFieldChange(topic.id, "nome", event.target.value)}
          className={`w-full rounded-md px-3 py-1.5 text-sm font-semibold outline-none transition-all ${cellInputClass}`}
        />
      </td>

      <td className="px-6 py-4">
        {editable ? (
          <input
            type="text"
            list={groupSuggestionsListId}
            value={draft?.grupo ?? ""}
            onChange={(event) => onFieldChange(topic.id, "grupo", event.target.value)}
            className={`w-full rounded-md px-3 py-1.5 text-sm font-semibold outline-none transition-all ${cellInputClass}`}
            placeholder="Informe o grupo"
          />
        ) : (
          <span
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
              isDark
                ? "border-slate-700/50 bg-slate-800/60 text-slate-300"
                : "border-slate-300 bg-slate-100 text-slate-700"
            }`}
          >
            {getGroupLabel(topic.grupo)}
          </span>
        )}
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className={`text-xs font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            R$
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={draft.orcamentoProgramaBRL}
            readOnly={!editable}
            onChange={(event) =>
              onFieldChange(topic.id, "orcamentoProgramaBRL", event.target.value)
            }
            className={`w-32 rounded-md px-3 py-1.5 text-right font-mono text-sm outline-none transition-all ${cellInputClass}`}
          />
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <div className="flex justify-center">
          <TogglePill
            checked={Boolean(draft.incluirNoResumo)}
            disabled={!editable}
            tone="indigo"
            isDark={isDark}
            onClick={() => onToggleField(topic.id, "incluirNoResumo")}
          />
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <div className="flex justify-center">
          <TogglePill
            checked={Boolean(draft.permitirLancamento)}
            disabled={!editable || isTeamHires}
            tone="emerald"
            isDark={isDark}
            onClick={() => onToggleField(topic.id, "permitirLancamento")}
          />
        </div>
      </td>

      <td className="px-6 py-4 text-right">
        {editable ? (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onSave(topic.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              title="Salvar alterações"
            >
              <Save size={16} />
              <span>{isSaving ? "Salvando..." : "Salvar"}</span>
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(topic.id)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                isDark
                  ? "text-slate-400 hover:bg-rose-500/15 hover:text-rose-400"
                  : "text-slate-500 hover:bg-rose-100 hover:text-rose-600"
              } disabled:cursor-not-allowed disabled:opacity-50`}
              title="Remover tópico"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ) : (
          <span className={`text-xs font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {canManageConfig ? "Ative o modo edição" : "Somente leitura"}
          </span>
        )}
      </td>
    </tr>
  );
}
