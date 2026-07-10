import React, { useState } from "react";
import { User, Lock, ArrowRight, Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { motion } from "motion/react";
import { AuthResponse } from "../types";
import mascotImg from "../assets/images/dayly_mascot_1783408474403.jpg";
import illustrationImg from "../assets/images/productive_day_illustration_1783408489866.jpg";

interface LoginProps {
  onLoginSuccess: (token: string, user: { id: string; username: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username.trim() || !password) {
      setError("Semua bidang wajib diisi.");
      return;
    }

    setLoading(true);
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data: AuthResponse = await response.json();

      if (response.ok && data.success) {
        if (isRegister) {
          setSuccessMsg(data.message);
          setIsRegister(false);
          setPassword(""); // Clear password, keep username
        } else if (data.token && data.user) {
          onLoginSuccess(data.token, data.user);
        }
      } else {
        setError(data.message || "Terjadi kesalahan.");
      }
    } catch (err) {
      console.error("Auth request failed:", err);
      setError("Gagal terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#F0FAF5] dark:bg-slate-950 flex flex-col lg:flex-row transition-colors duration-300 font-sans">
      
      {/* LEFT PANEL: Elegant design showcase (visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#00CC88] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Floating background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00E599]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/10">
            <img src={mascotImg} alt="DAYLY" className="w-8 h-8 rounded-lg" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-xl font-black font-display tracking-tight text-white leading-none">DAYLY</h1>
            <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest block mt-0.5">Healthy Productivity</span>
          </div>
        </div>

        {/* Middle Mascot & Illustration Showcase */}
        <div className="relative z-10 max-w-md mx-auto text-center space-y-6 my-auto">
          <div className="relative inline-block">
            <div className="w-40 h-40 bg-white rounded-[2.5rem] border-4 border-emerald-100/30 shadow-2xl p-2 flex items-center justify-center overflow-hidden transform hover:scale-105 transition-all duration-300">
              <img src={mascotImg} alt="Cute Mascot" className="w-full h-full rounded-3xl object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-lg">
              Halo! 👋
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black font-display tracking-tight leading-tight">
              Selesaikan Tugas,<br />Rawat Kebiasaan Sehat.
            </h2>
            <p className="text-sm text-emerald-50/90 font-medium leading-relaxed max-w-sm mx-auto">
              Satu-satunya aplikasi pengatur harian yang ramah, interaktif, dan fokus pada kesehatan mental Anda.
            </p>
          </div>

          {/* Minimal visual widget mockup using actual illustration */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-4 shadow-xl flex items-center gap-4 text-left max-w-xs mx-auto">
            <img src={illustrationImg} alt="Productivity" className="w-14 h-14 rounded-2xl object-cover shrink-0" referrerPolicy="no-referrer" />
            <div>
              <p className="text-xs font-bold text-white leading-snug">Rencana Sehat Hari Ini</p>
              <p className="text-[10px] text-emerald-100 mt-0.5">3 aktivitas selesai • Streak menyala!</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Credits */}
        <div className="relative z-10 text-[11px] text-emerald-100 font-medium flex items-center justify-between">
          <span>© 2026 DAYLY Corp. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-yellow-300" />
            Koneksi Terenkripsi & Aman
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: Form inputs */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 relative overflow-hidden">
        {/* Ambient mobile lights */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-100/30 dark:bg-emerald-950/10 rounded-full blur-3xl pointer-events-none lg:hidden" />
        
        <div className="mx-auto w-full max-w-md relative z-10">
          
          {/* Logo on mobile view only */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-1.5 shadow-md flex items-center justify-center">
                <img src={mascotImg} alt="DAYLY mascot" className="w-full h-full rounded-2xl object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            <h2 className="text-3xl font-black font-display text-emerald-600 dark:text-emerald-400 tracking-tight">
              DAYLY
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1 dark:text-slate-400">
              Kelola waktu, produktivitas, dan kegiatan sehatmu dengan mudah
            </p>
          </div>

          {/* Card Frame */}
          <div className="bg-white dark:bg-slate-900 py-10 px-6 sm:px-10 border-2 border-[#064E3B] dark:border-emerald-500/30 journal-card-shadow rounded-[2rem] transition-all duration-300">
            
            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-display">
                {isRegister ? "Daftar Akun Baru" : "Selamat Datang Kembali!"}
              </h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
                {isRegister 
                  ? "Ayo daftarkan akunmu dalam hitungan detik untuk memulai hari yang segar." 
                  : "Silakan masuk untuk melanjutkan rutinitas harian sehat bersamaku."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Status Messages */}
              {error && (
                <div id="auth-error-banner" className="flex gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span className="font-bold">{error}</span>
                </div>
              )}
              {successMsg && (
                <div id="auth-success-banner" className="flex gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl">
                  <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span className="font-bold">{successMsg}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-display">
                  Username Akun
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4 text-emerald-600" />
                  </div>
                  <input
                    id="auth-input-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-[#064E3B]/10 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400 font-bold"
                    placeholder="Contoh: satriopratama"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-display">
                  Kata Sandi Rahasia
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <input
                    id="auth-input-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-[#064E3B]/10 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400"
                    placeholder="Masukkan kata sandi..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border-2 border-[#064E3B] dark:border-transparent rounded-2xl shadow-sm text-sm font-black text-white bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 hover:shadow-emerald-500/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isRegister ? (
                    <>
                      <UserPlus className="w-4.5 h-4.5" />
                      <span>Daftarkan Akun Baru</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4.5 h-4.5" />
                      <span>Masuk ke Dayly</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Toggle Screen Link */}
            <div className="mt-6 flex justify-center text-xs">
              <button
                id="auth-toggle-screen-btn"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-black tracking-tight transition-colors flex items-center gap-1 cursor-pointer"
              >
                {isRegister ? (
                  <>
                    <span>Sudah punya akun? Masuk di sini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Belum punya akun? Registrasi gratis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Informative Credentials help card */}
          {!isRegister && (
            <div id="login-helper-tip" className="mt-5 bg-emerald-50/40 dark:bg-slate-900 border border-emerald-100/30 dark:border-slate-800/60 rounded-3xl p-5 text-slate-500 dark:text-slate-400 text-xs flex gap-3 shadow-sm">
              <span className="text-xl">💡</span>
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">Saran Uji Coba Cepat:</p>
                <p className="mt-0.5">Anda dapat mendaftarkan akun baru apa saja, atau langsung masuk menggunakan akun default berikut:</p>
                <div className="mt-2.5 font-mono text-[11px] bg-white dark:bg-slate-950 border border-emerald-100/20 dark:border-slate-800 p-3 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed shadow-inner">
                  Username: <span className="font-bold text-emerald-600 dark:text-emerald-400">satriopratama</span><br />
                  Password: <span className="font-bold text-emerald-600 dark:text-emerald-400">password123</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

