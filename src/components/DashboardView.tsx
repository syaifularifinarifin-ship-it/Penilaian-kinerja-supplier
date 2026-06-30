/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useSuppliers } from "../context/SupplierContext";
import { 
  ASPECT_LABELS, 
  ASPECT_WEIGHTS, 
  AspectKey, 
  getPredikatAndColor 
} from "../types";
import { 
  Building2, 
  TrendingUp, 
  ShieldAlert, 
  Award, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Clock, 
  UserCheck 
} from "lucide-react";

export default function DashboardView() {
  const {
    suppliers,
    evaluations,
    activityLogs,
    addSupplier,
    selectedYear,
    setSelectedYear,
    selectedPeriode,
    setSelectedPeriode,
    setActiveTab,
    setSelectedSupplierIdForRaport
  } = useSuppliers();

  // State for supplier quick registration modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupNama, setNewSupNama] = useState("");
  const [newSupKategori, setNewSupKategori] = useState("Penyedia Bahan Bakar Batubara");
  const [newSupAlamat, setNewSupAlamat] = useState("");
  const [newSupKontak, setNewSupKontak] = useState("");
  const [newSupEmail, setNewSupEmail] = useState("");
  const [newSupTelepon, setNewSupTelepon] = useState("");
  
  // Filtering Evaluations based on Year and Period
  const filteredEvals = evaluations.filter(e => {
    const matchYear = e.tahun === selectedYear;
    const matchPeriode = selectedPeriode === "Semua" ? true : e.periode === selectedPeriode;
    return matchYear && matchPeriode;
  });

  // KPI Calculations
  const totalEvaluated = filteredEvals.length;
  
  const avgScore = totalEvaluated > 0 
    ? Math.round((filteredEvals.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / totalEvaluated) * 100) / 100
    : 0;

  // Find Top Supplier
  const topEval = filteredEvals.length > 0 
    ? [...filteredEvals].sort((a, b) => b.nilaiAkhir - a.nilaiAkhir)[0]
    : null;

  // Average K3L Score
  const avgK3L = totalEvaluated > 0
    ? Math.round((filteredEvals.reduce((acc, curr) => acc + curr.scores.k3l, 0) / totalEvaluated) * 10) / 10
    : 0;

  // Calculate Aspect Averages for Bar Chart
  const aspects: AspectKey[] = ["integritas", "kerjasama", "mutu", "waktu", "harga", "k3l", "keamanan", "energi"];
  const aspectAverages = aspects.map(key => {
    const totalAspectScore = filteredEvals.reduce((acc, curr) => acc + (curr.scores[key] || 0), 0);
    const avg = totalEvaluated > 0 ? Math.round((totalAspectScore / totalEvaluated) * 10) / 10 : 0;
    return {
      key,
      label: ASPECT_LABELS[key],
      weight: ASPECT_WEIGHTS[key] * 100,
      avg
    };
  });

  // Handle Quick Supplier Register
  const handleRegisterSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupNama.trim()) return;
    addSupplier({
      nama: newSupNama,
      kategoriBisnis: newSupKategori,
      alamat: newSupAlamat,
      kontak: newSupKontak,
      email: newSupEmail,
      telepon: newSupTelepon
    });
    // Reset form
    setNewSupNama("");
    setNewSupAlamat("");
    setNewSupKontak("");
    setNewSupEmail("");
    setNewSupTelepon("");
    setIsModalOpen(false);
  };

  // Quick navigate to Raport per supplier
  const handleViewRaport = (supId: string) => {
    setSelectedSupplierIdForRaport(supId);
    setActiveTab("raport");
  };

  return (
    <div id="dashboard-view" className="space-y-6">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            Dashboard Penilaian Kinerja Supplier
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Monitoring kinerja supplier pembangkit listrik secara berkala berdasarkan aspek kepatuhan, keandalan, dan K3L.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none text-slate-700 dark:text-slate-200 font-semibold focus:ring-0 outline-none text-xs"
            >
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
              <option value="2024">Tahun 2024</option>
            </select>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={selectedPeriode} 
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-200 font-semibold focus:ring-0 outline-none text-xs"
            >
              <option value="Semua">Semua Periode</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Tahunan">Tahunan</option>
            </select>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-[#0284c7] hover:bg-sky-700 text-white font-semibold text-xs px-3.5 py-2 rounded shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrasi Supplier
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Suppliers */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Total Supplier Dinilai</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{totalEvaluated} <span className="text-xs font-normal text-slate-400">/ {suppliers.length}</span></h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              100% partisipasi aktif periode ini
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded text-slate-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Rata-rata Skor Kinerja</p>
            <h3 className="text-2xl font-bold text-[#0284c7] dark:text-sky-400">{avgScore} <span className="text-xs font-normal text-slate-400">/ 5</span></h3>
            <p className="text-[10px] text-slate-500">
              Kategori: <span className="font-bold text-emerald-600 dark:text-emerald-400">{getPredikatAndColor(avgScore).predikat}</span>
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded text-sky-600 dark:text-sky-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Top Supplier */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Supplier Terbaik</p>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[170px]">{topEval ? topEval.supplierNama : "N/A"}</h3>
            <p className="text-[10px] text-slate-500">
              Nilai: <span className="font-bold text-emerald-600">{topEval ? topEval.nilaiAkhir : 0}</span> ({topEval ? topEval.predikat : "-"})
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded text-emerald-500">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* K3L Compliance */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider font-sans">Kepatuhan K3L</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{avgK3L} <span className="text-xs font-normal text-slate-400">/ 5</span></h3>
            <p className="text-[10px] text-slate-500">
              Bobot Penilaian 20%
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded text-emerald-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Custom Interactive Aspect Averages Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider">Analisis Rata-Rata per Kategori Penilaian</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Perbandingan skor di seluruh aspek dengan bobot penilaian terintegrasi.</p>
            </div>
            <div className="text-right text-[11px] font-bold text-[#0284c7]">
              Tahun {selectedYear}
            </div>
          </div>

          {totalEvaluated === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] border border-dashed border-slate-200 dark:border-slate-800 rounded text-slate-400">
              <p className="text-xs">Tidak ada data penilaian untuk periode ini.</p>
              <button 
                onClick={() => setActiveTab("input")} 
                className="mt-2 text-xs text-sky-600 font-semibold hover:underline"
              >
                Input Penilaian Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Custom High-Fidelity Bar Chart Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {aspectAverages.map((aspect) => {
                  const barPercentage = (aspect.avg / 5) * 100;
                  let colorClass = "bg-[#0284c7] dark:bg-sky-400";
                  if (aspect.key === "k3l") colorClass = "bg-[#10b981] dark:bg-emerald-400";
                  if (aspect.key === "energi") colorClass = "bg-amber-500 dark:bg-amber-400";
                  
                  return (
                    <div key={aspect.key} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-200 dark:border-slate-800 hover:shadow-2xs transition-shadow">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate pr-2" title={aspect.label}>
                          {aspect.label}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          Bobot: <span className="font-bold text-slate-700 dark:text-slate-300">{aspect.weight}%</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                            style={{ width: `${barPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[28px] text-right font-mono">
                          {aspect.avg}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap justify-center gap-4 text-[10px] text-slate-500 pt-3 border-t border-slate-150 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#0284c7]"></span>
                  <span>Umum & Kerjasama</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]"></span>
                  <span>Manajemen K3L (20%)</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
                  <span>Manajemen Energi (5%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Performers Leaderboard */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider">Peringkat Supplier</h3>
              <span className="text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] px-2 py-0.5 rounded border border-sky-100">
                Lokal
              </span>
            </div>

            {filteredEvals.length === 0 ? (
              <div className="flex items-center justify-center h-[230px] text-slate-400 text-xs">
                Belum ada data peringkat.
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {[...filteredEvals]
                  .sort((a, b) => b.nilaiAkhir - a.nilaiAkhir)
                  .map((item, index) => {
                    const { predikat, color, bgColor, borderColor } = getPredikatAndColor(item.nilaiAkhir);
                    return (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-800/80 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                            index === 0 ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-200" :
                            index === 1 ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300" :
                            index === 2 ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 border border-orange-200" :
                            "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-200"
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]" title={item.supplierNama}>{item.supplierNama}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1 flex-wrap">
                              {item.unitKode && (
                                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-1 py-0.2 rounded border border-indigo-150/40 dark:border-indigo-900/40">
                                  {item.unitKode}
                                </span>
                              )}
                              <span className="truncate max-w-[80px]">{item.evaluator.split(" (")[0]}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{item.nilaiAkhir}</span>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${bgColor} ${color} ${borderColor}`}>
                            {predikat}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <button 
            onClick={() => setActiveTab("rekap")}
            className="w-full text-center mt-3 text-xs text-[#0284c7] font-semibold hover:underline"
          >
            Lihat Rekapitulasi Lengkap →
          </button>
        </div>
      </div>

      {/* Grid of Suppliers List & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Supplier Profile Mini-Management */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2">
          <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider">Profil Supplier Terdaftar</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Total {suppliers.length} supplier terdaftar di basis data.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-[#0284c7] font-semibold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <Plus className="w-3 h-3" /> Tambah Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-2 px-3">Nama Supplier</th>
                  <th className="py-2 px-3">Kategori Bisnis</th>
                  <th className="py-2 px-3">Narahubung</th>
                  <th className="py-2 px-3">Telepon / Email</th>
                  <th className="py-2 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {suppliers.slice(0, 4).map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {sup.nama}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950 text-[#0284c7] rounded text-[10px] font-medium border border-sky-100">
                        {sup.kategoriBisnis}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-500">
                      {sup.kontak}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="text-slate-800 dark:text-slate-200">{sup.telepon}</p>
                      <p className="text-[10px] text-slate-400">{sup.email}</p>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button 
                        onClick={() => handleViewRaport(sup.id)}
                        className="px-2 py-0.5 text-[10px] font-semibold text-[#0284c7] hover:text-white hover:bg-[#0284c7] border border-slate-200 hover:border-[#0284c7] rounded transition-all cursor-pointer"
                      >
                        Raport
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {suppliers.length > 4 && (
            <p className="text-[10px] text-slate-400 text-center mt-3">
              Menampilkan 4 dari {suppliers.length} supplier terdaftar.
            </p>
          )}
        </div>

        {/* Activity Logs */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Log Aktivitas Terbaru</h3>
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex gap-2.5 text-xs">
                  <div className="mt-0.5 min-w-[6px] h-8 flex flex-col items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs"></span>
                    <span className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 mt-1"></span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{log.action}</p>
                    <p className="text-[10px] text-slate-400">{log.details}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(log.timestamp).toLocaleTimeString("id-ID", {hour: '2-digit', minute: '2-digit'})} - {log.user.split(" (")[0]}
                    </p>
                  </div>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <p className="text-slate-400 text-center text-xs py-8">Belum ada aktivitas.</p>
              )}
            </div>
          </div>
          
          <div className="text-[10px] text-slate-400 text-center border-t border-slate-200 dark:border-slate-800 pt-2.5 mt-3">
            Sistem Sinkronisasi Lokal Aktif
          </div>
        </div>
      </div>

      {/* QUICK SUPPLIER REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 dark:bg-slate-900 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-[#0284c7]" />
                Registrasi Supplier Baru
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleRegisterSupplier} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Nama Perusahaan / Supplier *</label>
                  <input 
                    type="text" 
                    required
                    value={newSupNama}
                    onChange={(e) => setNewSupNama(e.target.value)}
                    placeholder="PT / CV Nama Perusahaan"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Kategori Bisnis *</label>
                  <select
                    value={newSupKategori}
                    onChange={(e) => setNewSupKategori(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                  >
                    <option value="Penyedia Bahan Bakar Batubara">Penyedia Bahan Bakar Batubara</option>
                    <option value="Suku Cadang & Pemeliharaan Turbin">Suku Cadang & Pemeliharaan Turbin</option>
                    <option value="Jasa Pemeliharaan Pompa & Katup">Jasa Pemeliharaan Pompa & Katup</option>
                    <option value="Alat Pelindung Diri & Peralatan K3L">Alat Pelindung Diri & Peralatan K3L</option>
                    <option value="Konsultan Manajemen Energi">Konsultan Manajemen Energi</option>
                    <option value="Sistem IT, Security & Komunikasi">Sistem IT, Security & Komunikasi</option>
                    <option value="Penyedia Kabel & Instrumen Kelistrikan">Penyedia Kabel & Instrumen Kelistrikan</option>
                    <option value="Jasa Sipil & Infrastruktur Pembangkit">Jasa Sipil & Infrastruktur Pembangkit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Narahubung / Kontak Person *</label>
                  <input 
                    type="text" 
                    required
                    value={newSupKontak}
                    onChange={(e) => setNewSupKontak(e.target.value)}
                    placeholder="Nama Narahubung"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Perusahaan *</label>
                  <input 
                    type="email" 
                    required
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">No. Telepon / HP *</label>
                  <input 
                    type="text" 
                    required
                    value={newSupTelepon}
                    onChange={(e) => setNewSupTelepon(e.target.value)}
                    placeholder="+62 8..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Alamat Lengkap Perusahaan</label>
                  <textarea 
                    value={newSupAlamat}
                    onChange={(e) => setNewSupAlamat(e.target.value)}
                    placeholder="Alamat Kantor Pusat / Operasional"
                    rows={2}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors border border-slate-200 dark:border-slate-800"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0284c7] hover:bg-sky-700 rounded cursor-pointer shadow-xs transition-colors"
                >
                  Simpan Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
