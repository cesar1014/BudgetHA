import React, { useRef } from "react";
import { ChevronDown, Layers } from "lucide-react";

export default function ConfigFiltersCard({ filterGroup, groups, onChangeFilter, isDark }) {
  const selectRef = useRef(null);

  const openGroupPicker = () => {
    const node = selectRef.current;
    if (!node) return;
    node.focus();
    if (typeof node.showPicker === "function") {
      try {
        node.showPicker();
        return;
      } catch {
        // Fallback para navegadores sem suporte completo.
      }
    }
    node.click();
  };

  return (
    <div
      className={`col-span-1 flex min-h-[142px] flex-col justify-center rounded-2xl border p-5 shadow-xl backdrop-blur-xl md:col-span-2 md:p-6 ${
        isDark ? "border-slate-800/65 bg-slate-900/45" : "border-slate-200/90 bg-white/90"
      }`}
    >
      <div
        className={`mb-3 inline-flex w-fit items-center justify-start gap-2 text-xs font-bold uppercase tracking-[0.08em] ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        <Layers size={14} />
        Filtrar por Macro-Topico
      </div>
      <div className="relative w-full max-w-[360px]">
        <select
          ref={selectRef}
          value={filterGroup}
          onChange={(event) => onChangeFilter(event.target.value)}
          className={`h-12 w-full appearance-none rounded-xl border px-4 py-3 text-[1.04rem] font-semibold leading-none outline-none transition-all ${
            isDark
              ? "border-slate-700/60 bg-slate-950/50 text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
          }`}
        >
          {groups.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={openGroupPicker}
          aria-label="Abrir lista de macro-topicos"
          className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center"
        >
          <ChevronDown size={16} className={isDark ? "text-slate-500" : "text-slate-400"} />
        </button>
      </div>
    </div>
  );
}
