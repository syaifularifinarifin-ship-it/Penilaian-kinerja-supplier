/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useSuppliers } from "../context/SupplierContext";
import { SystemUser } from "../types";
import { 
  User, 
  Lock, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Key, 
  Mail, 
  UserCheck,
  Fingerprint,
  Eye,
  EyeOff,
  Users,
  Plus,
  Trash2,
  Edit2,
  Database,
  Cpu,
  ClipboardCheck,
  ShieldCheck,
  Check,
  X
} from "lucide-react";

export default function SettingsView() {
  const { 
    userProfile, 
    setUserProfile, 
    appPassword, 
    setAppPassword, 
    setIsLoggedIn,
    addLog,
    systemUsers,
    currentUser,
    setCurrentUser,
    addSystemUser,
    updateSystemUser,
    deleteSystemUser,
    hasPermission,
    units
  } = useSuppliers();

  // Profile Edit State
  const [profileNama, setProfileNama] = useState(userProfile.nama);
  const [profileEmail, setProfileEmail] = useState(userProfile.email);
  const [profileRole, setProfileRole] = useState(userProfile.role);
  const [profileUnitId, setProfileUnitId] = useState(userProfile.unitId || "");
  const [profileNid, setProfileNid] = useState(userProfile.nid || "");
  
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Change State
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Show/Hide Password Toggle
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sub-Tab Control (Profil Saya vs Pengaturan Hak Akses)
  const [subTab, setSubTab] = useState<"profile" | "permissions">("profile");

  // User Accounts & Hak Akses Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Form Fields
  const [formNama, setFormNama] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<SystemUser["role"]>("Viewer / Staff");
  const [formCanSuppliers, setFormCanSuppliers] = useState(false);
  const [formCanUnits, setFormCanUnits] = useState(false);
  const [formCanEvaluations, setFormCanEvaluations] = useState(false);
  const [formCanUsers, setFormCanUsers] = useState(false);
  const [formUnitId, setFormUnitId] = useState("");
  const [formNid, setFormNid] = useState("");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Auto recommend permissions based on Role selected
  const handleFormRoleChange = (role: SystemUser["role"]) => {
    setFormRole(role);
    if (role === "Administrator") {
      setFormCanSuppliers(true);
      setFormCanUnits(true);
      setFormCanEvaluations(true);
      setFormCanUsers(true);
    } else if (role === "Manajer Logistik") {
      setFormCanSuppliers(true);
      setFormCanUnits(true);
      setFormCanEvaluations(true);
      setFormCanUsers(false);
    } else if (role === "Evaluator Kinerja") {
      setFormCanSuppliers(false);
      setFormCanUnits(false);
      setFormCanEvaluations(true);
      setFormCanUsers(false);
    } else {
      setFormCanSuppliers(false);
      setFormCanUnits(false);
      setFormCanEvaluations(false);
      setFormCanUsers(false);
    }
  };

  const handleStartEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setFormNama(user.nama);
    setFormEmail(user.email);
    setFormPassword(user.password || "");
    setFormRole(user.role);
    setFormCanSuppliers(user.canManageSuppliers);
    setFormCanUnits(user.canManageUnits);
    setFormCanEvaluations(user.canManageEvaluations);
    setFormCanUsers(user.canManageUsers);
    setFormUnitId(user.unitId || "");
    setFormNid(user.nid || "");
    setIsFormOpen(true);
    setFormError("");
    setFormSuccess("");
  };

  const handleStartAddUser = () => {
    setEditingUser(null);
    setFormNama("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("Viewer / Staff");
    setFormCanSuppliers(false);
    setFormCanUnits(false);
    setFormCanEvaluations(false);
    setFormCanUsers(false);
    setFormUnitId("");
    setFormNid("");
    setIsFormOpen(true);
    setFormError("");
    setFormSuccess("");
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formNama.trim() || !formEmail.trim() || !formPassword.trim()) {
      setFormError("Semua kolom wajib diisi.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail.trim())) {
      setFormError("Format email tidak valid.");
      return;
    }

    // Check if email already used by another user
    const duplicate = systemUsers.find(u => u.email.toLowerCase() === formEmail.trim().toLowerCase() && (!editingUser || u.id !== editingUser.id));
    if (duplicate) {
      setFormError("Alamat email ini sudah digunakan oleh pengguna lain.");
      return;
    }

    const userData = {
      nama: formNama.trim(),
      email: formEmail.trim(),
      password: formPassword.trim(),
      role: formRole,
      canManageSuppliers: formCanSuppliers,
      canManageUnits: formCanUnits,
      canManageEvaluations: formCanEvaluations,
      canManageUsers: formCanUsers,
      unitId: formUnitId,
      nid: formNid.trim()
    };

    if (editingUser) {
      updateSystemUser({
        ...editingUser,
        ...userData
      });
      setFormSuccess("Pengguna berhasil diperbarui!");
    } else {
      addSystemUser(userData);
      setFormSuccess("Pengguna baru berhasil ditambahkan!");
    }

    setTimeout(() => {
      setIsFormOpen(false);
      setEditingUser(null);
      setFormSuccess("");
    }, 1200);
  };

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    if (!profileNama.trim() || !profileEmail.trim() || !profileRole.trim()) {
      setProfileError("Semua kolom profil wajib diisi.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileEmail.trim())) {
      setProfileError("Format email tidak valid.");
      return;
    }

    setUserProfile({
      nama: profileNama.trim(),
      email: profileEmail.trim(),
      role: profileRole.trim(),
      unitId: profileUnitId,
      nid: profileNid.trim()
    });

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        nama: profileNama.trim(),
        email: profileEmail.trim(),
        role: profileRole.trim() as any,
        unitId: profileUnitId,
        nid: profileNid.trim()
      };
      setCurrentUser(updatedUser);
      updateSystemUser(updatedUser);
    }

    setProfileSuccess("Profil berhasil diperbarui!");
    addLog("Perbarui Profil", `Mengubah profil pengguna menjadi ${profileNama.trim()} (${profileRole.trim()})`);
    
    setTimeout(() => setProfileSuccess(""), 4000);
  };

  // Handle Save Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (!currentPasswordInput || !newPassword || !confirmPassword) {
      setPasswordError("Semua kolom kata sandi wajib diisi.");
      return;
    }

    if (currentPasswordInput !== appPassword) {
      setPasswordError("Kata sandi saat ini salah.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Kata sandi baru minimal harus terdiri dari 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    // Update password
    setAppPassword(newPassword);
    setPasswordSuccess("Kata sandi berhasil diperbarui!");
    addLog("Perbarui Kata Sandi", "Mengubah kata sandi akses sistem.");

    // Clear inputs
    setCurrentPasswordInput("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => setPasswordSuccess(""), 4000);
  };

  // Lock system (Logout)
  const handleLockSystem = () => {
    if (confirm("Apakah Anda yakin ingin keluar dan mengunci sistem? Anda memerlukan kata sandi untuk masuk kembali.")) {
      setIsLoggedIn(false);
      addLog("Logout", "Sesi pengguna dikunci oleh sistem.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Pengaturan Pengguna & Keamanan
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Kelola informasi profil pribadi Anda, ubah kata sandi sistem, dan atur hak akses untuk setiap pengguna aplikasi.
        </p>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setSubTab("profile")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            subTab === "profile"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <User className="w-4 h-4" />
          Profil Saya & Keamanan
        </button>
        <button
          onClick={() => setSubTab("permissions")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            subTab === "permissions"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Daftar & Hak Akses Pengguna
          {hasPermission("users") ? (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded border border-emerald-250 dark:border-emerald-900/40 uppercase tracking-wider">
              Kelola
            </span>
          ) : (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-500 rounded border border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              Lihat
            </span>
          )}
        </button>
      </div>

      {subTab === "profile" ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Profile Card & Session controls */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs text-center">
              {/* Avatar representation */}
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-black">
                  {userProfile.nama ? userProfile.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "US"}
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="Sesi Aktif" />
              </div>

              <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">{userProfile.nama}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{userProfile.role}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium break-all">{userProfile.email}</p>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-850 rounded-md border border-slate-150 dark:border-slate-800 text-center inline-block min-w-[100px]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">NID / NIP</span>
                  <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
                    {userProfile.nid || "-"}
                  </span>
                </div>

                <div className="px-3 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-md border border-indigo-100 dark:border-indigo-900/30 text-center inline-block min-w-[120px]">
                  <span className="text-[9px] font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-wider block">Unit Penugasan</span>
                  <span className="text-[11px] font-extrabold text-indigo-850 dark:text-indigo-200 mt-0.5 block">
                    {units.find(u => u.id === userProfile.unitId)?.nama || "Semua Unit / Pusat"}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="text-left text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Keamanan</div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-100 dark:border-slate-800/50">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-[11px]">Enkripsi Local Storage Aktif</span>
                </div>
                
                <button
                  onClick={handleLockSystem}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Kunci Aplikasi / Keluar
                </button>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900/40 text-amber-850 dark:text-amber-300 text-xs flex gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
              <div className="space-y-1">
                <p className="font-bold text-[11px] uppercase tracking-wider">Pemberitahuan Sistem</p>
                <p className="text-[10px] leading-relaxed opacity-90">
                  Perubahan pada nama dan role profil akan langsung diterapkan pada penandatanganan dan logger aktivitas baru di seluruh modul aplikasi.
                </p>
              </div>
            </div>
          </div>

          {/* Edit Forms Column */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Profile Form */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-white">Ubah Informasi Profil</h3>
              </div>

              <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
                {profileSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/45 text-emerald-600 dark:text-emerald-400 text-xs rounded flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {profileSuccess}
                  </div>
                )}

                {profileError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/45 text-rose-600 dark:text-rose-400 text-xs rounded flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    {profileError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                    <div className="relative">
                      <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={profileNama}
                        onChange={(e) => setProfileNama(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jabatan / Peran</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={profileRole}
                        onChange={(e) => setProfileRole(e.target.value)}
                        placeholder="Contoh: Manajer, Evaluator"
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="nama@perusahaan.com"
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NID / NIP Pegawai</label>
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={profileNid}
                        onChange={(e) => setProfileNid(e.target.value)}
                        placeholder="Masukkan NID / NIP Pegawai"
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit Pembangkit Penugasan</label>
                  <div className="relative">
                    <Database className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={profileUnitId}
                      onChange={(e) => setProfileUnitId(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
                    >
                      <option value="">Semua Unit (Pusat / Seluruh Pembangkit)</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nama} ({u.kode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/85">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-all shadow-xs cursor-pointer"
                  >
                    Simpan Perubahan Profil
                  </button>
                </div>
              </form>
            </div>

            {/* Password Form */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-white">Ubah Kata Sandi</h3>
              </div>

              <form onSubmit={handleSavePassword} className="p-5 space-y-4">
                {passwordSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/45 text-emerald-600 dark:text-emerald-400 text-xs rounded flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/45 text-rose-600 dark:text-rose-400 text-xs rounded flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    {passwordError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kata Sandi Saat Ini</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showCurrent ? "text" : "password"}
                      required
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Masukkan kata sandi lama Anda"
                      className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kata Sandi Baru</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showNew ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 karakter"
                        className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Konfirmasi Kata Sandi Baru</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Masukkan ulang kata sandi baru"
                        className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/85">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-all shadow-xs cursor-pointer"
                  >
                    Ganti Kata Sandi
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      ) : (
        <div className="space-y-6">
          {/* User management and Access rights tab */}
          {isFormOpen ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden max-w-2xl mx-auto">
              <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-white">
                    {editingUser ? `Ubah Hak Akses: ${editingUser.nama}` : "Tambah Pengguna Sistem Baru"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUserForm} className="p-6 space-y-5">
                {formSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/45 text-emerald-600 dark:text-emerald-400 text-xs rounded flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {formSuccess}
                  </div>
                )}

                {formError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/45 text-rose-600 dark:text-rose-400 text-xs rounded flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={formNama}
                      onChange={(e) => setFormNama(e.target.value)}
                      placeholder="Nama Lengkap Pengguna"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat Email</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="nama@perusahaan.com"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kata Sandi Akses</label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? "text" : "password"}
                        required
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Minimal 6 Karakter"
                        className="w-full pl-3 pr-10 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Peran Pengguna (Role)</label>
                    <select
                      value={formRole}
                      onChange={(e) => handleFormRoleChange(e.target.value as SystemUser["role"])}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="Manajer Logistik">Manajer Logistik</option>
                      <option value="Evaluator Kinerja">Evaluator Kinerja</option>
                      <option value="Viewer / Staff">Viewer / Staff</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NID / NIP Pegawai</label>
                    <input
                      type="text"
                      value={formNid}
                      onChange={(e) => setFormNid(e.target.value)}
                      placeholder="Masukkan NID / NIP Pegawai"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit Pembangkit Penugasan</label>
                    <select
                      value={formUnitId}
                      onChange={(e) => setFormUnitId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-900 dark:text-white"
                    >
                      <option value="">Semua Unit (Pusat / Seluruh Pembangkit)</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nama} ({u.kode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Permissions Toggles */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-150 dark:border-slate-800 space-y-3">
                  <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    Otorisasi Hak Akses (Custom Override)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    {/* canManageSuppliers */}
                    <label className="flex items-start gap-2.5 p-2 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800/80 cursor-pointer hover:border-indigo-400/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formCanSuppliers}
                        onChange={(e) => setFormCanSuppliers(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                      />
                      <div className="text-[11px] leading-tight">
                        <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                          <Database className="w-3 h-3 text-indigo-500" />
                          Database Supplier
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Kelola & unggat data supplier</p>
                      </div>
                    </label>

                    {/* canManageUnits */}
                    <label className="flex items-start gap-2.5 p-2 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800/80 cursor-pointer hover:border-indigo-400/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formCanUnits}
                        onChange={(e) => setFormCanUnits(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                      />
                      <div className="text-[11px] leading-tight">
                        <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-sky-500" />
                          Database Unit
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Tambah & atur unit pembangkit</p>
                      </div>
                    </label>

                    {/* canManageEvaluations */}
                    <label className="flex items-start gap-2.5 p-2 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800/80 cursor-pointer hover:border-indigo-400/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formCanEvaluations}
                        onChange={(e) => setFormCanEvaluations(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                      />
                      <div className="text-[11px] leading-tight">
                        <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                          <ClipboardCheck className="w-3 h-3 text-emerald-500" />
                          Input Penilaian
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Lakukan evaluasi & kuesioner</p>
                      </div>
                    </label>

                    {/* canManageUsers */}
                    <label className="flex items-start gap-2.5 p-2 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800/80 cursor-pointer hover:border-indigo-400/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formCanUsers}
                        disabled={formRole === "Administrator"} // Always true for Admin
                        onChange={(e) => setFormCanUsers(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 disabled:opacity-50"
                      />
                      <div className="text-[11px] leading-tight">
                        <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-violet-500" />
                          Hak Akses Pengguna
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Kelola hak akses & user baru</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/85">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-all shadow-xs cursor-pointer"
                  >
                    Simpan Pengguna
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Bar inside Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Sistem Manajemen Hak Akses Pengguna
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Konfigurasikan kewenangan akses pengguna untuk memastikan integritas data penilaian supplier.
                  </p>
                </div>

                {hasPermission("users") && (
                  <button
                    onClick={handleStartAddUser}
                    className="sm:self-center flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Pengguna
                  </button>
                )}
              </div>

              {/* User Directory Table / Grid */}
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850">
                        <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pengguna</th>
                        <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Peran & Kredensial</th>
                        <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Hak Akses Modul</th>
                        <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {systemUsers.map((user) => {
                        const isActiveSession = currentUser?.id === user.id;

                        return (
                          <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                            {/* User column */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-750">
                                  {user.nama ? user.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "US"}
                                </div>
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-extrabold text-slate-900 dark:text-white text-xs leading-none">
                                      {user.nama}
                                    </p>
                                    {isActiveSession && (
                                      <span className="text-[8px] font-bold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-sm border border-emerald-200 dark:border-emerald-900/30 uppercase tracking-widest leading-none">
                                        Aktif
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">{user.email}</p>
                                  {user.nid && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">NID:</span>
                                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">{user.nid}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Credentials / Role column */}
                            <td className="px-5 py-4">
                              <div>
                                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-sm bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                                  {user.role}
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono mt-1">
                                  Sandi: <span className="text-slate-600 dark:text-slate-300 font-semibold">{user.password}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                  Unit: <span className="text-indigo-600 dark:text-indigo-450 font-bold">{units.find(u => u.id === user.unitId)?.nama || "Semua Unit"}</span>
                                </div>
                              </div>
                            </td>

                            {/* Permissions Grid column */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {/* Supplier permission badge */}
                                <span 
                                  title="Kelola Database Supplier"
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                                    user.canManageSuppliers 
                                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30" 
                                      : "bg-slate-50 text-slate-400 dark:bg-slate-950 dark:text-slate-600 border border-slate-100 dark:border-slate-800/40"
                                  }`}
                                >
                                  🗄️ {user.canManageSuppliers ? "Edit" : "Baca"}
                                </span>

                                {/* Unit permission badge */}
                                <span 
                                  title="Kelola Database Unit"
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                                    user.canManageUnits 
                                      ? "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30" 
                                      : "bg-slate-50 text-slate-400 dark:bg-slate-950 dark:text-slate-600 border border-slate-100 dark:border-slate-800/40"
                                  }`}
                                >
                                  ⚡ {user.canManageUnits ? "Edit" : "Baca"}
                                </span>

                                {/* Evaluation permission badge */}
                                <span 
                                  title="Kelola Input Penilaian"
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                                    user.canManageEvaluations 
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" 
                                      : "bg-slate-50 text-slate-400 dark:bg-slate-950 dark:text-slate-600 border border-slate-100 dark:border-slate-800/40"
                                  }`}
                                >
                                  📋 {user.canManageEvaluations ? "Edit" : "Baca"}
                                </span>

                                {/* Users permission badge */}
                                <span 
                                  title="Kelola Hak Akses Pengguna"
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                                    user.canManageUsers 
                                      ? "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30" 
                                      : "bg-slate-50 text-slate-400 dark:bg-slate-950 dark:text-slate-600 border border-slate-100 dark:border-slate-800/40"
                                  }`}
                                >
                                  🛡️ {user.canManageUsers ? "Edit" : "Kunci"}
                                </span>
                              </div>
                            </td>

                            {/* Actions column */}
                            <td className="px-5 py-4 text-right">
                              {hasPermission("users") ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleStartEditUser(user)}
                                    className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                    title="Edit Pengguna"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteSystemUser(user.id)}
                                    disabled={isActiveSession}
                                    className={`p-1 rounded cursor-pointer ${
                                      isActiveSession 
                                        ? "text-slate-300 dark:text-slate-750 opacity-40 cursor-not-allowed" 
                                        : "text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                                    title={isActiveSession ? "Sesi Sedang Aktif" : "Hapus Pengguna"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No access</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {!hasPermission("users") && (
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-lg border border-slate-150 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex gap-2">
                  <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">Akses Terbatas: Hanya Mode Lihat</p>
                    <p className="text-[11px] leading-relaxed mt-0.5">
                      Akun Anda saat ini memiliki peran <strong className="font-semibold text-slate-700 dark:text-slate-300">{currentUser?.role || userProfile.role}</strong>. Hanya pengguna dengan peran Administrator atau hak khusus yang dapat menambahkan, mengubah, atau menghapus pengguna lainnya.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
