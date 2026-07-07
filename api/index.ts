import express from "express";
import { GoogleGenAI } from "@google/genai";
import connectToDatabase from "../src/db/connection";
import { User, Activity } from "../src/db/models";

const app = express();
app.use(express.json());

// Simple token storage (in-memory simulation for session validity)
// Note: In a real serverless app, tokens should be verified via JWT or Database,
// as in-memory state is lost between serverless function invocations.
// For demonstration, we keep this simple.
const activeSessions = new Map<string, { userId: string; username: string }>();

// Simple authentication middleware
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Akses ditolak. Token tidak disediakan." });
  }
  const token = authHeader.split(" ")[1];
  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ success: false, message: "Sesi kedaluwarsa atau tidak valid." });
  }
  (req as any).user = session;
  next();
};

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// --- API ROUTES ---

// Middleware to ensure DB connection on every request (for Serverless)
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    // If we fail to connect (e.g. no MONGODB_URI), we proceed anyway to let routes 
    // handle fallback or show error.
    next();
  }
});

// Auth: Register
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan password wajib diisi." });
  }

  try {
    const cleanUsername = username.trim().toLowerCase();
    const userExists = await User.findOne({ username: cleanUsername });

    if (userExists) {
      return res.status(400).json({ success: false, message: "Username sudah terdaftar." });
    }

    const newUser = new User({
      id: "user-" + Math.random().toString(36).substr(2, 9),
      username: cleanUsername,
      passwordHash: password, // Simple plain text for this demo
      fullName: "",
      email: "",
      bio: "",
      avatar: "avatar-1",
      joinDate: new Date().toISOString(),
      theme: "dark",
      language: "id",
      focusTarget: 4,
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "Registrasi berhasil! Silakan masuk." });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat mendaftar." });
  }
});

// Auth: Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan password wajib diisi." });
  }

  try {
    const cleanUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: cleanUsername, passwordHash: password });

    if (!user) {
      return res.status(401).json({ success: false, message: "Username atau password salah." });
    }

    // Generate simple token
    const token = "tok-" + Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
    activeSessions.set(token, { userId: user.id, username: user.username });

    res.json({
      success: true,
      message: "Berhasil masuk!",
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || "avatar-1",
        joinDate: user.joinDate,
        theme: user.theme || "dark",
        language: user.language || "id",
        focusTarget: user.focusTarget || 4,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat masuk." });
  }
});

// Auth: Logout
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: "Berhasil keluar sesi." });
});

