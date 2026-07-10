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
      <div id="stat-card-total" className="bg-white dark:bg-slate-900 border-2 border-[#064E3B]/10 dark:border-emerald-500/20 p-5 rounded-3xl journal-card-shadow flex items-center justify-between hover:border-emerald-500/30 hover:scale-[1.01] transition-all duration-300">
        <div>
          <span className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">{t.statTotal}</span>
          <h4 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-1 font-display leading-none">{total}</h4>
        </div>
        <div className="p-3 bg-[#E6F9F3] dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0 border-2 border-[#064E3B]/10">
          <ListTodo className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Selesai Card */}
      <div id="stat-card-completed" className="bg-white dark:bg-slate-900 border-2 border-[#064E3B]/10 dark:border-emerald-500/20 p-5 rounded-3xl journal-card-shadow flex items-center justify-between hover:border-emerald-500/30 hover:scale-[1.01] transition-all duration-300">
        <div>
          <span className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">{t.statCompleted}</span>
          <h4 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-display leading-none">{completed}</h4>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0 border-2 border-[#064E3B]/15">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Belum Selesai Card */}
      <div id="stat-card-pending" className="bg-white dark:bg-slate-900 border-2 border-[#064E3B]/10 dark:border-emerald-500/20 p-5 rounded-3xl journal-card-shadow flex items-center justify-between hover:border-emerald-500/30 hover:scale-[1.01] transition-all duration-300">
        <div>
          <span className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">{t.statPending}</span>
          <h4 className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 mt-1 font-display leading-none">{pending}</h4>
        </div>
        <div className="p-3 bg-teal-50 dark:bg-emerald-950/30 text-teal-600 dark:text-teal-400 rounded-2xl shrink-0 border-2 border-[#064E3B]/10">
          <Circle className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Completion Progress Card */}
      <div id="stat-card-rate" className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 border-2 border-[#064E3B]/10 dark:border-emerald-500/20 p-5 rounded-3xl journal-card-shadow flex flex-col justify-between hover:border-emerald-500/30 hover:scale-[1.01] transition-all duration-300">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">{t.statProgress}</span>
            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-display">{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border-2 border-[#064E3B]/5 dark:border-slate-800">
            <div
              className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
          <Sparkles className="w-4 h-4 text-[#D97706] shrink-0" />
          <span className="truncate font-black tracking-tight uppercase font-sans">
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
