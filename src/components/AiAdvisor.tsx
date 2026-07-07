import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { translations, Language } from "../translations";
import mascotImg from "../assets/images/dayly_mascot_1783408474403.jpg";

interface AiAdvisorProps {
  token: string;
  activitiesCount: number;
  language: Language;
}

export default function AiAdvisor({ token, activitiesCount, language }: AiAdvisorProps) {
  const t = translations[language];
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setAdvice(result.advice || "Saran tidak tersedia.");
      } else {
        throw new Error(result.message || "Gagal memuat saran AI.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Koneksi ke asisten AI gagal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdvice();
    }
  }, [token]);

  // Clean custom markdown parser for bullet lists, numbered lists, headings, and bold text
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Check if it's a heading
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-3 mb-1 uppercase tracking-wider">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-4 mb-2 border-b border-emerald-100 dark:border-emerald-950 pb-1">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} className="font-extrabold text-emerald-800 dark:text-emerald-300 text-base mt-4 mb-2">{line.replace("# ", "")}</h2>;
      }
      // Check for lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const cleanLine = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-1">
            {parseBoldTags(cleanLine)}
          </li>
        );
      }
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-1">
            {parseBoldTags(numMatch[2])}
          </li>
        );
      }
      // Blank spacing
      if (line.trim() === "") return <div key={idx} className="h-1.5" />;
      // Regular text
      return <p key={idx} className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-1">{parseBoldTags(line)}</p>;
    });
  };

  const parseBoldTags = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-800 dark:text-slate-100">{part}</strong> : part));
  };

  return (
    <div id="ai-advisor-card" className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-emerald-950/10 dark:via-slate-900 dark:to-teal-950/10 rounded-3xl border border-emerald-100/50 dark:border-slate-800/80 p-6 shadow-sm relative overflow-hidden transition-colors duration-300">
      {/* Decorative ambient blobs */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-teal-200/20 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border border-emerald-100 dark:border-slate-850 rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
            <img src={mascotImg} alt="Mascot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {language === "id" ? "Rekomendasi Sehat Dayly" : "Dayly Healthy Advice"}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
              {language === "id" ? "Rekomendasi pribadi Anda" : "Your companion recommendation"}
            </p>
          </div>
        </div>
        <button
          id="refresh-ai-btn"
          disabled={loading}
          onClick={fetchAdvice}
          className="p-1.5 rounded-xl border border-emerald-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
          title={t.aiRefreshTooltip}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="relative z-10">
        {loading ? (
          <div id="ai-loading-skeleton" className="space-y-2 py-2">
            <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4 animate-pulse" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-full animate-pulse" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-5/6 animate-pulse" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-4/5 animate-pulse" />
          </div>
        ) : error ? (
          <div id="ai-error-banner" className="flex gap-2 p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/50 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{t.aiErrorTitle}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">{error}</p>
            </div>
          </div>
        ) : (
          <div id="ai-advice-container" className="prose max-w-none text-slate-600 dark:text-slate-300 text-xs">
            {renderFormattedText(advice)}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-emerald-50 dark:border-slate-800/80 flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>{t.aiFooterText}</span>
      </div>
    </div>
  );
}