// Auth: Check Session
app.get("/api/auth/session", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false });
  }
  const token = authHeader.split(" ")[1];
  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ success: false });
  }
  
  try {
    const user = await User.findOne({ id: session.userId });
    if (!user) {
      return res.status(401).json({ success: false });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || "avatar-1",
        joinDate: user.joinDate,
        theme: user.theme || "dark",
        language: user.language || "id",
        focusTarget: user.focusTarget || 4,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Auth: Update Profile & Settings
app.put("/api/auth/profile", authMiddleware, async (req: any, res) => {
  const userId = req.user.userId;
  const { fullName, email, bio, avatar, theme, language, focusTarget } = req.body;

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (theme !== undefined) user.theme = theme;
    if (language !== undefined) user.language = language;
    if (focusTarget !== undefined) user.focusTarget = Number(focusTarget);

    await user.save();

    res.json({
      success: true,
      message: "Profil berhasil diperbarui.",
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        joinDate: user.joinDate,
        theme: user.theme,
        language: user.language,
        focusTarget: user.focusTarget,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui profil." });
  }
});

// CRUD: Get Activities
app.get("/api/activities", authMiddleware, async (req: any, res) => {
  const userId = req.user.userId;
  try {
    const activities = await Activity.find({ userId }).sort({ createdAt: 1 });
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil aktivitas." });
  }
});

// CRUD: Create Activity
app.post("/api/activities", authMiddleware, async (req: any, res) => {
  const userId = req.user.userId;
  const { title, description, category, priority, startTime, endTime } = req.body;

  if (!title || !category || !priority) {
    return res.status(400).json({ success: false, message: "Judul, kategori, dan prioritas wajib diisi." });
  }

  try {
    const newActivity = new Activity({
      id: "act-" + Math.random().toString(36).substr(2, 9),
      userId,
      title,
      description: description || "",
      category,
      priority,
      startTime: startTime || "",
      endTime: endTime || "",
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });

    await newActivity.save();
    res.status(201).json({ success: true, data: newActivity });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal membuat aktivitas." });
  }
});

// CRUD: Update Activity
app.put("/api/activities/:id", authMiddleware, async (req: any, res) => {
  const userId = req.user.userId;
  const activityId = req.params.id;
  const { title, description, category, priority, startTime, endTime, isCompleted } = req.body;

  try {
    const activity = await Activity.findOne({ id: activityId, userId });

    if (!activity) {
      return res.status(404).json({ success: false, message: "Aktivitas tidak ditemukan." });
    }

    if (title !== undefined) activity.title = title;
    if (description !== undefined) activity.description = description;
    if (category !== undefined) activity.category = category;
    if (priority !== undefined) activity.priority = priority;
    if (startTime !== undefined) activity.startTime = startTime;
    if (endTime !== undefined) activity.endTime = endTime;
    if (isCompleted !== undefined) activity.isCompleted = isCompleted;

    await activity.save();
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui aktivitas." });
  }
});

// CRUD: Delete Activity
app.delete("/api/activities/:id", authMiddleware, async (req: any, res) => {
  const userId = req.user.userId;
  const activityId = req.params.id;

  try {
    const result = await Activity.deleteOne({ id: activityId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Aktivitas tidak ditemukan." });
    }

    res.json({ success: true, message: "Aktivitas berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menghapus aktivitas." });
  }
});

// AI Recommendation Engine using Gemini
app.post("/api/ai/recommend", authMiddleware, async (req: any, res) => {
  const userId = req.user.userId;
  
  try {
    const userActivities = await Activity.find({ userId });
    const client = getAIClient();
    if (!client) {
      return res.status(200).json({
        success: false,
        message: "Gemini API belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di pengaturan rahasia Anda.",
        advice: "Saran Sederhana: Cobalah selesaikan aktivitas prioritas 'Tinggi' Anda terlebih dahulu di pagi hari ketika fokus Anda masih prima. Berikan jeda istirahat 5-10 menit di antara aktivitas menggunakan metode Pomodoro.",
      });
    }

    const activitiesContext = userActivities.map((act, index) => {
      return `${index + 1}. [${act.category}] ${act.title} - Prioritas: ${act.priority}, Waktu: ${act.startTime || "Fleksibel"} - ${act.endTime || "Fleksibel"}, Status: ${act.isCompleted ? "Selesai" : "Belum Selesai"}. Deskripsi: ${act.description}`;
    }).join("\n");

    const prompt = `Anda adalah seorang asisten pengelola waktu dan produktivitas pribadi yang sangat ramah, santun, dan berpengalaman.
Analisis daftar aktivitas pengguna berikut untuk hari ini:

Daftar Aktivitas Pengguna:
${activitiesContext || "(Tidak ada aktivitas terdaftar saat ini)"}

Tugas Anda adalah:
1. Berikan evaluasi singkat mengenai tingkat beban kerja pengguna hari ini (apakah realistis, terlalu padat, atau terlalu santai).
2. Tuliskan 3 tips taktis atau saran manajemen waktu yang dipersonalisasi berdasarkan kategori dan prioritas aktivitas mereka.
3. Rekomendasikan 1 aktivitas produktif atau kesehatan baru yang dapat meningkatkan rutinitas mereka saat ini.
4. Jawab dalam format bahasa Indonesia yang memotivasi, ramah, profesional, dan menggunakan penulisan Markdown terstruktur yang rapi. Jangan terlalu panjang, berikan ringkasan yang nyaman dibaca sekilas.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const adviceText = response.text || "Tidak dapat menghasilkan saran saat ini.";

    res.json({
      success: true,
      advice: adviceText,
    });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal saat memanggil asisten AI.",
      advice: "Saran Darurat: Tetap fokus pada tugas prioritas Tinggi Anda. Gunakan teknik time-boxing untuk membatasi durasi pengerjaan aktivitas agar tidak mengalami kelelahan.",
    });
  }
});

// AI Chat Assistant
app.post("/api/ai/chat", authMiddleware, async (req: any, res) => {
  const userId = req.user.userId;
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: "Pesan wajib berupa array." });
  }

  try {
    const userActivities = await Activity.find({ userId });
    const user = await User.findOne({ id: userId });

    const client = getAIClient();
    if (!client) {
      return res.json({
        success: true,
        reply: "Halo! Saya adalah asisten AI pribadi Anda. Saat ini GEMINI_API_KEY belum dikonfigurasi, jadi saya berjalan dalam mode asisten offline lokal.\n\nSaran singkat untuk hari Anda:\n- Selesaikan tugas berkategori **Kesehatan** atau **Pekerjaan** prioritas Tinggi Anda terlebih dahulu di pagi hari!\n- Jangan lupa beristirahat sejenak di antara sela-sela aktivitas harian Anda.\n\nBagaimana saya bisa membantu Anda mengatur rencana aktivitas hari ini?",
      });
    }

    const activitiesContext = userActivities.map((act, index) => {
      return `${index + 1}. [${act.category}] ${act.title} - Prioritas: ${act.priority}, Waktu: ${act.startTime || "Fleksibel"} - ${act.endTime || "Fleksibel"}, Status: ${act.isCompleted ? "Selesai" : "Belum Selesai"}. Deskripsi: ${act.description}`;
    }).join("\n");

    const systemInstruction = `Anda adalah seorang asisten AI pribadi yang sangat ramah, santun, suportif, dan cerdas untuk Dayly - aplikasi manajemen waktu dan aktivitas produktif.
Nama pengguna yang sedang Anda ajak bicara adalah: ${user?.fullName || user?.username || "Pengguna"}.
Bio pengguna saat ini: ${user?.bio || "(Belum diisi)"}.

Berikut adalah daftar aktivitas harian terkini pengguna di database:
${activitiesContext || "(Tidak ada aktivitas terdaftar saat ini)"}

Tugas Anda:
1. Jawab pertanyaan pengguna mengenai cara mengelola aktivitas harian, tips kebugaran, cara memprioritaskan pekerjaan, atau cara menyelesaikan tugas mereka hari ini.
2. Bantu pengguna merencanakan hari mereka secara terstruktur dan berikan motivasi positif.
3. Jawab dalam format bahasa Indonesia yang memotivasi, hangat, ramah, dan profesional.
4. Gunakan tulisan Markdown yang rapi (bold, bullet points) dan pastikan responnya ringkas serta mudah dibaca sekilas dalam panel widget chat yang relatif kecil.`;

    const contents = messages.map((m: any) => {
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      };
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const replyText = response.text || "Maaf, asisten AI sedang beristirahat sejenak. Silakan kirim pesan kembali.";

    res.json({
      success: true,
      reply: replyText,
    });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal saat menghubungi asisten AI.",
      reply: "Maaf, terjadi kendala teknis saat memproses pesan Anda. Silakan coba kembali sesaat lagi.",
    });
  }
});

export default app;
