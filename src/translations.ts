export type Language = "id" | "en";

export interface TranslationDictionary {
  brandTitle: string;
  brandSubtitle: string;
  helloUser: string;
  logout: string;
  login: string;
  register: string;
  activeTasks: string;
  profile: string;
  settings: string;
  
  // Dashboard
  titleToday: string;
  descToday: string;
  addActivity: string;
  searchPlaceholder: string;
  filterAll: string;
  filterPending: string;
  filterCompleted: string;
  categoryLabel: string;
  priorityLabel: string;
  noActivityFound: string;
  noActivityDesc: string;
  deleteConfirm: string;
  deleteYes: string;
  deleteNo: string;
  editBtnTooltip: string;
  deleteBtnTooltip: string;
  
  // Stats
  statTotal: string;
  statCompleted: string;
  statPending: string;
  statProgress: string;
  quoteCompleted: string;
  quoteGreat: string;
  quoteKeepGoing: string;
  quoteNoTasks: string;
  quoteLetStart: string;
  
  // Pomodoro
  pomodoroTitle: string;
  pomodoroSession: string;
  pomodoroFocusBtn: string;
  pomodoroShortBreakBtn: string;
  pomodoroLongBreakBtn: string;
  pomodoroFocusText: string;
  pomodoroBreakText: string;
  pomodoroPauseBtn: string;
  pomodoroStartBtn: string;
  pomodoroResetBtn: string;
  
  // AI Advisor
  aiTitle: string;
  aiSubtitle: string;
  aiRefreshTooltip: string;
  aiLoading: string;
  aiErrorTitle: string;
  aiFooterText: string;
  
  // Activity Form Modal
  modalTitleAdd: string;
  modalTitleEdit: string;
  formTitleLabel: string;
  formTitlePlaceholder: string;
  formDescLabel: string;
  formDescPlaceholder: string;
  formCategoryAll: string;
  formStartTimeLabel: string;
  formEndTimeLabel: string;
  formCancelBtn: string;
  formSubmitAdd: string;
  formSubmitEdit: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  
  // Celebration Popup
  celebTitle: string;
  celebSubtitle: string;
  celebQuote: string;
  celebBtn: string;
  
  // Profile
  profileTitle: string;
  profileSubtitle: string;
  profileUsername: string;
  profileFullName: string;
  profileEmail: string;
  profileBio: string;
  profileJoinDate: string;
  profileAvatar: string;
  profileEditBtn: string;
  profileSaveBtn: string;
  profileCancelBtn: string;
  profileSuccess: string;
  profileStatCompleted: string;
  profileStatCategories: string;
  profileFocusTarget: string;
  profileHours: string;
  profileTitleStats: string;
  profileEditMode: string;
  profilePlaceholderEmail: string;
  profilePlaceholderFullName: string;
  profilePlaceholderBio: string;
  
