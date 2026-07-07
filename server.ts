import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiApp from "./api/index";
import fs from "fs";
import { User, Activity } from "./src/db/models";
import connectToDatabase from "./src/db/connection";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mount the API routes from our Vercel Serverless Function entry point
  app.use(apiApp);

  // Fallback local DB seeding logic for local development if needed
  if (process.env.NODE_ENV !== "production") {
    try {
      await connectToDatabase();
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log("Seeding initial local database...");
        const newUser = new User({
          id: "user-1",
          username: "satriopratama",
          passwordHash: "password123",
          fullName: "Satrio Pratama",
          email: "satrio.pratama@dayly.com",
          bio: "Sangat bersemangat menjaga keseimbangan hidup sehat dan produktivitas harian.",
          avatar: "avatar-3",
          joinDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), // 30 days ago
          theme: "dark",
          language: "id",
          focusTarget: 4,
        });
        await newUser.save();

        const newAct = new Activity({
          id: "act-1",
          userId: "user-1",
          title: "Olahraga Pagi (Jogging)",
          description: "Berlari santai di taman kompleks selama 30 menit untuk menjaga kebugaran fisik.",
          category: "Kesehatan",
          priority: "Tinggi",
          startTime: "06:00",
          endTime: "06:45",
          isCompleted: true,
          createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
        });
        await newAct.save();
      }
    } catch (err) {
      console.log("Skipping DB seeding because MONGODB_URI is not set or invalid.");
    }
  }

  // Serve static assets with Vite middleware in development or static folder in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is booted and running on http://localhost:${PORT}`);
  });
}

startServer();
