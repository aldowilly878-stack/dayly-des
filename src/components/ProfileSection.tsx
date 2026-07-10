import React, { useState } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  FileText, 
  Edit3, 
  Check, 
  X, 
  Award, 
  TrendingUp, 
  Clock, 
  Trophy, 
  Activity as ActivityIcon,
  Flame,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { User, Activity } from "../types";
import { translations, Language } from "../translations";
import mascotImg from "../assets/images/dayly_mascot_1783408474403.jpg";

interface ProfileSectionProps {
  token: string;
  user: User;
  activities: Activity[];
  onUserUpdate: (updatedUser: User) => void;
  language: Language;
}

const AVATARS = [
  { id: "avatar-mascot", emoji: "💚", image: mascotImg, label: { id: "Mascot Dayly", en: "Dayly Mascot" } },
  { id: "avatar-1", emoji: "🧑‍💻", label: { id: "Pegiat Kode", en: "Coder" } },
  { id: "avatar-2", emoji: "🏃‍♂️", label: { id: "Pegiat Olahraga", en: "Athlete" } },
  { id: "avatar-3", emoji: "🧘‍♀️", label: { id: "Pegiat Meditasi", en: "Zen Master" } },
  { id: "avatar-4", emoji: "🎨", label: { id: "Pegiat Seni", en: "Artist" } },
  { id: "avatar-5", emoji: "🎓", label: { id: "Pegiat Belajar", en: "Scholar" } },
  { id: "avatar-6", emoji: "🌱", label: { id: "Pegiat Sehat", en: "Healer" } },
];

