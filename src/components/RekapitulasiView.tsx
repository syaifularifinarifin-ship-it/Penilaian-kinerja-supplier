/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useSuppliers } from "../context/SupplierContext";
import Logo from "./Logo";
import { Evaluation, getPredikatAndColor, ASPECT_LABELS, ASPECT_WEIGHTS, ASPECT_DESCRIPTIONS, AspectKey } from "../types";
import { 
  Search, 
  Trash2, 
  Edit3, 
  FileText, 
  ArrowUpDown, 
  Download, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  HelpCircle,
  Briefcase,
  Printer,
  ArrowLeft,
  Building2
} from "lucide-react";

export default function RekapitulasiView() {
  const {
    evaluations,
    deleteEvaluation,
    setEditingEvaluation,
    setActiveTab,
    setSelectedSupplierIdForRaport,
    selectedYear,
    setSelectedYear,
    selectedPeriode,
    setSelectedPeriode,
    hasPermission
  } = useSuppliers();

  // Search and advanced filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [predikatFilter, setPredikatFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState<"nama" | "nilaiAkhir" | "tahun">("nilaiAkhir");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Deletion confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmNama, setDeleteConfirmNama] = useState("");

  // Report printing state
  const [selectedEvaluationForPrint, setSelectedEvaluationForPrint] = useState<Evaluation | null>(null);

  // Filtering Evaluations
  const filteredEvals = evaluations.filter((item) => {
    // Search filter
    const matchSearch = item.supplierNama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.evaluator.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Year filter
    const matchYear = item.tahun === selectedYear;

    // Period filter
    const matchPeriod = selectedPeriode === "Semua" ? true : item.periode === selectedPeriode;

    // Predikat filter
    const matchPredikat = predikatFilter === "Semua" ? true : item.predikat === predikatFilter;

    return matchSearch && matchYear && matchPeriod && matchPredikat;
  });

  // Sorting
  const sortedEvals = [...filteredEvals].sort((a, b) => {
    let multiplier = sortOrder === "desc" ? 1 : -1;
    if (sortBy === "nama") {
      return multiplier * b.supplierNama.localeCompare(a.supplierNama);
    } else if (sortBy === "nilaiAkhir") {
      return multiplier * (b.nilaiAkhir - a.nilaiAkhir);
    } else {
      return multiplier * (b.tahun - a.tahun);
    }
  });

  // Pagination calculations
  const totalItems = sortedEvals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvals = sortedEvals.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleSort = (field: "nama" | "nilaiAkhir" | "tahun") => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Triggering edit state
  const handleEditTrigger = (item: Evaluation) => {
    setEditingEvaluation(item);
    setActiveTab("input");
  };

  // Redirect to raport
  const handleViewRaport = (supId: string) => {
    setSelectedSupplierIdForRaport(supId);
    setActiveTab("raport");
  };

  // Safe delete flow
  const handleDeleteClick = (id: string, nama: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmNama(nama);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteEvaluation(deleteConfirmId);
      setDeleteConfirmId(null);
      setDeleteConfirmNama("");
      // Adjust page if empty after delete
      if (paginatedEvals.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    }
  };

  // Simulate export to CSV/Excel alert message
  const [exportNotification, setExportNotification] = useState(false);
  const handleExportData = () => {
    setExportNotification(true);
    setTimeout(() => {
      setExportNotification(false);
    }, 4000);
  };

  if (selectedEvaluationForPrint) {
    const item = selectedEvaluationForPrint;
    const { predikat, color, bgColor, borderColor } = getPredikatAndColor(item.nilaiAkhir);

    return (
      <div id="print-evaluation-report-container" className="space-y-6">
        {/* Top Sticky Bar - No Print */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-center no-print animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedEvaluationForPrint(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-350 dark:hover:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Rekapitulasi
            </button>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-white">Formulir Laporan Penilaian Kinerja</h2>
              <p className="text-[10px] text-slate-400 font-medium">Laporan resmi penilai mutu supplier PT PLN Nusantara Power Services.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-all animate-pulse"
            >
              <Printer className="w-4 h-4" /> Cetak Laporan (PDF)
            </button>
          </div>
        </div>

        {/* Formal Paper Printable Container */}
        <div className="bg-white text-slate-900 dark:bg-white dark:text-slate-900 rounded-lg border border-slate-250 p-8 sm:p-12 shadow-md max-w-4xl mx-auto space-y-6 print-container relative overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Top colored aesthetic bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-sky-400 via-sky-600 to-emerald-500"></div>

          {/* SIPEKS / PLN Kop Surat */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-300 pb-5 gap-4">
            <div className="space-y-3">
              <Logo variant="print" height={42} />
              <div className="space-y-1">
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900 mt-1">
                  Laporan Evaluasi Kinerja Supplier
                </h1>
                <p className="text-[10px] font-mono text-slate-500">No. Dok: EVL/FORM/{item.tahun}/{item.supplierNama.slice(0,3).toUpperCase() || "MITRA"}</p>
              </div>
            </div>
            
            <div className="text-left sm:text-right bg-slate-50 p-4 rounded-lg border border-slate-200 min-w-[200px]">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Periode Penilaian</p>
              <p className="text-xs font-extrabold text-slate-800 mt-0.5">{item.periode}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Tahun Buku {item.tahun}</p>
              {item.unitNama && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="inline-block text-[9px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                    {item.unitNama} ({item.unitKode || "-"})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Identity & Profile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs bg-slate-50/75 p-5 rounded-lg border border-slate-200">
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-500 uppercase tracking-wider text-[9px] border-b border-slate-200 pb-1">
                Profil Mitra Penyedia
              </h3>
              <div className="space-y-1.5 text-slate-800">
                <p className="text-xs font-bold flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  {item.supplierNama}
                </p>
                <p className="text-slate-600 pl-5 text-[11px] leading-relaxed">
                  Evaluasi kinerja formal kerja sama operasional penyedia barang/jasa pembangkitan listrik secara terstruktur.
                </p>
              </div>
            </div>

            <div className="space-y-3 md:border-l border-slate-200 md:pl-6">
              <h3 className="font-extrabold text-slate-500 uppercase tracking-wider text-[9px] border-b border-slate-200 pb-1">
                Keterangan Penilaian
              </h3>
              <div className="space-y-1.5 text-slate-800 text-[11px]">
                <p><span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] inline-block w-24">Evaluator:</span> <span className="font-semibold text-slate-800">{item.evaluator}</span></p>
                <p><span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] inline-block w-24">Tanggal Input:</span> <span className="font-mono font-semibold text-slate-800">{item.tanggalPenilaian}</span></p>
                <p><span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] inline-block w-24">Sistem Ref:</span> <span className="font-mono text-slate-500">{item.id.slice(0, 8).toUpperCase()}</span></p>
              </div>
            </div>
          </div>

          {/* PO Information (If Filled) */}
          {(item.noPo || item.deskripsiPo || item.tanggalPo) && (
            <div className="bg-sky-50/50 p-4 rounded-lg border border-sky-150 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {item.noPo && (
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[8px]">Nomor Purchase Order (PO)</p>
                  <p className="font-bold text-slate-800 text-[11px] font-mono">{item.noPo}</p>
                </div>
              )}
              {item.tanggalPo && (
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[8px]">Tanggal Purchase Order</p>
                  <p className="font-bold text-slate-800 text-[11px] font-mono">{item.tanggalPo}</p>
                </div>
              )}
              {item.deskripsiPo && (
                <div className="space-y-0.5 md:col-span-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[8px]">Deskripsi Pekerjaan PO</p>
                  <p className="font-medium text-slate-700 text-[11px] truncate" title={item.deskripsiPo}>{item.deskripsiPo}</p>
                </div>
              )}
            </div>
          )}

          {/* Kriteria Table */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[10px] text-slate-700 uppercase tracking-wider">
              Daftar Penilaian Berdasarkan 8 Kriteria Aspek
            </h3>

            <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-slate-50 p-3 font-bold border-b border-slate-300 text-slate-500 text-[9px] uppercase tracking-wider">
                <div className="col-span-5 sm:col-span-6">Aspek Penilaian</div>
                <div className="col-span-2 text-center">Skor (1.0 - 5.0)</div>
                <div className="col-span-2 text-center">Bobot</div>
                <div className="col-span-3 sm:col-span-2 text-right text-sky-700 font-bold">Nilai Kontribusi</div>
              </div>

              <div className="divide-y divide-slate-200">
                {(Object.keys(item.scores) as AspectKey[]).map((key) => {
                  const label = ASPECT_LABELS[key];
                  const weight = ASPECT_WEIGHTS[key];
                  const score = item.scores[key] || 0;
                  const contrib = Math.round((score * weight) * 100) / 100;

                  return (
                    <div key={key} className="grid grid-cols-12 p-3 items-center bg-white">
                      <div className="col-span-5 sm:col-span-6 pr-2">
                        <p className="font-bold text-slate-800 text-xs">{label}</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{ASPECT_DESCRIPTIONS[key].replace(/\n/g, "; ")}</p>
                      </div>
                      <div className="col-span-2 text-center font-bold text-slate-850 font-mono">{score.toFixed(1)}</div>
                      <div className="col-span-2 text-center text-slate-500 font-bold">{weight * 100}%</div>
                      <div className="col-span-3 sm:col-span-2 text-right font-black text-slate-900 font-mono">{contrib.toFixed(2)}</div>
                    </div>
                  );
                })}

                {/* Total Summary Row */}
                <div className="grid grid-cols-12 p-4 items-center bg-slate-50/80 font-bold border-t border-slate-300 text-slate-900">
                  <div className="col-span-5 sm:col-span-6 text-sm font-extrabold uppercase text-slate-700">
                    Akumulasi Nilai Akhir (Tertimbang)
                  </div>
                  <div className="col-span-2 text-center"></div>
                  <div className="col-span-2 text-center font-black text-slate-500">100%</div>
                  <div className="col-span-3 sm:col-span-2 text-right text-lg font-black text-[#0284c7] font-mono">
                    {item.nilaiAkhir.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Peringkat Kelayakan Badge in Document */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-300 rounded-lg gap-4">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Peringkat & Kategori Kelayakan</p>
              <h4 className={`text-base font-black uppercase mt-1 ${color}`}>
                {predikat}
              </h4>
            </div>
            <div className="text-[10px] text-slate-500 max-w-md leading-relaxed italic">
              Predikat ini merupakan klasifikasi penilaian kelayakan kerja mitra yang sah sesuai regulasi internal PLN NPS.
            </div>
          </div>

          {/* Recommendations Box */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[10px] text-slate-700 uppercase tracking-wider">
              Rekomendasi Manajerial & Catatan Tindak Lanjut
            </h3>
            <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-300 text-xs text-slate-700 italic leading-relaxed shadow-xs min-h-[60px]">
              {item.rekomendasi.trim() ? `“${item.rekomendasi}”` : `“Kinerja dinilai ${predikat} dengan rata-rata tertimbang ${item.nilaiAkhir.toFixed(2)}.”`}
            </div>
          </div>

          {/* Signatures Row */}
          <div className="grid grid-cols-2 pt-10 border-t border-slate-200 gap-12 text-xs">
            <div className="space-y-16">
              <p className="text-slate-500 font-medium">Pihak Pertama,<br /><span className="font-bold text-slate-900">PT PLN NUSANTARA POWER SERVICES</span></p>
              <div className="space-y-1">
                <p className="font-bold text-slate-950 underline">{item.evaluator.split(" (")[0]}</p>
                <p className="text-[10px] text-slate-500">Evaluator / Penilai Mutu</p>
              </div>
            </div>

            <div className="space-y-16 text-right">
              <p className="text-slate-500 font-medium">Pihak Kedua,<br /><span className="font-bold text-slate-900">{item.supplierNama}</span></p>
              <div className="space-y-1">
                <p className="font-bold text-slate-950 underline">Perwakilan Mitra Penyedia</p>
                <p className="text-[10px] text-slate-500">Pimpinan / Perwakilan Mitra</p>
                <p className="text-[9px] text-slate-400 font-mono">Tanggal Pengesahan: {item.tanggalPenilaian}</p>
              </div>
            </div>
          </div>

          {/* Document Footer Note */}
          <div className="text-center pt-8 border-t border-slate-150 text-[9px] text-slate-400 uppercase tracking-wider font-medium font-mono">
            Dokumen Formulir Penilaian Kinerja ini diunduh secara resmi melalui aplikasi SIPEKS PLN NPS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="rekapitulasi-view" className="space-y-6">
      
      {/* Title block */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            Rekapitulasi Penilaian Kinerja
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Daftar lengkap hasil evaluasi seluruh supplier pembangkit listrik, pencarian terstruktur, dan pemfilteran predikat.
          </p>
        </div>
        
        {/* Export action */}
        <button 
          onClick={handleExportData}
          className="flex items-center justify-center gap-1.5 bg-[#0284c7] hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer transition-colors w-full md:w-auto"
        >
          <Download className="w-4 h-4" />
          Ekspor CSV / Excel
        </button>
      </div>

      {/* Export Alert Notification */}
      {exportNotification && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 rounded text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
            File Excel & Rekapitulasi Penilaian berhasil dikompilasi! Pengunduhan dimulai otomatis.
          </span>
          <button onClick={() => setExportNotification(false)} className="text-slate-400 font-bold hover:text-slate-600">×</button>
        </div>
      )}

      {/* Advanced Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row gap-4 items-center">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Cari nama supplier atau evaluator..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Filters Select Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-2/3">
          
          {/* Year select */}
          <div className="flex flex-col">
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(Number(e.target.value)); setCurrentPage(1); }}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white font-bold"
            >
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
              <option value="2024">Tahun 2024</option>
            </select>
          </div>

          {/* Period select */}
          <div className="flex flex-col">
            <select
              value={selectedPeriode}
              onChange={(e) => { setSelectedPeriode(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white font-bold"
            >
              <option value="Semua">Semua Periode</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Tahunan">Tahunan</option>
            </select>
          </div>

          {/* Predikat select */}
          <div className="flex flex-col">
            <select
              value={predikatFilter}
              onChange={(e) => { setPredikatFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white font-bold"
            >
              <option value="Semua">Semua Predikat</option>
              <option value="Sangat Baik">Sangat Baik</option>
              <option value="Baik">Baik</option>
              <option value="Cukup">Cukup</option>
              <option value="Kurang">Kurang</option>
              <option value="Sangat Kurang">Sangat Kurang</option>
            </select>
          </div>

          {/* Reset Filters Quick link */}
          <button
            onClick={() => {
              setSearchTerm("");
              setPredikatFilter("Semua");
              setSelectedYear(2026);
              setSelectedPeriode("Semester 1");
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-3 px-4">
                  <button 
                    onClick={() => toggleSort("nama")}
                    className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    Nama Supplier
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Periode</th>
                <th className="py-3 px-4">Integritas (15%)</th>
                <th className="py-3 px-4">Mutu (15%)</th>
                <th className="py-3 px-4">Waktu (15%)</th>
                <th className="py-3 px-4">K3L (20%)</th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => toggleSort("nilaiAkhir")}
                    className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer text-sky-600 dark:text-sky-400"
                  >
                    Nilai Akhir
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="py-3 px-4">Predikat</th>
                <th className="py-3 px-4 text-right">Aksi Operasional</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedEvals.map((item) => {
                const { predikat, color, bgColor, borderColor } = getPredikatAndColor(item.nilaiAkhir);
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-white text-xs">{item.supplierNama}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-300" /> Evaluator: {item.evaluator.split(" (")[0]}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.unitKode && (
                            <span className="inline-block text-[8.5px] px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded font-bold border border-indigo-100 dark:border-indigo-900/40">
                              Unit: {item.unitKode}
                            </span>
                          )}
                          {item.noPo && (
                            <span className="inline-block text-[8.5px] px-1.5 py-0.2 bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-sky-400 rounded font-bold border border-sky-100 dark:border-sky-900/40">
                              PO: {item.noPo}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.periode}</p>
                      <p className="text-[9px] text-slate-400 font-mono">Tahun {item.tahun}</p>
                    </td>
                    
                    {/* Aspects Preview */}
                    <td className="py-3 px-4 font-bold">{item.scores.integritas}</td>
                    <td className="py-3 px-4 font-bold">{item.scores.mutu}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={item.scores.waktu < 70 ? "text-rose-600 font-bold" : ""}>
                        {item.scores.waktu}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                        {item.scores.k3l}
                      </span>
                    </td>

                    {/* Final Weighted Score */}
                    <td className="py-3 px-4 font-black text-xs text-slate-800 dark:text-white">
                      {item.nilaiAkhir}
                    </td>

                    {/* Badge */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${bgColor} ${color} ${borderColor} uppercase tracking-wider`}>
                        {predikat}
                      </span>
                    </td>

                    {/* CRUD Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Detail Raport */}
                        <button 
                          onClick={() => handleViewRaport(item.supplierId)}
                          title="Lihat Raport Lengkap"
                          className="p-1.5 text-sky-600 hover:text-white hover:bg-[#0284c7] rounded border border-sky-150 dark:border-slate-800 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Cetak Formulir Input Penilaian */}
                        <button 
                          onClick={() => setSelectedEvaluationForPrint(item)}
                          title="Cetak Formulir Penilaian Kinerja"
                          className="p-1.5 text-emerald-600 hover:text-white hover:bg-emerald-600 rounded border border-emerald-150 dark:border-slate-800 transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Rating */}
                        {hasPermission("evaluations") && (
                          <button 
                            onClick={() => handleEditTrigger(item)}
                            title="Edit Penilaian"
                            className="p-1.5 text-amber-600 hover:text-white hover:bg-amber-600 rounded border border-amber-150 dark:border-slate-800 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Rating */}
                        {hasPermission("evaluations") && (
                          <button 
                            onClick={() => handleDeleteClick(item.id, item.supplierNama)}
                            title="Hapus Catatan"
                            className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded border border-rose-150 dark:border-slate-800 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {totalItems === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Tidak ada penilaian yang cocok dengan filter pencarian saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{startIndex + 1}</span> hingga{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(startIndex + itemsPerPage, totalItems)}</span> dari{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span> penilaian
            </span>
            <div className="flex gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                    currentPage === page 
                      ? "bg-[#0284c7] text-white" 
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 text-center space-y-4">
              <div className="mx-auto w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Konfirmasi Hapus Penilaian</h3>
                <p className="text-[11px] text-slate-500">
                  Apakah Anda yakin ingin menghapus data penilaian kinerja untuk <span className="font-bold text-slate-800 dark:text-slate-200">{deleteConfirmNama}</span>? 
                  Tindakan ini tidak dapat dibatalkan dan akan memperbarui log dashboard secara permanen.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 px-5 py-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => { setDeleteConfirmId(null); setDeleteConfirmNama(""); }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                Batalkan
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded cursor-pointer shadow-xs"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