  // Settings
  settingsTitle: string;
  settingsSubtitle: string;
  settingsLanguage: string;
  settingsTheme: string;
  settingsThemeLight: string;
  settingsThemeDark: string;
  settingsThemeSystem: string;
  settingsSaveBtn: string;
  settingsSuccess: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  id: {
    brandTitle: "DAYLY",
    brandSubtitle: "Produktivitas Sehat",
    helloUser: "Halo, {username}",
    logout: "Keluar",
    login: "Masuk Aplikasi",
    register: "Daftar Akun",
    activeTasks: "Aktivitas",
    profile: "Profil",
    settings: "Pengaturan",
    
    // Dashboard
    titleToday: "Daftar Aktivitas Hari Ini",
    descToday: "Buat, kelola, dan selesaikan rencana harian Anda",
    addActivity: "Tambah Aktivitas",
    searchPlaceholder: "Cari judul / catatan...",
    filterAll: "Semua",
    filterPending: "Belum",
    filterCompleted: "Selesai",
    categoryLabel: "Kategori",
    priorityLabel: "Prioritas",
    noActivityFound: "Tidak Ada Aktivitas Ditemukan",
    noActivityDesc: "Silakan ubah filter pencarian Anda atau buat aktivitas baru dengan menekan tombol \"Tambah Aktivitas\" di atas.",
    deleteConfirm: "Hapus?",
    deleteYes: "Ya",
    deleteNo: "Tidak",
    editBtnTooltip: "Ubah Aktivitas",
    deleteBtnTooltip: "Hapus Aktivitas",
    
    // Stats
    statTotal: "Total",
    statCompleted: "Selesai",
    statPending: "Sisa",
    statProgress: "Progres",
    quoteCompleted: "Luar biasa! Selesai!",
    quoteGreat: "Progres sangat bagus!",
    quoteKeepGoing: "Terus melangkah!",
    quoteNoTasks: "Belum ada tugas.",
    quoteLetStart: "Ayo mulai dicicil!",
    
    // Pomodoro
    pomodoroTitle: "Fokus Pomodoro",
    pomodoroSession: "Sesi",
    pomodoroFocusBtn: "Fokus",
    pomodoroShortBreakBtn: "Istirahat Singkat",
    pomodoroLongBreakBtn: "Istirahat Panjang",
    pomodoroFocusText: "Waktu Fokus",
    pomodoroBreakText: "Waktu Istirahat",
    pomodoroPauseBtn: "Jeda",
    pomodoroStartBtn: "Mulai",
    pomodoroResetBtn: "Reset Timer",
    
    // AI Advisor
    aiTitle: "Asisten AI Produktivitas",
    aiSubtitle: "Rekomendasi taktis berbasis daftar aktivitasmu",
    aiRefreshTooltip: "Segarkan Saran",
    aiLoading: "Menyinkronkan saran dari asisten AI...",
    aiErrorTitle: "Gagal menghubungkan asisten AI",
    aiFooterText: "Gemini 2.5 Flash • Menyesuaikan waktu & prioritas",
    
    // Activity Form Modal
    modalTitleAdd: "Tambah Aktivitas Baru",
    modalTitleEdit: "Ubah Aktivitas",
    formTitleLabel: "Judul Aktivitas",
    formTitlePlaceholder: "Contoh: Belajar Pemrograman React",
    formDescLabel: "Deskripsi / Detail",
    formDescPlaceholder: "Tuliskan catatan atau daftar tugas kecil untuk aktivitas ini...",
    formCategoryAll: "📁 Kategori: Semua",
    formStartTimeLabel: "Waktu Mulai",
    formEndTimeLabel: "Waktu Selesai",
    formCancelBtn: "Batal",
    formSubmitAdd: "Tambah Aktivitas",
    formSubmitEdit: "Simpan Perubahan",
    priorityHigh: "Tinggi",
    priorityMedium: "Sedang",
    priorityLow: "Rendah",
    
    // Celebration Popup
    celebTitle: "Aktivitas Selesai!",
    celebSubtitle: "Luar Biasa, Kerja Bagus!",
    celebQuote: "\"Setiap langkah kecil yang kamu selesaikan hari ini akan membawamu lebih dekat ke impian besarmu besok!\"",
    celebBtn: "Mantap, Lanjutkan!",
    
    // Profile
    profileTitle: "Profil Pengguna",
    profileSubtitle: "Atur informasi pribadi dan lihat statistik produktivitas Anda",
    profileUsername: "Nama Pengguna",
    profileFullName: "Nama Lengkap",
    profileEmail: "Alamat Email",
    profileBio: "Tentang Saya (Bio)",
    profileJoinDate: "Member Sejak",
    profileAvatar: "Avatar Profil",
    profileEditBtn: "Ubah Profil",
    profileSaveBtn: "Simpan Profil",
    profileCancelBtn: "Batal",
    profileSuccess: "Profil berhasil diperbarui!",
    profileStatCompleted: "Aktivitas Selesai",
    profileStatCategories: "Kategori Terpopuler",
    profileFocusTarget: "Target Fokus Harian",
    profileHours: "jam",
    profileTitleStats: "Statistik & Capaian",
    profileEditMode: "Mode Edit",
    profilePlaceholderEmail: "contoh@email.com",
    profilePlaceholderFullName: "Masukkan nama lengkap Anda",
    profilePlaceholderBio: "Ceritakan sedikit tentang dirimu...",
    
    // Settings
    settingsTitle: "Pengaturan Aplikasi",
    settingsSubtitle: "Sesuaikan bahasa, tampilan, dan preferensi aplikasi Anda",
    settingsLanguage: "Pilih Bahasa",
    settingsTheme: "Mode Tampilan",
    settingsThemeLight: "Tampilan Cerah",
    settingsThemeDark: "Tampilan Gelap",
    settingsThemeSystem: "Ikuti Sistem",
    settingsSaveBtn: "Simpan Pengaturan",
    settingsSuccess: "Pengaturan berhasil disimpan!",
  },
  en: {
    brandTitle: "DAYLY",
    brandSubtitle: "Healthy Productivity",
    helloUser: "Hello, {username}",
    logout: "Log Out",
    login: "Log In",
    register: "Register",
    activeTasks: "Activities",
    profile: "Profile",
    settings: "Settings",
    
    // Dashboard
    titleToday: "Today's Activities",
    descToday: "Create, manage, and complete your daily plans",
    addActivity: "Add Activity",
    searchPlaceholder: "Search title / details...",
    filterAll: "All",
    filterPending: "Pending",
    filterCompleted: "Completed",
    categoryLabel: "Category",
    priorityLabel: "Priority",
    noActivityFound: "No Activities Found",
    noActivityDesc: "Please modify your search filters or create a new activity by clicking the \"Add Activity\" button above.",
    deleteConfirm: "Delete?",
    deleteYes: "Yes",
    deleteNo: "No",
    editBtnTooltip: "Edit Activity",
    deleteBtnTooltip: "Delete Activity",
    
    // Stats
    statTotal: "Total",
    statCompleted: "Completed",
    statPending: "Pending",
    statProgress: "Progress",
    quoteCompleted: "Amazing! Completed!",
    quoteGreat: "Great progress!",
    quoteKeepGoing: "Keep moving forward!",
    quoteNoTasks: "No tasks yet.",
    quoteLetStart: "Let's start chipping away!",
    
    // Pomodoro
    pomodoroTitle: "Pomodoro Focus",
    pomodoroSession: "Session",
    pomodoroFocusBtn: "Focus",
    pomodoroShortBreakBtn: "Short Break",
    pomodoroLongBreakBtn: "Long Break",
    pomodoroFocusText: "Focus Time",
    pomodoroBreakText: "Break Time",
    pomodoroPauseBtn: "Pause",
    pomodoroStartBtn: "Start",
    pomodoroResetBtn: "Reset Timer",
    
    // AI Advisor
    aiTitle: "AI Productivity Assistant",
    aiSubtitle: "Tactical recommendations based on your activity list",
    aiRefreshTooltip: "Refresh Advice",
    aiLoading: "Syncing suggestions from AI assistant...",
    aiErrorTitle: "Failed to connect AI assistant",
    aiFooterText: "Gemini 2.5 Flash • Customizing time & priority",
    
    // Activity Form Modal
    modalTitleAdd: "Add New Activity",
    modalTitleEdit: "Edit Activity",
    formTitleLabel: "Activity Title",
    formTitlePlaceholder: "E.g., Learn React Programming",
    formDescLabel: "Description / Details",
    formDescPlaceholder: "Write notes or small subtasks for this activity...",
    formCategoryAll: "📁 Category: All",
    formStartTimeLabel: "Start Time",
    formEndTimeLabel: "End Time",
    formCancelBtn: "Cancel",
    formSubmitAdd: "Add Activity",
    formSubmitEdit: "Save Changes",
    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityLow: "Low",
    
    // Celebration Popup
    celebTitle: "Activity Completed!",
    celebSubtitle: "Amazing, Great Job!",
    celebQuote: "\"Every small step you complete today brings you closer to your big dreams tomorrow!\"",
    celebBtn: "Awesome, Continue!",
    
    // Profile
    profileTitle: "User Profile",
    profileSubtitle: "Manage your personal information and track your productivity stats",
    profileUsername: "Username",
    profileFullName: "Full Name",
    profileEmail: "Email Address",
    profileBio: "About Me (Bio)",
    profileJoinDate: "Member Since",
    profileAvatar: "Profile Avatar",
    profileEditBtn: "Edit Profile",
    profileSaveBtn: "Save Profile",
    profileCancelBtn: "Cancel",
    profileSuccess: "Profile updated successfully!",
    profileStatCompleted: "Activities Completed",
    profileStatCategories: "Top Category",
    profileFocusTarget: "Daily Focus Target",
    profileHours: "hours",
    profileTitleStats: "Statistics & Achievements",
    profileEditMode: "Edit Mode",
    profilePlaceholderEmail: "example@email.com",
    profilePlaceholderFullName: "Enter your full name",
    profilePlaceholderBio: "Tell us a bit about yourself...",
    
    // Settings
    settingsTitle: "App Settings",
    settingsSubtitle: "Customize language, appearance, and your app preferences",
    settingsLanguage: "Select Language",
    settingsTheme: "Appearance Theme",
    settingsThemeLight: "Light Mode",
    settingsThemeDark: "Dark Mode",
    settingsThemeSystem: "System Default",
    settingsSaveBtn: "Save Settings",
    settingsSuccess: "Settings saved successfully!",
  }
};
