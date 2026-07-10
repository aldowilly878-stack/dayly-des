import React, { useState } from "react";
import { 
  Globe, 
  Sun, 
  Moon, 
  Check, 
  Settings, 
  ShieldAlert
} from "lucide-react";
import { User } from "../types";
import { translations, Language } from "../translations";

interface SettingsSectionProps {
  token: string;
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function SettingsSection({ 
  token, 
  user, 
  onUserUpdate, 
  language,
  onLanguageChange 
}: SettingsSectionProps) {
  const t = translations[language];
  
  // Settings Local State
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(user.theme || "light");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          theme: selectedTheme,
          language: selectedLang,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        onUserUpdate(result.user);
        onLanguageChange(selectedLang);
        setSuccess(t.settingsSuccess);
        
        // Dynamic success alert timeout
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.message || "Gagal menyimpan pengaturan.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="settings-section-card" className="bg-white dark:bg-slate-900 border border-emerald-100/50 dark:border-slate-850 rounded-3xl p-6 shadow-sm transition-all duration-300 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-xl">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg tracking-tight font-sans">
            {t.settingsTitle}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
            {t.settingsSubtitle}
          </p>
        </div>
      </div>

      {/* Success / Error Messages */}
      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs rounded-xl border border-rose-100 dark:border-rose-900/40 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>{t.settingsLanguage}</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Indonesian */}
            <button
              id="lang-btn-id"
              onClick={() => setSelectedLang("id")}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                selectedLang === "id"
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🇮🇩</span>
                <span className="text-xs font-semibold">Bahasa Indonesia</span>
              </div>
              {selectedLang === "id" && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />}
            </button>

            {/* English */}
            <button
              id="lang-btn-en"
              onClick={() => setSelectedLang("en")}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                selectedLang === "en"
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🇬🇧</span>
                <span className="text-xs font-semibold">English</span>
              </div>
              {selectedLang === "en" && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />}
            </button>
          </div>
        </div>

        {/* Appearance Mode Selection */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>{t.settingsTheme}</span>
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Light Mode */}
            <button
              id="theme-btn-light"
              onClick={() => {
                setSelectedTheme("light");
                document.documentElement.classList.remove("dark");
              }}
              className={`flex flex-col items-center justify-center p-5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                selectedTheme === "light"
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50"
              }`}
            >
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full">
                <Sun className="w-5 h-5 fill-amber-500" />
              </div>
              <span className="text-xs font-semibold">{t.settingsThemeLight}</span>
              {selectedTheme === "light" && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />}
            </button>

            {/* Dark Mode */}
            <button
              id="theme-btn-dark"
              onClick={() => {
                setSelectedTheme("dark");
                document.documentElement.classList.add("dark");
              }}
              className={`flex flex-col items-center justify-center p-5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                selectedTheme === "dark"
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50"
              }`}
            >
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/30 text-teal-500 rounded-full">
                <Moon className="w-5 h-5 fill-teal-500 text-teal-500" />
              </div>
              <span className="text-xs font-semibold">{t.settingsThemeDark}</span>
              {selectedTheme === "dark" && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />}
            </button>
          </div>
        </div>

        {/* Save Controls */}
        <div className="flex items-center justify-end pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/60">
          <button
            id="save-settings-btn"
            onClick={handleSaveSettings}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t.settingsSaveBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
