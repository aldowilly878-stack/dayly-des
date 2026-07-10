import express from "express";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// In-memory session validasi
const activeSessions = new Map<string, { userId: string; username: string }>();

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

// --- API ROUTES (SUPABASE) ---

// Auth: Register
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan password wajib diisi." });
  }

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ success: false, message: "Error: SUPABASE_URL atau SUPABASE_ANON_KEY belum diatur di Vercel." });
  }

  try {
    const cleanUsername = username.trim().toLowerCase();
    
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', cleanUsername)
      .single();

    if (existingUser) {
      return res.status(400).json({ success: false, message: "Username sudah terdaftar." });
    }

    const userId = "user-" + Math.random().toString(36).substr(2, 9);
    
    const newUser = {
      id: userId,
      username: cleanUsername,
      passwordHash: password, // For demo purposes only
      fullName: "",
      email: "",
      bio: "",
      avatar: "avatar-1",
      joinDate: new Date().toISOString(),
      theme: "dark",
      language: "id",
      focusTarget: 4,
    };

    const { error: insertError } = await supabase
      .from('users')
      .insert([newUser]);

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return res.status(500).json({ success: false, message: `Error Database: ${insertError.message}` });
    }

    res.status(201).json({ success: true, message: "Registrasi berhasil! Silakan masuk." });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: `Terjadi kesalahan server: ${error.message}` });
  }
});

// Auth: Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan password wajib diisi." });
  }

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ success: false, message: "Error: SUPABASE_URL atau SUPABASE_ANON_KEY belum diatur di Vercel." });
  }

  try {
    const cleanUsername = username.trim().toLowerCase();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', cleanUsername)
      .eq('passwordHash', password)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: "Username atau password salah." });
    }

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
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: `Terjadi kesalahan server saat masuk: ${error.message}` });
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
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .single();

    if (error || !user) {
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

// Auth: Update Profile
app.put("/api/auth/profile", authMiddleware, async (req: any, res) => {
  const { userId } = req.user;
  const { fullName, email, bio, avatar, theme, language, focusTarget } = req.body;

  try {
    const updates: any = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (email !== undefined) updates.email = email;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (theme !== undefined) updates.theme = theme;
    if (language !== undefined) updates.language = language;
    if (focusTarget !== undefined) updates.focusTarget = Number(focusTarget);
    if (req.body.petCount !== undefined) updates.petCount = Number(req.body.petCount);

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: "Gagal memperbarui profil: " + (error?.message || "User tidak ditemukan.") });
    }

    res.json({
      success: true,
      message: "Profil berhasil diperbarui.",
      user: {
        ...user,
        focusTarget: user.focusTarget || 4,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: `Gagal memperbarui profil: ${error.message}` });
  }
});

// CRUD: Get Activities
app.get("/api/activities", authMiddleware, async (req: any, res) => {
  const { userId } = req.user;
  if (!userId) return res.status(401).json({ success: false, message: "Akses ditolak. Sesi tidak valid." });
  try {
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: `Gagal mengambil aktivitas: ${error.message}` });
    }

    res.json({ success: true, data: activities || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: `Gagal mengambil aktivitas: ${error.message}` });
  }
});

// CRUD: Create Activity
app.post("/api/activities", authMiddleware, async (req: any, res) => {
  const { userId } = req.user;
  const { title, description, category, priority, startTime, endTime } = req.body;

  if (!title || !category || !priority) {
    return res.status(400).json({ success: false, message: "Judul, kategori, dan prioritas wajib diisi." });
  }

  try {
    const newActivity = {
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
    };

    const { error } = await supabase
      .from('activities')
      .insert([newActivity]);

    if (error) {
      return res.status(500).json({ success: false, message: `Gagal membuat aktivitas: ${error.message}` });
    }

    res.status(201).json({ success: true, data: newActivity });
  } catch (error: any) {
    res.status(500).json({ success: false, message: `Gagal membuat aktivitas: ${error.message}` });
  }
});

// CRUD: Update Activity
app.put("/api/activities/:id", authMiddleware, async (req: any, res) => {
  const { userId } = req.user;
  const activityId = req.params.id;
  const { title, description, category, priority, startTime, endTime, isCompleted } = req.body;

  try {
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (priority !== undefined) updates.priority = priority;
    if (startTime !== undefined) updates.startTime = startTime;
    if (endTime !== undefined) updates.endTime = endTime;
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;

    const { data: activity, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', activityId)
      .eq('userId', userId)
      .select()
      .single();

    if (error || !activity) {
      return res.status(404).json({ success: false, message: "Gagal memperbarui aktivitas: " + (error?.message || "Tidak ditemukan.") });
    }

    res.json({ success: true, data: activity });
  } catch (error: any) {
    res.status(500).json({ success: false, message: `Gagal memperbarui aktivitas: ${error.message}` });
  }
});

// CRUD: Delete Activity
app.delete("/api/activities/:id", authMiddleware, async (req: any, res) => {
  const { userId } = req.user;
  const activityId = req.params.id;

  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)
      .eq('userId', userId);

    if (error) {
      return res.status(500).json({ success: false, message: `Gagal menghapus aktivitas: ${error.message}` });
    }

    res.json({ success: true, message: "Aktivitas berhasil dihapus." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: `Gagal menghapus aktivitas: ${error.message}` });
  }
});

// AI Recommendation
app.post("/api/ai/recommend", authMiddleware, async (req: any, res) => {
  const { userId } = req.user;
  
  try {
    const { data: userActivities } = await supabase
      .from('activities')
      .select('*')
      .eq('userId', userId);

    const client = getAIClient();
    if (!client) {
      return res.status(200).json({
        success: false,
        message: "Gemini API belum dikonfigurasi.",
        advice: "Saran: Selalu kerjakan prioritas Tinggi Anda lebih awal. Lakukan dengan fokus!",
      });
    }

    const activitiesContext = (userActivities || []).map((act: any, index: number) => {
      return `${index + 1}. [${act.category}] ${act.title} - Prioritas: ${act.priority}, Status: ${act.isCompleted ? "Selesai" : "Belum"}`;
    }).join("\n");

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Berikan 1 paragraf saran untuk aktivitas ini:\n${activitiesContext}`,
    });

    res.json({ success: true, advice: response.text || "Tidak ada saran." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error Gemini API." });
  }
});

// AI Chat
app.post("/api/ai/chat", authMiddleware, async (req: any, res) => {
  const { userId, username } = req.user;
  const { messages } = req.body;
  
  try {
    const { data: user } = await supabase
      .from('users')
      .select('fullName, username')
      .eq('id', userId)
      .single();
    
    const client = getAIClient();
    if (!client) {
      return res.json({ success: true, reply: "AI Offline: Saya belum terhubung ke Gemini API." });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: messages.map((m: any) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.text }] })),
      config: { systemInstruction: `Anda asisten untuk ${user?.fullName || username}.` },
    });

    res.json({ success: true, reply: response.text || "Pesan gagal diproses." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error Gemini AI Chat." });
  }
});

// Fallback for unhandled API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found in Express: ${req.url}` });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: `Express Error: ${err.message}` });
});

export default app;
