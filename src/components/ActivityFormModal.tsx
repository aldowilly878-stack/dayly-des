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
      className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="activity-modal-content"
        className="bg-white dark:bg-slate-900 rounded-3xl elevation-4 w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg font-display tracking-tight">
            {activity ? t.modalTitleEdit : t.modalTitleAdd}
          </h3>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div id="form-error-banner" className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm rounded-xl border-l-4 border-red-500 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              {t.formTitleLabel} <span className="text-red-500">*</span>
            </label>
            <input
              id="form-input-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.formTitlePlaceholder}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
              maxLength={80}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              {t.formDescLabel}
            </label>
            <textarea
              id="form-input-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.formDescPlaceholder}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[90px] max-h-[160px] font-medium placeholder:text-slate-400 resize-none"
              maxLength={400}
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                {t.categoryLabel}
              </label>
              <select
                id="form-select-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
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
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                {t.priorityLabel}
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl w-full border border-slate-200 dark:border-slate-700">
                {PRIORITIES.map((prio) => {
                  const isActive = priority === prio;
                  const colorMap = {
                    Tinggi: isActive ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-red-600",
                    Sedang: isActive ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-amber-600",
                    Rendah: isActive ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-sky-600",
                  };
                  return (
                    <button
                      key={prio}
                      id={`prio-btn-${prio}`}
                      type="button"
                      onClick={() => setPriority(prio)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${colorMap[prio]}`}
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
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                {t.formStartTimeLabel}
              </label>
              <input
                id="form-input-starttime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                {t.formEndTimeLabel}
              </label>
              <input
                id="form-input-endtime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800 mt-2">
            <button
              id="cancel-modal-btn"
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              {t.formCancelBtn}
            </button>
            <button
              id="submit-modal-btn"
              type="submit"
              className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer active-press"
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
