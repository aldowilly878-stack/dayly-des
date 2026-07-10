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
      <div id="session-loader" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin" />
          <Sparkles className="absolute w-5 h-5 text-indigo-500 animate-pulse" />
        </div>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4 animate-pulse">
          Menghubungkan Sesi...
        </p>
      </div>
    );
  }

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {token && user ? (
        <Dashboard token={token} user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
