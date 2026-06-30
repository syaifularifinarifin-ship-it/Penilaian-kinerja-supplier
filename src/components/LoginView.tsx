/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useSuppliers } from "../context/SupplierContext";
import { 
  Lock, 
  Shield, 
  AlertCircle, 
  ArrowRight,
  Eye,
  EyeOff,
  Cpu,
  UserCheck
} from "lucide-react";

export default function LoginView() {
  const { 
    systemUsers,
    currentUser,
    setCurrentUser,
    setIsLoggedIn, 
    addLog 
  } = useSuppliers();

  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id || (systemUsers.length > 0 ? systemUsers[0].id : ""));
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeUserToLogin = systemUsers.find(u => u.id === selectedUserId) || systemUsers[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!activeUserToLogin) {
      setError("Pengguna tidak ditemukan.");
      setIsSubmitting(false);
      return;
    }

    // Simulate small latency for premium UI transition
    setTimeout(() => {
      if (passwordInput === activeUserToLogin.password) {
        setCurrentUser(activeUserToLogin);
        setIsLoggedIn(true);
        addLog("Login Sukses", `Pengguna ${activeUserToLogin.nama} (${activeUserToLogin.role}) berhasil mengautentikasi sistem.`);
      } else {
        setError(`Kata sandi salah untuk ${activeUserToLogin.nama}. Silakan coba lagi.`);
        setIsSubmitting(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-400 dark:text-slate-600">
        v1.2.0 • SIPEKS SECURE PANEL
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 space-y-6 animate-fade-in relative">
        
        {/* Core System Branding */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-2 border border-indigo-100 dark:border-indigo-900/50">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
            SIPEKS <span className="text-indigo-600 dark:text-indigo-400">JATI B</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Sistem Evaluasi Kinerja Supplier
          </p>
        </div>

        {/* Select Account / User */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pilih Akun Pengguna
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setPasswordInput("");
              setError("");
            }}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
          >
            {systemUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nama} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* User Identity Preview */}
        {activeUserToLogin && (
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-extrabold text-sm border border-indigo-250 dark:border-indigo-900">
              {activeUserToLogin.nama ? activeUserToLogin.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "US"}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                {activeUserToLogin.nama}
                <UserCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{activeUserToLogin.role}</p>
            </div>
          </div>
        )}

        {/* Password input form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs rounded-lg flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Masukkan Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={isSubmitting}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••"
                className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-all shadow-md cursor-pointer"
          >
            {isSubmitting ? "Memverifikasi..." : "Masuk ke Dashboard"}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Development Helper Badge */}
        <div className="bg-amber-50 dark:bg-amber-950/20 p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/40 text-amber-850 dark:text-amber-300 text-[10px] space-y-1">
          <p className="font-bold uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            Informasi Hak Akses & Kata Sandi Bawaan
          </p>
          <div className="opacity-90 leading-relaxed text-[9.5px] space-y-1 font-mono">
            <div>• Admin (Syaiful): <span className="font-bold">admin123</span> (Akses Penuh)</div>
            <div>• Manajer (Hendra): <span className="font-bold">manajer123</span> (Kelola Data & Evaluasi)</div>
            <div>• Evaluator (Ahmad): <span className="font-bold">evaluator123</span> (Hanya Input Evaluasi)</div>
            <div>• Viewer Staff (Viewer): <span className="font-bold">viewer123</span> (Hanya Lihat Laporan)</div>
          </div>
        </div>

      </div>
    </div>
  );
}
