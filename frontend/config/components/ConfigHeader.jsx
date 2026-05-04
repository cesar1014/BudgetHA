import React from "react";
import { Plus } from "lucide-react";

export default function ConfigHeader({
  canManageConfig,
  isEditMode,
  onToggleEditMode,
  onOpenCreateModal,
  onToggleTheme,
  isDark,
  themeToggleId = "config-theme-toggle",
}) {
  const headerTextClass = isDark ? "text-slate-300" : "text-slate-600";
  const titleClass = isDark ? "text-slate-100" : "text-slate-900";
  const controlSurface = isDark
    ? "border-slate-700/60 bg-slate-900/80 text-slate-200"
    : "border-slate-300/80 bg-white/90 text-slate-700";
  const switchTrackClass = isEditMode ? "bg-indigo-500" : isDark ? "bg-slate-700" : "bg-slate-300";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h3 className={`text-4xl font-extrabold tracking-tight md:text-5xl ${titleClass}`}>
          Configurações
        </h3>
        <p className={`max-w-4xl text-sm leading-relaxed md:text-[1.02rem] ${headerTextClass}`}>
          Faça a gestão dos tópicos, orçamentos e permissões de lançamento. O total é recalculado em
          tempo real conforme o filtro e os campos editados.
        </p>
      </div>

      <div className="flex justify-start md:justify-end">
        <div className="grid w-full max-w-[620px] grid-cols-1 gap-3 sm:grid-cols-3">
          {canManageConfig && isEditMode ? (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-indigo-300/25 bg-gradient-to-r from-indigo-600 to-blue-600 px-5 text-[1.02rem] font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] transition-all hover:from-indigo-500 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
            >
              <Plus size={20} className="transition-transform duration-300 group-hover:rotate-90" />
              Acrescentar Tópico
            </button>
          ) : (
            <div className="hidden sm:block" aria-hidden="true" />
          )}

          <div
            className={`inline-flex h-14 items-center justify-between gap-3 rounded-2xl border px-5 shadow-lg backdrop-blur ${controlSurface}`}
          >
            <span
              className={`text-[1.02rem] font-semibold ${isEditMode ? "text-indigo-400" : headerTextClass}`}
            >
              Modo Edição
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isEditMode}
              onClick={onToggleEditMode}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-300 ${switchTrackClass}`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow transition duration-300 ${
                  isEditMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div
            className={`inline-flex h-14 items-center justify-between gap-2 rounded-2xl border px-4 shadow-lg backdrop-blur ${controlSurface}`}
          >
            <span className={`text-[0.95rem] font-semibold ${headerTextClass}`}>Tema</span>
            <div className="menu-theme-toggle config-menu-theme-toggle">
              <input
                id={themeToggleId}
                className="theme-toggle-input"
                type="checkbox"
                role="switch"
                aria-label="Alternar tema claro e escuro"
                checked={isDark}
                onChange={onToggleTheme}
              />
              <label
                htmlFor={themeToggleId}
                className="theme-toggle-label"
                title="Alternar tema claro e escuro"
              >
                <span className="theme-toggle-stars" aria-hidden="true">
                  <span className="theme-toggle-star theme-toggle-star-1"></span>
                  <span className="theme-toggle-star theme-toggle-star-2"></span>
                  <span className="theme-toggle-star theme-toggle-star-3"></span>
                  <span className="theme-toggle-star theme-toggle-star-4"></span>
                  <span className="theme-toggle-star theme-toggle-star-5"></span>
                </span>
                <span className="theme-toggle-clouds" aria-hidden="true">
                  <span className="theme-toggle-cloud theme-toggle-cloud-1"></span>
                  <span className="theme-toggle-cloud theme-toggle-cloud-2"></span>
                  <span className="theme-toggle-cloud theme-toggle-cloud-3"></span>
                </span>
                <span className="theme-toggle-knob" aria-hidden="true">
                  <span className="theme-toggle-crater theme-toggle-crater-1"></span>
                  <span className="theme-toggle-crater theme-toggle-crater-2"></span>
                  <span className="theme-toggle-crater theme-toggle-crater-3"></span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
