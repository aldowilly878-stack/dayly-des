import express from "express";
import { GoogleGenAI } from "@google/genai";
import { kv } from "@vercel/kv";

const app = express();
app.use(express.json());

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

// --- API ROUTES (VERCEL KV) ---

// Auth: Register
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan password wajib diisi." });
  }

  try {
    const cleanUsername = username.trim().toLowerCase();
    
    // Check if user exists in KV
    const existingUser = await kv.hgetall(`user:${cleanUsername}`);
    if (existingUser && Object.keys(existingUser).length > 0) {
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

    // Save to Vercel KV
    await kv.hset(`user:${cleanUsername}`, newUser);
    // Maintain a reverse lookup for user ID to username (needed for session/profile fetching)
    await kv.set(`uid:${userId}`, cleanUsername);

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
    const user = await kv.hgetall(`user:${cleanUsername}`) as any;

    if (!user || Object.keys(user).length === 0 || user.passwordHash !== password) {
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
    const username = await kv.get(`uid:${session.userId}`);
    if (!username) return res.status(401).json({ success: false });

    const user = await kv.hgetall(`user:${username}`) as any;
    if (!user) return res.status(401).json({ success: false });
    
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
  const { userId, username } = req.user;
  const { fullName, email, bio, avatar, theme, language, focusTarget } = req.body;

  try {
    const user = await kv.hgetall(`user:${username}`) as any;
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    const updatedUser = {
      ...user,
      fullName: fullName !== undefined ? fullName : user.fullName,
      email: email !== undefined ? email : user.email,
      bio: bio !== undefined ? bio : user.bio,
      avatar: avatar !== undefined ? avatar : user.avatar,
      theme: theme !== undefined ? theme : user.theme,
      language: language !== undefined ? language : user.language,
      focusTarget: focusTarget !== undefined ? Number(focusTarget) : user.focusTarget,
    };

    await kv.hset(`user:${username}`, updatedUser);

    res.json({
      success: true,
      message: "Profil berhasil diperbarui.",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui profil." });
  }
});

// CRUD: Get Activities
app.get("/api/activities", authMiddleware, async (req: any, res) => {
  const { userId } = req.user;
  try {
    let activities: any[] = (await kv.get(`activities:${userId}`)) || [];
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil aktivitas." });
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
    let activities: any[] = (await kv.get(`activities:${userId}`)) || [];
    
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

    activities.push(newActivity);
    await kv.set(`activities:${userId}`, activities);

    res.status(201).json({ success: true, data: newActivity });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal membuat aktivitas." });
  }
});

// CRUD: Update Activity
app.put("/api/activities/:id", authMiddleware, async (req: any, res) => {
  const { userId } = req.user;
  const activityId = req.params.id;
  const { title, description, category, priority, startTime, endTime, isCompleted } = req.body;

  try {
    let activities: any[] = (await kv.get(`activities:${userId}`)) || [];
    const index = activities.findIndex(a => a.id === activityId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Aktivitas tidak ditemukan." });
    }

    const activity = activities[index];
    if (title !== undefined) activity.title = title;
    if (description !== undefined) activity.description = description;
    if (category !== undefined) activity.category = category;
    if (priority !== undefined) activity.priority = priority;
    if (startTime !== undefined) activity.startTime = startTime;
    if (endTime !== undefined) activity.endTime = endTime;
    if (isCompleted !== undefined) activity.isCompleted = isCompleted;

    activities[index] = activity;
    await kv.set(`activities:${userId}`, activities);

    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui aktivitas." });
  }
});

// CRUD: Delete Activity
app.delete("/api/activities/:id", authMiddleware, async (req: any, res) => {
  const { userId } = req.user;
  const activityId = req.params.id;

  try {
    let activities: any[] = (await kv.get(`activities:${userId}`)) || [];
    const initialLen = activities.length;
    activities = activities.filter(a => a.id !== activityId);

    if (activities.length === initialLen) {
      return res.status(404).json({ success: false, message: "Aktivitas tidak ditemukan." });
    }

    await kv.set(`activities:${userId}`, activities);
    res.json({ success: true, message: "Aktivitas berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menghapus aktivitas." });
  }
});

// AI Recommendation
app.post("/api/ai/recommend", authMiddleware, async (req: any, res) => {
  const { userId } = req.user;
  
  try {
    let userActivities: any[] = (await kv.get(`activities:${userId}`)) || [];
    const client = getAIClient();
    if (!client) {
      return res.status(200).json({
        success: false,
        message: "Gemini API belum dikonfigurasi.",
        advice: "Saran: Selalu kerjakan prioritas Tinggi Anda lebih awal. Lakukan dengan fokus!",
      });
    }

    const activitiesContext = userActivities.map((act, index) => {
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
    let userActivities: any[] = (await kv.get(`activities:${userId}`)) || [];
    const user = await kv.hgetall(`user:${username}`) as any;
    
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
