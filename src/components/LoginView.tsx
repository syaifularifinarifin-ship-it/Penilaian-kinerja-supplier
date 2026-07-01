/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useSuppliers } from "../context/SupplierContext";
import Logo from "./Logo";
import { 
  Lock, 
  Shield, 
  AlertCircle, 
  ArrowRight,
  Eye,
  EyeOff,
  Cpu,
  UserCheck,
  Fingerprint
} from "lucide-react";

export default function LoginView() {
  const { 
    systemUsers,
    currentUser,
    setCurrentUser,
    setIsLoggedIn, 
    addLog 
  } = useSuppliers();

  const [loginMethod, setLoginMethod] = useState<"nid" | "select">("nid");
  const [nidInput, setNidInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id || (systemUsers.length > 0 ? systemUsers[0].id : ""));
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find matching user dynamically based on the NID entered
  const matchingUserByNid = nidInput.trim() 
    ? systemUsers.find(u => u.nid?.toLowerCase() === nidInput.trim().toLowerCase()) 
    : null;

  const activeUserToLogin = loginMethod === "nid"
    ? matchingUserByNid
    : (systemUsers.find(u => u.id === selectedUserId) || systemUsers[0]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    let userToAuth = activeUserToLogin;

    if (loginMethod === "nid") {
      if (!nidInput.trim()) {
        setError("NID / NIP Pegawai harus diisi.");
        setIsSubmitting(false);
        return;
      }
      if (!userToAuth) {
        setError(`Pengguna dengan NID "${nidInput}" tidak ditemukan.`);
        setIsSubmitting(false);
        return;
      }
    }

    if (!userToAuth) {
      setError("Pengguna tidak ditemukan.");
      setIsSubmitting(false);
      return;
    }

    const targetUser = userToAuth;

    // Simulate small latency for premium UI transition
    setTimeout(() => {
      if (passwordInput === targetUser.password) {
        setCurrentUser(targetUser);
        setIsLoggedIn(true);
        addLog("Login Sukses", `Pengguna ${targetUser.nama} (${targetUser.role}) berhasil mengautentikasi sistem menggunakan ${loginMethod === "nid" ? "NID" : "Pilihan Akun"}.`);
      } else {
        setError(`Kata sandi salah untuk ${targetUser.nama}. Silakan coba lagi.`);
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
        <div className="text-center space-y-3 flex flex-col items-center justify-center">
          <Logo height={45} className="mx-auto" />
          <div className="space-y-1">
            <h1 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
              SIPEKS <span className="text-indigo-600 dark:text-indigo-400">JATI B</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Sistem Evaluasi Kinerja Supplier
            </p>
          </div>
        </div>

        {/* Login Method Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("nid");
              setError("");
              setPasswordInput("");
            }}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
              loginMethod === "nid"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            Masuk dengan NID
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("select");
              setError("");
              setPasswordInput("");
            }}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
              loginMethod === "select"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            Pilih dari Daftar
          </button>
        </div>

        {loginMethod === "nid" ? (
          <div className="space-y-4">
            {/* NID Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                NID / NIP Pegawai
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={nidInput}
                onChange={(e) => {
                  setNidInput(e.target.value);
                  setError("");
                }}
                placeholder="Masukkan NID Pegawai (Contoh: NID19870512)"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* Matching User Profile Preview (Only if found) */}
            {matchingUserByNid ? (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3.5 rounded-xl border border-emerald-150 dark:border-emerald-900/30 flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-350 flex items-center justify-center font-extrabold text-xs border border-emerald-200 dark:border-emerald-900">
                  {matchingUserByNid.nama ? matchingUserByNid.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "US"}
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                    {matchingUserByNid.nama}
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{matchingUserByNid.role}</p>
                </div>
              </div>
            ) : nidInput.trim() ? (
              <div className="p-2.5 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-150 dark:border-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400 text-[10px] flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>NID belum terdaftar di sistem. Silakan periksa kembali.</span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
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
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-extrabold text-xs border border-indigo-250 dark:border-indigo-900">
                  {activeUserToLogin.nama ? activeUserToLogin.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "US"}
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                    {activeUserToLogin.nama}
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{activeUserToLogin.role}</p>
                </div>
              </div>
            )}
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
        <div className="bg-amber-50 dark:bg-amber-950/20 p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/40 text-amber-850 dark:text-amber-300 text-[10px] space-y-1.5">
          <p className="font-bold uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            Informasi Hak Akses & NID Kredensial
          </p>
          <div className="opacity-90 leading-relaxed text-[9px] space-y-1 font-mono">
            <div>• Admin (Syaiful): NID <span className="font-bold text-indigo-750 dark:text-indigo-300 bg-amber-100 dark:bg-amber-900/50 px-1 rounded">NID19870512</span> • Sandi: <span className="font-bold text-slate-700 dark:text-slate-300">admin123</span></div>
            <div>• Manajer (Hendra): NID <span className="font-bold text-indigo-750 dark:text-indigo-300 bg-amber-100 dark:bg-amber-900/50 px-1 rounded">NID19910405</span> • Sandi: <span className="font-bold text-slate-700 dark:text-slate-300">manajer123</span></div>
            <div>• Evaluator (Ahmad): NID <span className="font-bold text-indigo-750 dark:text-indigo-300 bg-amber-100 dark:bg-amber-900/50 px-1 rounded">NID19930819</span> • Sandi: <span className="font-bold text-slate-700 dark:text-slate-300">evaluator123</span></div>
            <div>• Viewer Staff (Viewer): NID <span className="font-bold text-indigo-750 dark:text-indigo-300 bg-amber-100 dark:bg-amber-900/50 px-1 rounded">NID19951231</span> • Sandi: <span className="font-bold text-slate-700 dark:text-slate-300">viewer123</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
