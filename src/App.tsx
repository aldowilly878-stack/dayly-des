import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { User } from "./types";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem("auth_token");
      if (!storedToken) {
        setLoadingSession(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/session", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const result = await response.json();

        if (response.ok && result.success && result.user) {
          setToken(storedToken);
          setUser(result.user);
        } else {
          // Token is expired or invalid
          localStorage.removeItem("auth_token");
        }
      } catch (err) {
        console.error("Gagal menyinkronkan sesi:", err);
      } finally {
        setLoadingSession(false);
      }
    };

    checkSession();
  }, []);

  // Apply theme dynamically
  useEffect(() => {
    if (user) {
      if (user.theme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [user]);

  const handleLoginSuccess = (newToken: string, loggedInUser: User) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    setUser(loggedInUser);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    document.documentElement.classList.add("dark");
  };

  if (loadingSession) {
    return (
      <div id="session-loader" className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col items-center justify-center transition-colors duration-300">
        {/* Decorative gradient blobs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex items-center justify-center animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
        </div>
        <div className="mt-5 space-y-2 text-center animate-fade-in">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight">
            DAYLY
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app-root" className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {token && user ? (
        <Dashboard token={token} user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