export default function ProfileSection({ token, user, activities, onUserUpdate, language }: ProfileSectionProps) {
  const t = translations[language];
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState(user.fullName || "");
  const [email, setEmail] = useState(user.email || "");
  const [bio, setBio] = useState(user.bio || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || "avatar-1");
  const [focusTarget, setFocusTarget] = useState(user.focusTarget || 4);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Compute profile statistics
  const totalActivities = activities.length;
  const completedActivities = activities.filter((a) => a.isCompleted).length;
  const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
  
  // Find top category
  const categoryCounts: Record<string, number> = {};
  activities.forEach((act) => {
    categoryCounts[act.category] = (categoryCounts[act.category] || 0) + 1;
  });
  
  let topCategory = "-";
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topCategory = cat;
    }
  });

  // Format Join Date
  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
          fullName: fullName.trim(),
          email: email.trim(),
          bio: bio.trim(),
          avatar: selectedAvatar,
          focusTarget: Number(focusTarget),
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        onUserUpdate(result.user);
        setSuccess(t.profileSuccess);
        setIsEditing(false);
        // Clear success toast after 3s
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.message || "Gagal memperbarui profil.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset fields to original user info
    setFullName(user.fullName || "");
    setEmail(user.email || "");
    setBio(user.bio || "");
    setSelectedAvatar(user.avatar || "avatar-1");
    setFocusTarget(user.focusTarget || 4);
    setIsEditing(false);
    setError(null);
  };

  const currentAvatarObj = AVATARS.find((av) => av.id === (user.avatar || "avatar-1")) || AVATARS[0];

  return (
    <div id="profile-section-wrapper" className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* LEFT CARD: AVATAR & BASIC DETAILS */}
        <div id="profile-info-card" className="flex-1 bg-white dark:bg-slate-900 border border-emerald-100/40 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg tracking-tight font-sans">
                {t.profileTitle}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
                {t.profileSubtitle}
              </p>
            </div>
            
            {!isEditing && (
              <button
                id="edit-profile-toggle-btn"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.profileEditBtn}</span>
              </button>
            )}
          </div>

          {/* Success / Error Messages */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs rounded-xl border border-rose-100 dark:border-rose-900/40">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              <span>{success}</span>
            </div>
          )}

          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4.5 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                {/* Big Avatar Ring */}
                <div className="w-24 h-24 bg-white dark:bg-slate-950 rounded-[1.8rem] flex items-center justify-center border border-emerald-100/60 dark:border-emerald-900/50 shadow-inner shrink-0 relative overflow-hidden p-1">
                  {currentAvatarObj.image ? (
                    <img src={currentAvatarObj.image} alt="Avatar" className="w-full h-full rounded-2xl object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-4xl animate-pulse-slow">{currentAvatarObj.emoji}</span>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-sm z-10">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg leading-tight truncate">
                      {user.fullName || user.username}
                    </h4>
                    <span className="inline-block self-center sm:self-start bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                      @{user.username}
                    </span>
                  </div>
                  
                  {user.email && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 font-bold" />
                      <span className="truncate font-semibold">{user.email}</span>
                    </p>
                  )}

                  <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t.profileJoinDate}: {formatDate(user.joinDate)}</span>
                  </p>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t.profileBio}</span>
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/60 rounded-2xl font-medium">
                    {user.bio ? `"${user.bio}"` : language === "id" ? "Belum ada bio pribadi." : "No personal bio written yet."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-emerald-50/20 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-800/40 p-4.5 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-xl shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        {t.profileFocusTarget}
                      </span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                        {user.focusTarget || 4} {t.profileHours}
                      </span>
                    </div>
                  </div>

                  <div className="bg-teal-50/20 dark:bg-teal-950/20 border border-teal-100/30 dark:border-teal-800/40 p-4.5 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-500 rounded-xl shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Streak
                      </span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                        {completedActivities >= 5 ? "🔥 5+ Selesai" : "🌱 Konsisten"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <form onSubmit={handleSave} className="space-y-4">
              {/* Avatar Chooser */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {t.profileAvatar}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 p-3 rounded-2xl">
                  {AVATARS.map((av) => {
                    const isSelected = selectedAvatar === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.id)}
                        className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white dark:bg-slate-900 border-emerald-500 text-emerald-600 shadow-md transform scale-105 font-bold"
                            : "border-transparent bg-transparent hover:bg-white/40 dark:hover:bg-slate-900/40 text-slate-500"
                        }`}
                      >
                        {av.image ? (
                          <img src={av.image} alt={av.id} className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-2xl">{av.emoji}</span>
                        )}
                        <span className="text-[9px] mt-1 font-bold truncate max-w-[50px] sm:max-w-none text-slate-400 dark:text-slate-500">
                          {language === "id" ? av.label.id : av.label.en}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t.profileFullName}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.profilePlaceholderFullName}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  maxLength={50}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t.profileEmail}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.profilePlaceholderEmail}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  maxLength={100}
                />
              </div>

              {/* Daily Focus Hours Target */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t.profileFocusTarget} ({t.profileHours})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={focusTarget}
                    onChange={(e) => setFocusTarget(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <span className="w-12 text-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/40 font-bold text-xs py-1 px-2.5 rounded-xl">
                    {focusTarget}h
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t.profileBio}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t.profilePlaceholderBio}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[80px] max-h-[140px] placeholder:text-slate-400"
                  maxLength={300}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-5">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-all"
                >
                  {t.profileCancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{t.profileSaveBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT CARD: STATS & ACHIEVEMENTS */}
        <div id="profile-stats-card" className="flex-1 bg-white dark:bg-slate-900 border border-emerald-100/40 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-4 tracking-tight flex items-center gap-1.5">
              <Award className="w-5 h-5 text-emerald-500" />
              <span>{t.profileTitleStats}</span>
            </h3>

            <div className="space-y-4">
              {/* Stat completion bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">{t.statProgress}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{completionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              {/* Achievements grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100/60 dark:border-slate-800/40 p-4 rounded-xl text-center space-y-1">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedActivities}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.profileStatCompleted}</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100/60 dark:border-slate-800/40 p-4 rounded-xl text-center space-y-1">
                  <div className="text-sm font-black text-teal-600 dark:text-teal-400 truncate">{topCategory}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{t.profileStatCategories}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Productivity badges list */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Lencana Prestasi (Badges)
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-emerald-50/60 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/40 dark:border-emerald-900/20">
                <span className="text-lg shrink-0">🚀</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">First Steps</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Selesaikan aktivitas pertamamu di DAYLY</p>
                </div>
                {completedActivities >= 1 && <span className="ml-auto text-emerald-500 font-semibold text-xs shrink-0">✅</span>}
              </div>

              <div className="flex items-center gap-3 p-2 bg-teal-50/60 dark:bg-teal-950/10 rounded-xl border border-teal-100/40 dark:border-teal-900/20">
                <span className="text-lg shrink-0">🏆</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Consistency Master</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Selesaikan 5 aktivitas</p>
                </div>
                {completedActivities >= 5 && <span className="ml-auto text-emerald-500 font-semibold text-xs shrink-0">✅</span>}
              </div>

              <div className="flex items-center gap-3 p-2 bg-rose-50/60 dark:bg-rose-950/10 rounded-xl border border-rose-100/40 dark:border-rose-900/20">
                <span className="text-lg shrink-0">🔥</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Productivity Ninja</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Rasio penyelesaian di atas 80%</p>
                </div>
                {completionRate >= 80 && completedActivities >= 3 && <span className="ml-auto text-emerald-500 font-semibold text-xs shrink-0">✅</span>}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
