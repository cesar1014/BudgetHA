import React from "react";
import { Inbox } from "lucide-react";

export default function EmptyState({ filterLabel, isDark }) {
  return (
    <tr>
      <td colSpan={6} className="px-6 py-16 text-center">
        <div
          className={`flex flex-col items-center justify-center ${isDark ? "text-slate-500" : "text-slate-400"}`}
        >
          <Inbox size={48} className="mb-4 opacity-50" />
          <p className={`text-lg font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            Nenhum tópico encontrado
          </p>
          <p className="mt-1 text-sm">Não existem tópicos para o filtro "{filterLabel}".</p>
        </div>
      </td>
    </tr>
  );
}
