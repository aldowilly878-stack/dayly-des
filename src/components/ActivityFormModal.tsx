import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Tag, AlertTriangle, FileText, Check } from "lucide-react";
import { Activity, ActivityCategory, ActivityPriority } from "../types";
import { translations, Language } from "../translations";

interface ActivityFormModalProps {
  activity?: Activity; // If provided, we are editing
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: ActivityCategory;
    priority: ActivityPriority;
    startTime: string;
    endTime: string;
  }) => void;
  language: Language;
}

const CATEGORIES: ActivityCategory[] = ["Pekerjaan", "Belajar", "Kesehatan", "Rumah", "Lainnya"];
const PRIORITIES: ActivityPriority[] = ["Tinggi", "Sedang", "Rendah"];

export default function ActivityFormModal({ activity, onClose, onSubmit, language }: ActivityFormModalProps) {
  const t = translations[language];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("Pekerjaan");
  const [priority, setPriority] = useState<ActivityPriority>("Sedang");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setDescription(activity.description);
      setCategory(activity.category);
      setPriority(activity.priority);
      setStartTime(activity.startTime);
      setEndTime(activity.endTime);
    } else {
      // Clear values for new activity
      setTitle("");
      setDescription("");
      setCategory("Pekerjaan");
      setPriority("Sedang");
      setStartTime("");
      setEndTime("");
    }
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(language === "id" ? "Judul aktivitas wajib diisi." : "Activity title is required.");
      return;
    }
    setError(null);
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      startTime,
      endTime,
    });
  };

  const getPriorityLabel = (prio: ActivityPriority) => {
    if (prio === "Tinggi") return t.priorityHigh;
    if (prio === "Sedang") return t.priorityMedium;
    return t.priorityLow;
  };

  return (
    <div
      id="activity-modal-overlay"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="activity-modal-content"
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-emerald-100/40 dark:border-slate-800/80 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-100/30 dark:border-slate-800/60 bg-[#F4FAF7]/50 dark:bg-slate-950/20">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base font-sans">
            {activity ? t.modalTitleEdit : t.modalTitleAdd}
          </h3>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div id="form-error-banner" className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs rounded-xl border border-rose-100 dark:border-rose-900/40 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {t.formTitleLabel} <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                id="form-input-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.formTitlePlaceholder}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                maxLength={80}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {t.formDescLabel}
            </label>
            <div className="relative">
              <textarea
                id="form-input-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.formDescPlaceholder}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[80px] max-h-[160px] font-medium"
                maxLength={400}
              />
            </div>
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t.categoryLabel}
              </label>
              <select
                id="form-select-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer font-semibold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    📂 {cat === "Pekerjaan" ? (language === "id" ? "Pekerjaan" : "Work") : 
                        cat === "Belajar" ? (language === "id" ? "Belajar" : "Learn") : 
                        cat === "Kesehatan" ? (language === "id" ? "Kesehatan" : "Health") : 
                        cat === "Rumah" ? (language === "id" ? "Rumah" : "Home") : 
                        (language === "id" ? "Lainnya" : "Others")}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t.priorityLabel}
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full border border-transparent dark:border-slate-850">
                {PRIORITIES.map((prio) => {
                  const isActive = priority === prio;
                  const colorMap = {
                    Tinggi: isActive ? "bg-rose-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-rose-600",
                    Sedang: isActive ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-orange-600",
                    Rendah: isActive ? "bg-sky-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-sky-600",
                  };
                  return (
                    <button
                      key={prio}
                      id={`prio-btn-${prio}`}
                      type="button"
                      onClick={() => setPriority(prio)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${colorMap[prio]}`}
                    >
                      {getPriorityLabel(prio)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Start and End Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t.formStartTimeLabel}
              </label>
              <div className="relative">
                <input
                  id="form-input-starttime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t.formEndTimeLabel}
              </label>
              <div className="relative">
                <input
                  id="form-input-endtime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer font-medium"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-5">
            <button
              id="cancel-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer"
            >
              {t.formCancelBtn}
            </button>
            <button
              id="submit-modal-btn"
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-750 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{activity ? t.formSubmitEdit : t.formSubmitAdd}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
