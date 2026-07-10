import React, { useState, useEffect } from "react";
import {
  LogOut,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  Check,
  User as UserIcon,
  Activity as ActivityIcon,
  Tag,
  BarChart,
  HelpCircle,
  Brain,
  Sparkles,
  Trophy,
  Award,
  X,
  Settings,
  Briefcase,
  BookOpen,
  Heart,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ActivityCategory, ActivityPriority, User } from "../types";
import StatsSection from "./StatsSection";
import PomodoroTimer from "./PomodoroTimer";
import AiAdvisor from "./AiAdvisor";
import ActivityFormModal from "./ActivityFormModal";
import ProfileSection from "./ProfileSection";
import SettingsSection from "./SettingsSection";
import AiChatWidget from "./AiChatWidget";
import { translations, Language } from "../translations";
import mascotImg from "../assets/images/dayly_mascot_1783408474403.jpg";
import productiveIllustration from "../assets/images/productive_day_illustration_1783408489866.jpg";

interface DashboardProps {
  token: string;
  user: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

export default function Dashboard({ token, user, onLogout, onUserUpdate }: DashboardProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile & Settings Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<"profile" | "settings">("profile");
  
  // Language Context
  const [language, setLanguage] = useState<Language>((user.language as Language) || "id");
  const t = translations[language];

  // Mobile View Switcher Tab State (Tasks list vs Companion Tools inside Dashboard)
  const [activeMobileTab, setActiveMobileTab] = useState<"tasks" | "focus">("tasks");

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"Semua" | "Belum" | "Selesai">("Belum");
  const [filterCategory, setFilterCategory] = useState<string>("Semua");
  const [filterPriority, setFilterPriority] = useState<string>("Semua");

  // Deletion Confirm states
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Celebration Popup State
  const [completedActivityPopup, setCompletedActivityPopup] = useState<Activity | null>(null);

  // Mascot Interactive companion state
  const [petCount, setPetCount] = useState<number>(() => {
    // Gunakan user.id untuk memastikan jumlah pet terpisah per akun
    const stored = localStorage.getItem(`dayly_mascot_pets_${user.id}`);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [selectedCategory, setSelectedCategory] = useState<"Semua" | "Pekerjaan" | "Belajar" | "Kesehatan" | "Rumah">("Semua");
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isCelebrating, setIsCelebrating] = useState<boolean>(false);

  interface MascotTip {
    textId: string;
    textEn: string;
    category: "Pekerjaan" | "Belajar" | "Kesehatan" | "Rumah";
    categoryEn: "Work" | "Study" | "Health" | "Home";
  }

  const MASCOT_TIPS: MascotTip[] = [
    // === PEKERJAAN (Work) ===
    {
      textId: "Prioritaskan 1 tugas terpenting saat ini. Matikan tab browser lain yang mendistraksi pekerjaanmu! 💻",
      textEn: "Prioritize your 1 most important task now. Close other distracting browser tabs! 💻",
      category: "Pekerjaan",
      categoryEn: "Work"
    },
    {
      textId: "Atur timer fokus selama 25 menit (Pomodoro) untuk menuntaskan dokumen atau tugas pentingmu ⏱️",
      textEn: "Set a 25-minute focus timer (Pomodoro) to wrap up your important documents or tasks ⏱️",
      category: "Pekerjaan",
      categoryEn: "Work"
    },
    {
      textId: "Berdiri dan regangkan pergelangan tanganmu selama 15 detik agar tidak pegal akibat mengetik seharian ⌨️",
      textEn: "Stand up and stretch your wrists for 15 seconds to ease fatigue from typing all day ⌨️",
      category: "Pekerjaan",
      categoryEn: "Work"
    },
    {
      textId: "Tulis daftar 'Tugas Selesai' (Done List). Melihat pencapaian kecil akan memicu motivasi kerjamu! 📝",
      textEn: "Write down a 'Done List'. Seeing small achievements will spark your work motivation! 📝",
      category: "Pekerjaan",
      categoryEn: "Work"
    },
    {
      textId: "Rapikan tumpukan kertas di samping laptopmu. Lingkungan kerja bersih bikin fokus melesat! 📂",
      textEn: "Tidy up the paper pile next to your laptop. A clean workspace boosts your concentration! 📂",
      category: "Pekerjaan",
      categoryEn: "Work"
    },

    // === BELAJAR (Study) ===
    {
      textId: "Aktifkan mode Jangan Ganggu (Do Not Disturb) di ponselmu selama sesi belajar ini agar materi terserap baik 📵",
      textEn: "Turn on 'Do Not Disturb' mode on your phone during this study session for optimal brain retention 📵",
      category: "Belajar",
      categoryEn: "Study"
    },
    {
      textId: "Siapkan air minum dan buku catatan kecil di mejamu sebelum mulai mempelajari topik baru 💧",
      textEn: "Prepare water and a small notebook on your desk before diving into new topics 💧",
      category: "Belajar",
      categoryEn: "Study"
    },
    {
      textId: "Tulis ringkasan singkat dengan bahasamu sendiri tentang konsep terakhir yang baru saja kamu pelajari 📖",
      textEn: "Write a quick summary in your own words about the latest concept you just learned 📖",
      category: "Belajar",
      categoryEn: "Study"
    },
    {
      textId: "Gunakan teknik mengajar (Feynman). Jelaskan materi belajar tadi ke boneka atau dinding seolah kamu gurunya! 🎓",
      textEn: "Use the Feynman technique. Explain the lesson to a plushie or wall as if you're the teacher! 🎓",
      category: "Belajar",
      categoryEn: "Study"
    },
    {
      textId: "Rayakan keberhasilan memahami satu bab sulit dengan istirahat rileks 5 menit tanpa membuka gadget 🧘‍♀️",
      textEn: "Celebrate understanding a tough chapter with a 5-minute offline relaxation break 🧘‍♀️",
      category: "Belajar",
      categoryEn: "Study"
    },

    // === KESEHATAN (Health) ===
    {
      textId: "Minum segelas air putih sekarang untuk menyegarkan kembali tubuh dan menghidrasi otakmu! 💧",
      textEn: "Drink a glass of fresh water right now to rehydrate your body and keep your brain sharp! 💧",
      category: "Kesehatan",
      categoryEn: "Health"
    },
    {
      textId: "Istirahatkan mata dengan aturan 20-20-20: Lihat objek sejauh 6 meter selama 20 detik tiap 20 menit 🌿",
      textEn: "Rest your eyes with the 20-20-20 rule: Look at something 20 feet away for 20 seconds every 20 minutes 🌿",
      category: "Kesehatan",
      categoryEn: "Health"
    },
    {
      textId: "Tarik napas dalam-dalam dari hidung 4 detik, tahan 4 detik, lalu hembuskan pelan dari mulut 10 kali 🌬️",
      textEn: "Take a deep breath (4s inhale, 4s hold, and slow exhale) 10 times to calm your nervous system 🌬️",
      category: "Kesehatan",
      categoryEn: "Health"
    },
    {
      textId: "Putar bahumu perlahan ke depan dan belakang sebanyak 10 kali untuk mengendurkan ketegangan leher 💪",
      textEn: "Roll your shoulders slowly forward and backward 10 times to release neck and shoulder tension 💪",
      category: "Kesehatan",
      categoryEn: "Health"
    },
    {
      textId: "Pijat lembut pelipis matamu atau regangkan leher ke kanan dan kiri selama 15 detik 💆‍♂️",
      textEn: "Gently massage your temples or tilt your neck left and right for 15 seconds to relax 💆‍♂️",
      category: "Kesehatan",
      categoryEn: "Health"
    },

    // === RUMAH (Home) ===
    {
      textId: "Buka jendela kamarmu sebentar agar sirkulasi udara segar dan cahaya matahari pagi masuk menerangi ruangan 🍃",
      textEn: "Open your window for a bit to let fresh air and natural sunlight brighten up your room 🍃",
      category: "Rumah",
      categoryEn: "Home"
    },
    {
      textId: "Bawa gelas atau piring kotor dari mejamu ke tempat cucian dapur sekarang juga agar kamarmu tetap rapi 🍽️",
      textEn: "Take dirty glasses or plates from your desk to the kitchen sink right now to keep your space neat 🍽️",
      category: "Rumah",
      categoryEn: "Home"
    },
    {
      textId: "Rapikan kasur atau bantal kursimu. Tempat istirahat yang rapi akan menyegarkan pandanganmu! 🛌",
      textEn: "Make your bed or fluff your chair cushions. A tidy resting space refreshes your eyes! 🛌",
      category: "Rumah",
      categoryEn: "Home"
    },
    {
      textId: "Berdirilah dan hirup udara segar di teras rumah atau jendela selama 1 menit untuk mengisi ulang energi positifmu 🏡",
      textEn: "Stand on the porch or near a window and take fresh breaths for 1 minute to recharge your home spirit 🏡",
      category: "Rumah",
      categoryEn: "Home"
    },
    {
      textId: "Rapikan kabel-kabel pengisi daya (charger) yang berantakan di dekat tempat belajarmu agar terlihat estetik 🔌",
      textEn: "Neatly organize messy charging cables near your workspace to make it look clean and aesthetic 🔌",
      category: "Rumah",
      categoryEn: "Home"
    }
  ];

  // Derive current step (0 to 4) based on current level progress (petCount % 5)
  const currentStep = petCount % 5;

  // Function to get active tip based on selectedCategory and current step
  const getActiveTip = (): MascotTip => {
    let targetCategory: "Pekerjaan" | "Belajar" | "Kesehatan" | "Rumah";
    
    if (selectedCategory === "Semua") {
      // For "Semua", cycle categories based on the current progress step
      const categories: ("Pekerjaan" | "Belajar" | "Kesehatan" | "Rumah")[] = ["Pekerjaan", "Belajar", "Kesehatan", "Rumah", "Pekerjaan"];
      targetCategory = categories[currentStep] || "Kesehatan";
    } else {
      targetCategory = selectedCategory;
    }
    
    const categoryTips = MASCOT_TIPS.filter(tip => tip.category === targetCategory);
    return categoryTips[currentStep] || categoryTips[0] || MASCOT_TIPS[0];
  };

  const activeTip = getActiveTip();

  const handlePetMascot = () => {
    if (isJumping || isCelebrating) return;
    setIsJumping(true);
    setTimeout(() => {
      setIsJumping(false);
    }, 600);
  };

  const handleCompleteTip = () => {
    if (isCelebrating) return;
    
    // Jump animation
    setIsJumping(true);
    setTimeout(() => {
      setIsJumping(false);
    }, 600);

    const oldLevel = Math.floor(petCount / 5) + 1;
    const newCount = petCount + 1;
    const newLevel = Math.floor(newCount / 5) + 1;
    
    setPetCount(newCount);
    localStorage.setItem(`dayly_mascot_pets_${user.id}`, newCount.toString());

    if (newLevel > oldLevel) {
      // Trigger level-up celebration!
      setIsCelebrating(true);
      setTimeout(() => {
        setIsCelebrating(false);
      }, 4000);
    }
  };

  // Synchronize language when user session changes
  useEffect(() => {
    if (user.language) {
      setLanguage(user.language as Language);
    }
  }, [user.language]);

  // Fetch activities on mount and updates
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/activities?_t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setActivities(result.data);
      } else {
        throw new Error(result.message || "Gagal mengambil daftar aktivitas.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [token]);

  // Handle Complete Toggle
  const handleToggleComplete = async (activity: Activity) => {
    try {
      const updatedStatus = !activity.isCompleted;
      const response = await fetch(`/api/activities/${activity.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isCompleted: updatedStatus }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        // Optimistically update or re-fetch
        setActivities((prev) =>
          prev.map((act) => (act.id === activity.id ? { ...act, isCompleted: updatedStatus } : act))
        );
        // Show celebration popup only when completing an activity (changing from incomplete to complete)
        if (updatedStatus) {
          setCompletedActivityPopup(activity);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error("Gagal mengubah status aktivitas:", err);
      // Re-fetch to synchronize state
      fetchActivities();
    }
  };

  // Handle Add / Edit Submit
  const handleFormSubmit = async (data: {
    title: string;
    description: string;
    category: ActivityCategory;
    priority: ActivityPriority;
    startTime: string;
    endTime: string;
  }) => {
    setIsModalOpen(false);
    const isEditing = !!selectedActivity;
    const endpoint = isEditing ? `/api/activities/${selectedActivity.id}` : "/api/activities";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        if (isEditing) {
          setActivities((prev) =>
            prev.map((act) => (act.id === selectedActivity.id ? result.data : act))
          );
        } else {
          setActivities((prev) => [...prev, result.data]);
        }
      } else {
        throw new Error(result.message || "Aksi gagal dilakukan.");
      }
    } catch (err: any) {
      console.error("Form submit error:", err);
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setSelectedActivity(undefined);
    }
  };

  // Handle Delete Activity
  const handleDeleteActivity = async (id: string) => {
    setDeletingId(null);
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setActivities((prev) => prev.filter((act) => act.id !== id));
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error("Gagal menghapus aktivitas:", err);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error("Logout request error", e);
    }
    onLogout();
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
  };

  // Filter activities locally
  const filteredActivities = activities.filter((act) => {
    // Search Title & Description
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter Status
    const matchesStatus =
      filterStatus === "Semua"
        ? true
        : filterStatus === "Selesai"
        ? act.isCompleted
        : !act.isCompleted;

    // Filter Category
    const matchesCategory = filterCategory === "Semua" ? true : act.category === filterCategory;

    // Filter Priority
    const matchesPriority = filterPriority === "Semua" ? true : act.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Pekerjaan":
        return "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60";
      case "Belajar":
        return "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60";
      case "Kesehatan":
        return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60";
      case "Rumah":
        return "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Tinggi":
        return "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50";
      case "Sedang":
        return "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/50";
      default:
        return "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-900/50";
    }
  };

  return (
    <div id="dashboard-wrapper" className="min-h-screen bg-[#F4FAF7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-12 transition-colors duration-300">
      
      {/* Upper Navigation Bar */}
      <header id="dashboard-header" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b-2 border-[#064E3B]/10 dark:border-emerald-500/20 sticky top-0 z-40 shadow-sm relative transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-2xl border-2 border-[#064E3B]/20 dark:border-transparent shadow-md shadow-emerald-500/15 flex items-center justify-center shrink-0">
              <ActivityIcon className="w-5 h-5 animate-pulse-slow" />
            </div>
            <div>
              <span className="font-black text-slate-800 dark:text-slate-100 text-xl tracking-tight font-display flex items-center gap-1.5 leading-none">
                DAYLY <span className="text-xs bg-[#E6F9F3] dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-lg font-black border border-[#064E3B]/10">ID</span>
              </span>
              <span className="text-[9px] sm:text-[10px] block font-black text-emerald-500 dark:text-emerald-400 mt-1 uppercase tracking-widest font-sans">
                {language === "id" ? "Produktivitas Sehat" : "Healthy Productivity"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="profile-pill-btn"
              onClick={() => {
                setProfileActiveTab("profile");
                setIsProfileModalOpen(true);
              }}
              className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border-2 border-[#064E3B]/10 dark:border-slate-800/40 pl-2 pr-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 shadow-sm hover:shadow active:scale-98"
              title={language === "id" ? "Buka Profil & Pengaturan" : "Open Profile & Settings"}
            >
              {user.avatar === "avatar-mascot" ? (
                <img src={mascotImg} alt="Mascot" className="w-5 h-5 rounded-full object-cover border-2 border-emerald-400 shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-base shrink-0 leading-none">
                  {user.avatar === "avatar-2" ? "🏃‍♂️" :
                   user.avatar === "avatar-3" ? "🧘‍♀️" :
                   user.avatar === "avatar-4" ? "🎨" :
                   user.avatar === "avatar-5" ? "🎓" :
                   user.avatar === "avatar-6" ? "🌱" : "🧑‍💻"}
                </span>
              )}
              <span className="truncate max-w-[100px] font-sans font-extrabold text-slate-750 dark:text-slate-300">
                {user.fullName || user.username}
              </span>
            </button>

            <button
              id="logout-btn"
              onClick={handleLogoutClick}
              className="flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-rose-600 bg-slate-50 dark:bg-slate-950 border-2 border-[#064E3B]/10 dark:border-slate-800/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-100 dark:hover:border-rose-900/50 px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full transition-all cursor-pointer shrink-0 active:scale-98"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
              <span className="hidden sm:inline font-bold">{t.logoutNav || (language === "id" ? "Keluar" : "Logout")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* WORKSPACE VIEW */}
        <div className="space-y-6">
            
            {/* Elegant Custom Greeting Banner */}
            <div id="greeting-banner-card" className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-950/10 border-2 border-[#064E3B]/10 dark:border-emerald-500/20 rounded-3xl p-6 md:p-8 journal-card-shadow transition-all duration-300">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#00CC88]/5 dark:bg-[#00CC88]/2 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/5 dark:bg-teal-500/2 rounded-full blur-2xl pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
                {/* Left Side: Greeting and Motivation (7 Cols) */}
                <div className="md:col-span-7 space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
                  <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="w-16 h-16 bg-[#E6F9F3] dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center p-1 border-2 border-[#064E3B] dark:border-emerald-400 shadow-inner shrink-0 relative">
                      <img src={mascotImg} alt="Mascot" className="w-full h-full rounded-xl object-cover animate-pulse-slow" referrerPolicy="no-referrer" />
                      <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                      </span>
                    </div>
                    <div className="space-y-1 text-center md:text-left">
                      <div className="inline-flex items-center gap-1.5 bg-[#E6F9F3] dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest font-sans">
                        <Sparkles className="w-3 h-3 text-[#D97706] animate-pulse" />
                        <span>Dayly Workspace</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 font-display leading-tight">
                        {language === "id" ? `Hai, ${user.fullName || user.username}! ✨` : `Hi, ${user.fullName || user.username}! ✨`}
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed text-center md:text-left">
                    {language === "id" 
                      ? "Mari jalani hari ini dengan penuh semangat dan tetap menjaga kesehatan tubuhmu. Tugas terkelola dengan baik membuat pikiran tenang!"
                      : "Let's make today productive and keep your body active. A well-organized day brings peace of mind!"}
                  </p>

                  {/* Speech balloon / Quick Status Message */}
                  <div className="w-full bg-[#F0FAF6] dark:bg-emerald-950/20 border-2 border-[#064E3B]/10 dark:border-emerald-900/40 px-4 py-3 rounded-2xl shadow-sm text-left">
                    <div className="flex items-start gap-2.5">
                      <span className="text-base mt-0.5 shrink-0">💬</span>
                      <p className="text-xs font-bold text-emerald-850 dark:text-emerald-300 leading-snug font-sans">
                        {language === "id" 
                          ? "Dayly siap menemanimu! Klik atau pet aku di sidebar kanan untuk mendapatkan semangat tambahan!"
                          : "Dayly is here to assist! Tap or pet me in the sidebar for custom wellness encouragement!"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Magnificent Productive Day Supporting Illustration (5 Cols) */}
                <div className="md:col-span-5 flex justify-center md:justify-end w-full">
                  <div className="relative group w-full max-w-[280px] md:max-w-none">
                    {/* Shadow overlay background */}
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
                    
                    {/* Main decorative image card */}
                    <div className="relative bg-white dark:bg-slate-900 p-2 rounded-[2rem] border-2 border-[#064E3B]/15 dark:border-emerald-500/30 shadow-md transform group-hover:scale-[1.02] transition-all duration-300">
                      <img 
                        src={productiveIllustration} 
                        alt="Productive Day Illustration" 
                        className="w-full h-44 md:h-48 object-cover rounded-[1.6rem]"
                        referrerPolicy="no-referrer"
                      />
                      {/* Interactive Float Badges */}
                      <span className="absolute bottom-4 right-4 bg-emerald-500 text-white font-black text-[10px] px-3 py-1.5 rounded-full border border-white dark:border-slate-900 uppercase tracking-wider font-mono shadow-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        {language === "id" ? "Produktif Sehat" : "Healthy & Productive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Widgets Row */}
            <StatsSection activities={activities} language={language} />

            {/* Mobile View Switcher (hanya tampil di HP / layar kecil) */}
            <div id="mobile-tab-navigation" className="flex lg:hidden bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-emerald-100/30 dark:border-slate-800/60 mb-5 shadow-sm">
              <button
                id="mobile-tab-btn-tasks"
                onClick={() => setActiveMobileTab("tasks")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeMobileTab === "tasks"
                    ? "bg-emerald-500 text-white shadow-md font-extrabold shadow-emerald-500/10"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <ActivityIcon className="w-4 h-4" />
                <span>{t.dashboardNav} ({filteredActivities.length})</span>
              </button>
              <button
                id="mobile-tab-btn-focus"
                onClick={() => setActiveMobileTab("focus")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeMobileTab === "focus"
                    ? "bg-emerald-500 text-white shadow-md font-extrabold shadow-emerald-500/10"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>{language === "id" ? "Fokus & AI" : "Focus & AI"}</span>
              </button>
            </div>

            {/* Dashboard Grid split into Left Tasks and Right Productivity Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT: ACTIVITY CRUD PANEL (8 Cols) */}
              <div className={`lg:col-span-8 space-y-4 ${activeMobileTab === "tasks" ? "block" : "hidden lg:block"}`}>
                
                {/* Control & Filter Block */}
                <div id="filter-block-card" className="bg-white dark:bg-slate-900 border-2 border-[#064E3B]/10 dark:border-slate-800/80 rounded-3xl p-6 journal-card-shadow space-y-4 transition-colors duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black text-slate-800 dark:text-slate-100 text-base font-display tracking-tight">{t.titleToday}</h3>
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 leading-snug">{t.descToday}</p>
                    </div>

                    <button
                      id="add-activity-btn"
                      onClick={() => {
                        setSelectedActivity(undefined);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-2xl border-2 border-[#064E3B] dark:border-transparent shadow-sm hover:shadow active:scale-98 transition-all cursor-pointer w-full sm:w-auto shrink-0"
                    >
                      <Plus className="w-4.5 h-4.5 stroke-[3.5]" />
                      <span>{t.addActivity}</span>
                    </button>
                  </div>

                  {/* Filters grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                    
                    {/* Search */}
                    <div className="sm:col-span-4 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4 text-emerald-600" />
                      </div>
                      <input
                        id="search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border-2 border-[#064E3B]/10 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400 font-bold"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="sm:col-span-3 flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border-2 border-[#064E3B]/10 dark:border-slate-850">
                      <button
                        id="status-filter-all"
                        onClick={() => setFilterStatus("Semua")}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                          filterStatus === "Semua" 
                            ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40" 
                            : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-300"
                        }`}
                      >
                        {t.filterAll}
                      </button>
                      <button
                        id="status-filter-pending"
                        onClick={() => setFilterStatus("Belum")}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                          filterStatus === "Belum" 
                            ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40" 
                            : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-300"
                        }`}
                      >
                        {t.filterPending}
                      </button>
                      <button
                        id="status-filter-completed"
                        onClick={() => setFilterStatus("Selesai")}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                          filterStatus === "Selesai" 
                            ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40" 
                            : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-300"
                        }`}
                      >
                        {t.filterCompleted}
                      </button>
                    </div>

                    {/* Category Filter */}
                    <div className="sm:col-span-3">
                      <select
                        id="category-filter-select"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border-2 border-[#064E3B]/10 dark:border-slate-850 rounded-2xl text-slate-700 dark:text-slate-300 text-xs focus:outline-none cursor-pointer font-bold"
                      >
                        <option value="Semua">📁 {t.filterCategory}</option>
                        <option value="Pekerjaan">📂 {language === "id" ? "Pekerjaan" : "Work"}</option>
                        <option value="Belajar">📂 {language === "id" ? "Belajar" : "Learn"}</option>
                        <option value="Kesehatan">📂 {language === "id" ? "Kesehatan" : "Health"}</option>
                        <option value="Rumah">📂 {language === "id" ? "Rumah" : "Home"}</option>
                        <option value="Lainnya">📂 {language === "id" ? "Lainnya" : "Others"}</option>
                      </select>
                    </div>

                    {/* Priority Filter */}
                    <div className="sm:col-span-2">
                      <select
                        id="priority-filter-select"
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border-2 border-[#064E3B]/10 dark:border-slate-850 rounded-2xl text-slate-700 dark:text-slate-300 text-xs focus:outline-none cursor-pointer font-bold"
                      >
                        <option value="Semua">⚡ {t.filterPriority}</option>
                        <option value="Tinggi">{t.priorityHigh}</option>
                        <option value="Sedang">{t.priorityMedium}</option>
                        <option value="Rendah">{t.priorityLow}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Activities List */}
                <div id="activities-list-container" className="space-y-3">
                  {loading ? (
                    <div className="bg-white dark:bg-slate-900 border-2 border-[#064E3B]/10 dark:border-slate-800/80 rounded-3xl p-10 text-center flex flex-col items-center journal-card-shadow">
                      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-bold">{t.loadingText}</p>
                    </div>
                  ) : error ? (
                    <div className="bg-rose-50 dark:bg-rose-950/10 border-2 border-rose-500/25 rounded-3xl p-6 text-center text-rose-700 dark:text-rose-400 text-xs journal-card-shadow">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                      <p className="font-black text-sm">{t.errorDbTitle}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-bold">{error}</p>
                    </div>
                  ) : filteredActivities.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border-2 border-[#064E3B]/10 dark:border-slate-800/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center transition-all duration-300 journal-card-shadow relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/2 rounded-full blur-2xl pointer-events-none" />
                      <div className="w-16 h-16 bg-[#E6F9F3] dark:bg-emerald-950/40 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 border-2 border-[#064E3B]/15 shadow-inner">
                        <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                      </div>
                      <h4 className="font-black text-slate-800 dark:text-slate-100 text-base font-display tracking-tight">{t.noActivityFound}</h4>
                      <p className="text-slate-450 dark:text-slate-500 text-xs font-bold max-w-md mt-2 leading-relaxed">
                        {t.noActivityDesc}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredActivities.map((act) => {
                        const isDeletingConfirm = deletingId === act.id;

                        return (
                          <div
                            key={act.id}
                            id={`activity-item-${act.id}`}
                            className={`bg-white dark:bg-slate-900 rounded-3xl border-2 transition-all p-5 journal-card-shadow relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 duration-300 ${
                              act.isCompleted
                                ? "border-slate-100 dark:border-slate-900/60 bg-emerald-50/5 dark:bg-slate-950/20 opacity-80"
                                : "border-[#064E3B]/10 dark:border-slate-800/60 hover:border-emerald-500/35 hover:scale-[1.005]"
                            }`}
                          >
                            {/* Task info block */}
                            <div className="flex items-start gap-4 flex-1">
                              
                              {/* Complete Checkbox */}
                              <button
                                id={`checkbox-${act.id}`}
                                onClick={() => handleToggleComplete(act)}
                                className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all shrink-0 mt-0.5 ${
                                  act.isCompleted
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                                    : "border-[#064E3B]/20 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50 dark:bg-slate-950 text-transparent"
                                }`}
                              >
                                <Check className="w-4 h-4 stroke-[3.5]" />
                              </button>

                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex flex-wrap gap-1.5 items-center">
                                  
                                  {/* Category Badge */}
                                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-lg border-2 ${getCategoryColor(act.category)}`}>
                                    {act.category === "Pekerjaan" ? (language === "id" ? "Pekerjaan" : "Work") : 
                                     act.category === "Belajar" ? (language === "id" ? "Belajar" : "Learn") : 
                                     act.category === "Kesehatan" ? (language === "id" ? "Kesehatan" : "Health") : 
                                     act.category === "Rumah" ? (language === "id" ? "Rumah" : "Home") : 
                                     (language === "id" ? "Lainnya" : "Others")}
                                  </span>

                                  {/* Priority Badge */}
                                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-lg border-2 ${getPriorityColor(act.priority)}`}>
                                    {act.priority === "Tinggi" ? t.priorityHigh : act.priority === "Sedang" ? t.priorityMedium : t.priorityLow}
                                  </span>

                                  {/* Time schedules if any */}
                                  {(act.startTime || act.endTime) && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-0.5 rounded-lg border-2 border-slate-200/40 dark:border-slate-800/40">
                                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>
                                        {act.startTime || "--:--"} {language === "id" ? "s/d" : "to"} {act.endTime || "--:--"}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <h4
                                  className={`font-black text-slate-800 dark:text-slate-100 text-sm leading-snug break-words font-display ${
                                    act.isCompleted ? "line-through text-slate-400 dark:text-slate-500 decoration-slate-400 dark:decoration-slate-500 decoration-2" : ""
                                  }`}
                                >
                                  {act.title}
                                </h4>

                                {act.description && (
                                  <p
                                    className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-words line-clamp-3 font-medium ${
                                      act.isCompleted ? "text-slate-400/80 dark:text-slate-500" : ""
                                    }`}
                                  >
                                    {act.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Control buttons or delete confirm */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              {isDeletingConfirm ? (
                                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 px-2.5 py-1 rounded-xl">
                                  <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400">
                                    {language === "id" ? "Hapus?" : "Delete?"}
                                  </span>
                                  <button
                                    id={`delete-confirm-yes-${act.id}`}
                                    onClick={() => handleDeleteActivity(act.id)}
                                    className="bg-rose-600 text-white font-bold text-[10px] px-2 py-1 rounded-md hover:bg-rose-700 transition-colors cursor-pointer"
                                  >
                                    {language === "id" ? "Ya" : "Yes"}
                                  </button>
                                  <button
                                    id={`delete-confirm-no-${act.id}`}
                                    onClick={() => setDeletingId(null)}
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] px-2 py-1 rounded-md hover:bg-slate-300 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                                  >
                                    {language === "id" ? "Tidak" : "No"}
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    id={`edit-btn-${act.id}`}
                                    onClick={() => {
                                      setSelectedActivity(act);
                                      setIsModalOpen(true);
                                    }}
                                    className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 rounded-xl border border-transparent hover:border-emerald-100/30 dark:hover:border-slate-800 transition-all cursor-pointer"
                                    title={t.modalTitleEdit}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    id={`delete-btn-${act.id}`}
                                    onClick={() => setDeletingId(act.id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all cursor-pointer"
                                    title={language === "id" ? "Hapus Aktivitas" : "Delete Activity"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: COMPANION PANEL (4 Cols) */}
              <div className={`lg:col-span-4 space-y-6 ${activeMobileTab === "focus" ? "block" : "hidden lg:block"}`}>
                  
                  {/* Interactive Mascot Companion Card */}
                  <div id="companion-mascot-card" className="bg-white dark:bg-slate-900 border-2 border-[#064E3B]/10 dark:border-emerald-500/20 rounded-3xl p-5 journal-card-shadow space-y-4 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00CC88]/5 dark:bg-[#00CC88]/2 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm font-display tracking-tight">
                          {language === "id" ? "Sahabat Dayly" : "Dayly Companion"}
                        </h3>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-extrabold tracking-wide uppercase font-sans">
                          {language === "id" ? "Selesaikan 5 tips untuk naik level!" : "Complete 5 tips to level up!"}
                        </p>
                      </div>
                      <div className="bg-[#FBBF24]/20 dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#FBBF24]/30 dark:border-amber-900/40 shadow-inner shrink-0 font-mono">
                        <span>✨ Level {Math.floor(petCount / 5) + 1}</span>
                      </div>
                    </div>

                    {/* Tips Categories selectors as requested */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">
                        {language === "id" ? "Pilih Kategori Tips:" : "Select Tip Category:"}
                      </p>
                      <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-thin scroll-smooth">
                        {[
                          { name: "Semua", labelId: "Semua", labelEn: "All", icon: Sparkles },
                          { name: "Pekerjaan", labelId: "Pekerjaan", labelEn: "Work", icon: Briefcase },
                          { name: "Belajar", labelId: "Belajar", labelEn: "Study", icon: BookOpen },
                          { name: "Kesehatan", labelId: "Kesehatan", labelEn: "Health", icon: Heart },
                          { name: "Rumah", labelId: "Rumah", labelEn: "Home", icon: Home },
                        ].map((cat) => {
                          const IconComponent = cat.icon;
                          const isActive = selectedCategory === cat.name;
                          return (
                            <button
                              key={cat.name}
                              type="button"
                              onClick={() => setSelectedCategory(cat.name as any)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all shrink-0 cursor-pointer border ${
                                isActive
                                  ? "bg-[#064E3B] dark:bg-emerald-500 text-white border-transparent shadow-sm"
                                  : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
                              }`}
                            >
                              <IconComponent className={`w-3 h-3 ${isActive ? "text-white" : "text-slate-450"}`} />
                              <span>{language === "id" ? cat.labelId : cat.labelEn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mascot interactive box */}
                    <div className="flex flex-col items-center justify-center py-2 relative border-t border-slate-100 dark:border-slate-800/60 pt-4">
                      {/* Active Category Display above mascot bubble as requested */}
                      {!isCelebrating && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-full border border-emerald-100/50 dark:border-emerald-900/60 shadow-inner mb-4 tracking-wider">
                          {activeTip.category === "Pekerjaan" && <Briefcase className="w-3 h-3 text-[#00CC88]" />}
                          {activeTip.category === "Belajar" && <BookOpen className="w-3 h-3 text-blue-500" />}
                          {activeTip.category === "Kesehatan" && <Heart className="w-3 h-3 text-rose-500" />}
                          {activeTip.category === "Rumah" && <Home className="w-3 h-3 text-amber-500" />}
                          <span className="font-sans uppercase">
                            TIPS {language === "id" ? activeTip.category : activeTip.categoryEn} • {currentStep + 1}/5
                          </span>
                        </div>
                      )}

                      {/* Speech bubble */}
                      <motion.div 
                        key={isCelebrating ? "celebration" : `${selectedCategory}-${currentStep}`}
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`border-2 px-3.5 py-2.5 rounded-2xl text-center relative mb-5 text-xs font-bold max-w-xs shadow-sm font-sans ${
                          isCelebrating
                            ? "bg-gradient-to-r from-amber-500 to-emerald-500 text-white border-amber-400 dark:border-emerald-400 animate-pulse"
                            : "bg-[#F0FAF6] dark:bg-emerald-950/30 border-[#064E3B]/10 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                        }`}
                      >
                        {isCelebrating ? (
                          language === "id" ? (
                            <span>HORE! LEVEL UP! 🎉<br />Kamu hebat sudah menyelesaikan 5 tips sehat! Sekarang kamu naik ke <strong>Level {Math.floor(petCount / 5) + 1}</strong>! 🥳💚</span>
                          ) : (
                            <span>HURRAY! LEVEL UP! 🎉<br />You're amazing for completing 5 healthy tips! You are now <strong>Level {Math.floor(petCount / 5) + 1}</strong>! 🥳💚</span>
                          )
                        ) : (
                          language === "id" ? activeTip.textId : activeTip.textEn
                        )}
                        {/* Speech bubble pointing triangle */}
                        <div className={`absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b border-2 ${
                          isCelebrating
                            ? "bg-emerald-500 border-emerald-400"
                            : "bg-[#F0FAF6] dark:bg-[#0e2721] border-[#064E3B]/10 dark:border-emerald-900/40"
                        }`} />
                      </motion.div>

                      {/* Mascot illustration with Framer Motion spring jump / continuous celebration jump */}
                      <motion.button
                        id="mascot-button-clicker"
                        type="button"
                        onClick={handlePetMascot}
                        animate={
                          isCelebrating 
                            ? { y: [0, -25, 0, -25, 0, -25, 0], scale: [1, 1.1, 1, 1.1, 1, 1.1, 1] }
                            : isJumping 
                              ? { y: [0, -16, 0] } 
                              : {}
                        }
                        transition={
                          isCelebrating
                            ? { duration: 3, ease: "easeInOut", repeat: 1 }
                            : { type: "spring", stiffness: 300, damping: 10 }
                        }
                        className="w-24 h-24 bg-white dark:bg-slate-950 rounded-[1.8rem] border-2 border-[#064E3B]/20 dark:border-emerald-900/50 shadow-inner flex items-center justify-center p-1 cursor-pointer overflow-visible relative group active:scale-95 transition-all duration-150"
                      >
                        <img src={mascotImg} alt="Dayly Mascot" className="w-full h-full rounded-2xl object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                        
                        {/* Heart burst or stars burst when petted */}
                        <AnimatePresence>
                          {isJumping && !isCelebrating && (
                            <motion.span 
                              initial={{ opacity: 1, scale: 0 }}
                              animate={{ opacity: 0, scale: 1.8, y: -20 }}
                              exit={{ opacity: 0 }}
                              className="absolute text-xl pointer-events-none"
                            >
                              💚
                            </motion.span>
                          )}
                        </AnimatePresence>

                        {/* Floating Level Up Confetti Particles */}
                        {isCelebrating && (
                          <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
                            {[
                              { emoji: "🎉", delay: 0, x: -45, y: -60 },
                              { emoji: "✨", delay: 0.3, x: 45, y: -80 },
                              { emoji: "🥳", delay: 0.6, x: -25, y: -110 },
                              { emoji: "💖", delay: 0.9, x: 35, y: -50 },
                              { emoji: "⭐", delay: 1.2, x: -55, y: -90 },
                              { emoji: "🚀", delay: 1.5, x: 25, y: -120 },
                            ].map((p, i) => (
                              <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                animate={{ 
                                  opacity: [0, 1, 1, 0], 
                                  scale: [0.5, 1.4, 1.1, 0.8], 
                                  x: p.x, 
                                  y: p.y 
                                }}
                                transition={{ 
                                  duration: 2.5, 
                                  delay: p.delay,
                                  ease: "easeOut",
                                  repeat: Infinity
                                }}
                                className="absolute text-xl"
                                style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
                              >
                                {p.emoji}
                              </motion.span>
                            ))}
                          </div>
                        )}
                      </motion.button>

                      {/* Interaction counts & Complete Action Button */}
                      <div className="w-full space-y-3 mt-4">
                        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">
                          <span>{language === "id" ? "Kemajuan Level" : "Level Progress"}</span>
                          <span>{currentStep}/5 {language === "id" ? "Tips Selesai" : "Tips Completed"}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border-2 border-[#064E3B]/5 dark:border-slate-800/40">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(currentStep / 5) * 100}%` }}
                          />
                        </div>

                        {/* Complete Tip Button */}
                        {!isCelebrating ? (
                          <button
                            id="complete-tip-button"
                            type="button"
                            onClick={handleCompleteTip}
                            className="mt-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-[11px] px-5 py-3 rounded-2xl border-2 border-[#064E3B]/10 dark:border-transparent shadow-sm hover:shadow active:scale-98 transition-all cursor-pointer w-full group uppercase tracking-wider font-sans"
                          >
                            <CheckCircle className="w-4 h-4 stroke-[3] group-hover:scale-110 transition-transform" />
                            <span>
                              {language === "id" ? "Saya Sudah Lakukan Tips Ini!" : "I've Done This Tip!"}
                            </span>
                          </button>
                        ) : (
                          <div className="text-center py-2 text-emerald-600 dark:text-emerald-400 font-black text-xs animate-bounce font-display tracking-tight uppercase">
                            {language === "id" ? "YAY! KAMU NAIK LEVEL! 🥳🌟" : "YAY! YOU LEVELED UP! 🥳🌟"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Focus / Pomodoro Timer Widget */}
                  <PomodoroTimer language={language} />

                  {/* AI Advisor Assistant */}
                  <AiAdvisor token={token} activitiesCount={activities.length} language={language} />
                </div>
              </div>
            </div>
          </main>

      {/* Floating Modal for Add / Edit Activities */}
      {isModalOpen && (
        <ActivityFormModal
          activity={selectedActivity}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedActivity(undefined);
          }}
          onSubmit={handleFormSubmit}
          language={language}
        />
      )}

      {/* Celebration Popup Modal when an Activity is Completed */}
      <AnimatePresence>
        {completedActivityPopup && (
          <div
            id="celebration-modal-overlay"
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setCompletedActivityPopup(null)}
          >
            <motion.div
              id="celebration-modal-content"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-slate-800/80 flex flex-col items-center p-6 text-center relative max-h-[90vh] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Confetti Accent */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-amber-400" />
              
              <div className="absolute top-4 right-4">
                <button
                  id="close-celebration-btn"
                  onClick={() => setCompletedActivityPopup(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Big Celebration Icon */}
              <div className="relative mt-4">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 animate-bounce">
                  <Trophy className="w-10 h-10 stroke-[2]" />
                </div>
                <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-sm">
                  <Sparkles className="w-4 h-4 fill-white" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg mt-5 tracking-tight font-sans">
                {t.celebrateCompletedTitle}
              </h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-mono">
                {t.celebrateCompletedSub}
              </p>

              {/* Completed Task Box */}
              <div className="w-full bg-slate-50 dark:bg-slate-950 border border-emerald-100/30 dark:border-slate-850 p-4 rounded-2xl mt-4 text-left space-y-2">
                <div className="flex gap-1.5 items-center">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${getCategoryColor(completedActivityPopup.category)}`}>
                    {completedActivityPopup.category === "Pekerjaan" ? (language === "id" ? "Pekerjaan" : "Work") : 
                     completedActivityPopup.category === "Belajar" ? (language === "id" ? "Belajar" : "Learn") : 
                     completedActivityPopup.category === "Kesehatan" ? (language === "id" ? "Kesehatan" : "Health") : 
                     completedActivityPopup.category === "Rumah" ? (language === "id" ? "Rumah" : "Home") : 
                     (language === "id" ? "Lainnya" : "Others")}
                  </span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${getPriorityColor(completedActivityPopup.priority)}`}>
                    {completedActivityPopup.priority === "Tinggi" ? t.priorityHigh : completedActivityPopup.priority === "Sedang" ? t.priorityMedium : t.priorityLow}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs line-clamp-2">
                  {completedActivityPopup.title}
                </h4>
                {completedActivityPopup.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                    "{completedActivityPopup.description}"
                  </p>
                )}
              </div>

              {/* Motivational Quote */}
              <p className="text-xs text-emerald-650 dark:text-emerald-400 font-semibold leading-relaxed mt-5 max-w-xs">
                {t.celebrateMotivational}
              </p>

              {/* Close/Action Button */}
              <button
                id="celebration-confirm-btn"
                onClick={() => setCompletedActivityPopup(null)}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all mt-6 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t.celebrateBtn}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Unified Profile & Settings Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div
            id="profile-settings-modal-overlay"
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all"
            onClick={() => setIsProfileModalOpen(false)}
          >
            <motion.div
              id="profile-settings-modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header with Switcher Tabs */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                  <button
                    id="profile-modal-tab-profile"
                    onClick={() => setProfileActiveTab("profile")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      profileActiveTab === "profile"
                        ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-extrabold"
                        : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{t.profile || (language === "id" ? "Profil" : "Profile")}</span>
                  </button>
                  <button
                    id="profile-modal-tab-settings"
                    onClick={() => setProfileActiveTab("settings")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      profileActiveTab === "settings"
                        ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-extrabold"
                        : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{t.settings || (language === "id" ? "Pengaturan" : "Settings")}</span>
                  </button>
                </div>

                <button
                  id="close-profile-modal-btn"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all cursor-pointer border border-transparent hover:border-slate-200/30"
                  title={language === "id" ? "Tutup" : "Close"}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Pane */}
              <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
                {profileActiveTab === "profile" ? (
                  <ProfileSection
                    token={token}
                    user={user}
                    activities={activities}
                    onUserUpdate={onUserUpdate}
                    language={language}
                  />
                ) : (
                  <SettingsSection
                    token={token}
                    user={user}
                    onUserUpdate={onUserUpdate}
                    language={language}
                    onLanguageChange={handleLanguageChange}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AiChatWidget token={token} language={language} />
    </div>
  );
}
