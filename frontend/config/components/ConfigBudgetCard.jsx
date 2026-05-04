import React from "react";
import { Wallet } from "lucide-react";

export default function ConfigBudgetCard({ totalBudget, formatCurrency, filterLabel, isDark }) {
  return (
    <div
      className={`group relative col-span-1 flex min-h-[142px] flex-col justify-center overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-xl ${
        isDark
          ? "border-slate-800/60 bg-gradient-to-br from-slate-900/85 to-slate-900/45"
          : "border-slate-200 bg-gradient-to-br from-white to-slate-100"
      }`}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl transition-all group-hover:bg-indigo-500/20" />
      <div
        className={`relative z-10 mb-2 inline-flex w-fit items-center justify-start gap-2 text-xs font-bold uppercase tracking-[0.08em] ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        <Wallet size={14} className="text-indigo-400" />
        Orcamento Total ({filterLabel})
      </div>
      <div
        className={`relative z-10 text-left text-[2.45rem] font-extrabold leading-none ${
          isDark ? "text-indigo-200" : "text-indigo-900"
        }`}
      >
        {formatCurrency(totalBudget)}
      </div>
    </div>
  );
}
