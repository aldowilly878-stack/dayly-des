import React from "react";
import { CheckCircle2, Circle, ListTodo, Award, Sparkles } from "lucide-react";
import { Activity } from "../types";
import { translations, Language } from "../translations";

interface StatsSectionProps {
  activities: Activity[];
  language: Language;
}

export default function StatsSection({ activities, language }: StatsSectionProps) {
  const t = translations[language];
  const total = activities.length;
  const completed = activities.filter((a) => a.isCompleted).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Compute breakdown by category
  const categories: { name: string; count: number; color: string; bg: string }[] = [
    { name: "Pekerjaan", count: 0, color: "text-blue-500", bg: "bg-blue-500" },
    { name: "Belajar", count: 0, color: "text-emerald-500", bg: "bg-emerald-500" },
    { name: "Kesehatan", count: 0, color: "text-emerald-600", bg: "bg-emerald-600" },
    { name: "Rumah", count: 0, color: "text-amber-500", bg: "bg-amber-500" },
    { name: "Lainnya", count: 0, color: "text-slate-500", bg: "bg-slate-500" },
  ];

  activities.forEach((act) => {
    const cat = categories.find((c) => c.name === act.category);
    if (cat) cat.count += 1;
  });

  return (
    <div id="stats-section-container" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Card */}
      <div id="stat-card-total" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl elevation-2 card-hover flex items-center justify-between transition-all duration-300">
        <div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.statTotal}</span>
          <h4 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 font-display leading-none">{total}</h4>
        </div>
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
          <ListTodo className="w-5 h-5 stroke-[2]" />
        </div>
      </div>

      {/* Selesai Card */}
      <div id="stat-card-completed" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl elevation-2 card-hover flex items-center justify-between transition-all duration-300">
        <div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.statCompleted}</span>
          <h4 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-display leading-none">{completed}</h4>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
          <CheckCircle2 className="w-5 h-5 stroke-[2]" />
        </div>
      </div>

      {/* Pending Card */}
      <div id="stat-card-pending" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl elevation-2 card-hover flex items-center justify-between transition-all duration-300">
        <div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.statPending}</span>
          <h4 className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 mt-1 font-display leading-none">{pending}</h4>
        </div>
        <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-2xl shrink-0">
          <Circle className="w-5 h-5 stroke-[2]" />
        </div>
      </div>

      {/* Progress Card */}
      <div id="stat-card-rate" className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl elevation-2 card-hover flex flex-col justify-between transition-all duration-300">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.statProgress}</span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-display">{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate font-medium">
            {completionRate === 100
              ? t.quoteCompleted
              : completionRate >= 70
              ? t.quoteGreat
              : completionRate >= 40
              ? t.quoteKeepGoing
              : total === 0
              ? t.quoteNoTasks
              : t.quoteLetStart}
          </span>
        </div>
      </div>
    </div>
  );
}
