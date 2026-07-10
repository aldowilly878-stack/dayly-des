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
    <div id="login-container" className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col lg:flex-row transition-colors duration-300 font-sans">
      
      {/* LEFT PANEL: Modern gradient showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Floating decorative shapes */}
        <div className="absolute top-[-100px] right-[-50px] w-[400px] h-[400px] bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-60px] w-[350px] h-[350px] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <img src={mascotImg} alt="DAYLY" className="w-8 h-8 rounded-xl" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none font-display">DAYLY</h1>
            <span className="text-[10px] font-semibold text-indigo-200 uppercase tracking-widest block mt-0.5">Healthy Productivity</span>
          </div>
        </div>

        {/* Middle Showcase */}
        <div className="relative z-10 max-w-md mx-auto text-center space-y-8 my-auto">
          <div className="relative inline-block">
            <div className="w-36 h-36 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/15 p-2 flex items-center justify-center overflow-hidden transform hover:scale-105 transition-all duration-500">
              <img src={mascotImg} alt="Cute Mascot" className="w-full h-full rounded-2xl object-cover" referrerPolicy="no-referrer" />
            </div>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -bottom-2 -right-3 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-amber-400/30"
            >
              Halo! 👋
            </motion.div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight font-display">
              Selesaikan Tugas,<br />Rawat Kebiasaan Sehat.
            </h2>
            <p className="text-sm text-indigo-200 font-medium leading-relaxed max-w-sm mx-auto">
              Satu-satunya aplikasi pengatur harian yang ramah, interaktif, dan fokus pada kesehatan mental Anda.
            </p>
          </div>

          {/* Feature card */}
          <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex items-center gap-4 text-left max-w-xs mx-auto">
            <img src={illustrationImg} alt="Productivity" className="w-14 h-14 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
            <div>
              <p className="text-xs font-bold text-white leading-snug">Rencana Sehat Hari Ini</p>
              <p className="text-[10px] text-indigo-200 mt-0.5">3 aktivitas selesai • Streak menyala!</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 text-[11px] text-indigo-200 font-medium flex items-center justify-between">
          <span>© 2026 DAYLY Corp. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-300" />
            Koneksi Terenkripsi & Aman
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 relative overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-100/40 dark:bg-indigo-950/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-purple-100/30 dark:bg-purple-950/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mx-auto w-full max-w-md relative z-10">
          
          {/* Logo on mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-1.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
                <img src={mascotImg} alt="DAYLY mascot" className="w-full h-full rounded-2xl object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold gradient-text tracking-tight font-display">DAYLY</h2>
            <p className="text-xs font-medium text-slate-500 mt-1 dark:text-slate-400">
              Kelola waktu, produktivitas, dan kegiatan sehatmu dengan mudah
            </p>
          </div>

          {/* Card Frame */}
          <div className="bg-white dark:bg-slate-900 py-10 px-6 sm:px-10 border border-slate-200 dark:border-slate-800 elevation-3 rounded-3xl transition-all duration-300">
            
            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display">
                {isRegister ? "Daftar Akun Baru" : "Selamat Datang Kembali!"}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {isRegister 
                  ? "Ayo daftarkan akunmu dalam hitungan detik untuk memulai hari yang segar." 
                  : "Silakan masuk untuk melanjutkan rutinitas harian sehat bersamaku."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Status Messages */}
              {error && (
                <div id="auth-error-banner" className="flex gap-2.5 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm rounded-xl">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}
              {successMsg && (
                <div id="auth-success-banner" className="flex gap-2.5 p-4 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="font-medium">{successMsg}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Username Akun
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-4.5 h-4.5 text-slate-400" />
                  </div>
                  <input
                    id="auth-input-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Contoh: satriopratama"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Kata Sandi Rahasia
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-4.5 h-4.5 text-slate-400" />
                  </div>
                  <input
                    id="auth-input-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 font-medium"
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
                  className="w-full flex justify-center items-center gap-2.5 py-4 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 active-press transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Toggle Link */}
            <div className="mt-6 flex justify-center text-sm">
              <button
                id="auth-toggle-screen-btn"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold tracking-tight transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isRegister ? (
                  <>
                    <span>Sudah punya akun? Masuk di sini</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Belum punya akun? Registrasi gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Helper tip */}
          {!isRegister && (
            <div id="login-helper-tip" className="mt-5 bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100/50 dark:border-slate-800 rounded-2xl p-5 text-slate-500 dark:text-slate-400 text-sm flex gap-3 elevation-1">
              <span className="text-xl">💡</span>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Saran Uji Coba Cepat:</p>
                <p className="mt-0.5 text-xs">Anda dapat mendaftarkan akun baru apa saja, atau langsung masuk menggunakan akun default berikut:</p>
                <div className="mt-2.5 font-mono text-xs bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                  Username: <span className="font-bold text-indigo-600 dark:text-indigo-400">satriopratama</span><br />
                  Password: <span className="font-bold text-indigo-600 dark:text-indigo-400">password123</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
