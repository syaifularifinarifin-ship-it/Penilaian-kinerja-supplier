/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useSuppliers } from "../context/SupplierContext";
import Logo from "./Logo";
import { 
  getPredikatAndColor, 
  ASPECT_LABELS, 
  ASPECT_EVALUATORS,
  ASPECT_WEIGHTS, 
  ASPECT_DESCRIPTIONS, 
  AspectKey,
  Evaluation,
  AspectScores,
  calculateFinalScore
} from "../types";
import { 
  FileText, 
  Printer, 
  Building2, 
  User, 
  Calendar, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileSignature,
  Paperclip,
  Download
} from "lucide-react";

export default function RaportView() {
  const {
    suppliers,
    evaluations,
    selectedYear,
    setSelectedYear,
    selectedPeriode,
    setSelectedPeriode,
    selectedSupplierIdForRaport,
    setSelectedSupplierIdForRaport,
    setActiveTab,
    units,
    currentUser
  } = useSuppliers();

  // Unit restriction logic
  const isUnitRestricted = !!(currentUser && currentUser.role !== "Administrator" && currentUser.unitId);
  const userAssignedUnitId = isUnitRestricted ? currentUser.unitId : null;
  const userAssignedUnitObj = userAssignedUnitId ? units.find(u => u.id === userAssignedUnitId) : null;

  // Find currently selected supplier profile
  const currentSupplier = suppliers.find(s => s.id === selectedSupplierIdForRaport) || suppliers[0];

  // Get all evaluations matching the selected supplier, year, period, and unit access restriction
  const periodEvals = evaluations.filter(e => 
    e.supplierId === (currentSupplier?.id || "") && 
    e.tahun === selectedYear &&
    (selectedPeriode === "Semua" ? true : e.periode === selectedPeriode) &&
    (isUnitRestricted ? e.unitId === userAssignedUnitId : true)
  );

  const totalPoCount = periodEvals.length;

  let activeEval: Evaluation | null = null;

  if (periodEvals.length > 0) {
    if (periodEvals.length === 1) {
      activeEval = periodEvals[0];
    } else {
      // Calculate mathematical average score for each aspect across multiple evaluations/POs
      const avgScores: AspectScores = {
        integritas: 0,
        kerjasama: 0,
        mutu: 0,
        waktu: 0,
        harga: 0,
        k3l: 0,
        keamanan: 0,
        energi: 0,
      };

      periodEvals.forEach(e => {
        Object.keys(avgScores).forEach(key => {
          const k = key as AspectKey;
          avgScores[k] += e.scores[k] || 0;
        });
      });

      Object.keys(avgScores).forEach(key => {
        const k = key as AspectKey;
        avgScores[k] = Math.round((avgScores[k] / periodEvals.length) * 100) / 100;
      });

      const avgNilaiAkhir = calculateFinalScore(avgScores);
      const { predikat } = getPredikatAndColor(avgNilaiAkhir);

      const uniqueUnits = Array.from(new Set(periodEvals.map(e => e.unitNama).filter(Boolean)));
      const uniqueUnitKodes = Array.from(new Set(periodEvals.map(e => e.unitKode).filter(Boolean)));

      activeEval = {
        id: `avg-${currentSupplier?.id || "sup"}-${selectedYear}-${selectedPeriode}`,
        supplierId: currentSupplier?.id || "",
        supplierNama: currentSupplier?.nama || "",
        tahun: selectedYear,
        periode: selectedPeriode === "Semua" 
          ? `Rata-rata Semua Periode (${periodEvals.length} Evaluasi)`
          : `${selectedPeriode} (Rata-rata ${periodEvals.length} PO/Evaluasi)`,
        scores: avgScores,
        nilaiAkhir: avgNilaiAkhir,
        predikat: predikat as any,
        rekomendasi: periodEvals.map(e => `[${e.noPo || 'PO'}]: ${e.rekomendasi || "-"}`).join("\n"),
        evaluator: "Sistem (Konsolidasi Multi-PO)",
        tanggalPenilaian: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
        noPo: periodEvals.map(e => e.noPo).filter(Boolean).join(", ") || "-",
        deskripsiPo: `Konsolidasi nilai kinerja dari ${periodEvals.length} kontrak/PO di periode ${selectedPeriode} ${selectedYear}`,
        tanggalPo: "-",
        unitNama: uniqueUnits.join(", ") || undefined,
        unitKode: uniqueUnitKodes.join(", ") || undefined,
      };
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const handleCreateNewEval = () => {
    setActiveTab("input");
  };

  return (
    <div id="raport-view" className="space-y-6">
      
      {/* Selector & Actions Bar (No-Print Area) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 no-print">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0284c7]" />
            Raport Kinerja Supplier
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Pilih nama supplier dan periode audit untuk menyusun lembaran raport cetak penilaian kinerja resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Supplier Selector */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSupplierIdForRaport}
              onChange={(e) => setSelectedSupplierIdForRaport(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-200 font-bold focus:ring-0 outline-none w-full sm:w-48 text-xs"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none text-slate-700 dark:text-slate-200 font-bold focus:ring-0 outline-none text-xs"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-200 font-bold focus:ring-0 outline-none text-xs"
            >
              <option value="Semua">Rata-rata Semua Periode</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Tahunan">Tahunan</option>
            </select>
          </div>

          {activeEval && (
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 bg-[#0284c7] hover:bg-sky-700 text-white font-bold text-xs px-3 py-2 rounded cursor-pointer transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Cetak Raport
            </button>
          )}
        </div>
      </div>

      {/* Conditional Rendering: If active evaluation exists */}
      {!activeEval ? (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-4 no-print">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 border border-slate-200">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Raport Belum Ditemukan</h3>
            <p className="text-xs text-slate-500">
              Belum ada penilaian kinerja terdaftar untuk <span className="font-bold text-slate-800 dark:text-slate-200">{currentSupplier?.nama}</span> pada periode <span className="font-semibold text-sky-600">{selectedPeriode === "Semua" ? "Semua Periode (Rata-rata)" : selectedPeriode} Tahun {selectedYear}</span>.
            </p>
          </div>
          <button
            onClick={handleCreateNewEval}
            className="inline-flex items-center justify-center gap-1.5 bg-[#0284c7] hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded cursor-pointer transition-colors"
          >
            Input Penilaian Pertama Sekarang <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PRINTABLE FORMAL RAPORT PAGE (Cols 2) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 print-container relative overflow-hidden">
            
            {/* Watermark/Accent lines for formal feel */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-sky-400 via-sky-600 to-emerald-500"></div>
            
            {/* Raport Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
              <div className="space-y-3">
                <Logo variant="print" height={42} />
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                    Raport Kinerja Mitra Kerja
                  </h2>
                  <p className="text-[10px] font-mono text-slate-400">No. Dok: RPT/PEMBANGKIT/{activeEval.tahun}/{activeEval.id.split("-")[1]?.toUpperCase() || "RPT"}</p>
                </div>
              </div>
              <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Periode Penilaian</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{activeEval.periode}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Tahun Buku {activeEval.tahun}</p>
                {activeEval.unitNama && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                    <span className="inline-block text-[9px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-150/40 dark:border-indigo-900/40 uppercase tracking-wider">
                      {activeEval.unitNama} ({activeEval.unitKode})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Section */}
            <div className="bg-slate-50/60 dark:bg-slate-950/40 p-4 rounded border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Profil Mitra Penyedia</h4>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {currentSupplier?.nama}
                  </p>
                  {currentSupplier?.noVendorEllipse && (
                    <p className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-400">
                      No. Vendor Ellipse: {currentSupplier.noVendorEllipse}
                    </p>
                  )}
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">{currentSupplier?.kategoriBisnis}</p>
                  <p className="text-slate-500 flex items-center gap-1.5 mt-1 text-[11px]">
                    <MapPin className="w-3.5 h-3.5" />
                    {currentSupplier?.alamat}
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Kontak & Validasi</h4>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-1 text-[11px]">PIC: {currentSupplier?.kontak}</p>
                  <div className="flex gap-4 mt-1 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {currentSupplier?.email}</span>
                  </div>
                  <div className="flex gap-4 mt-0.5 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {currentSupplier?.telepon}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PO Information Section */}
            {(activeEval.noPo || activeEval.deskripsiPo || activeEval.tanggalPo || totalPoCount > 0) && (
              <div className="bg-sky-50/30 dark:bg-sky-950/20 p-3.5 rounded border border-sky-100 dark:border-sky-900/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[8px]">Total PO (Periode Ini)</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 rounded-sm font-black font-mono border border-sky-200 dark:border-sky-900/40">
                      {totalPoCount}
                    </span>
                    <span>PO Terdaftar</span>
                  </p>
                </div>
                {activeEval.noPo && (
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[8px]">Nomor Purchase Order (PO)</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] font-mono break-words">{activeEval.noPo}</p>
                  </div>
                )}
                {activeEval.tanggalPo && (
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[8px]">Tanggal Purchase Order</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] font-mono">{activeEval.tanggalPo}</p>
                  </div>
                )}
                {activeEval.deskripsiPo && (
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[8px]">Deskripsi Pekerjaan PO</p>
                    <p className="font-medium text-slate-700 dark:text-slate-300 text-[11px] line-clamp-2" title={activeEval.deskripsiPo}>{activeEval.deskripsiPo}</p>
                  </div>
                )}
              </div>
            )}

            {/* Lampiran Dokumen PDF */}
            {activeEval.lampiranPdf && (
              <div className="bg-rose-50/70 dark:bg-rose-950/40 p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 dark:text-white text-[11px] truncate">
                      {activeEval.lampiranNama || "Dokumen_Lampiran_Evaluasi.pdf"}
                    </p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Dokumen Bukti Lampiran PDF Terlampir</p>
                  </div>
                </div>
                <a
                  href={activeEval.lampiranPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Buka / Unduh PDF
                </a>
              </div>
            )}

            {/* Aspects Evaluation Table */}
            <div className="space-y-3">
              <h3 className="font-bold text-[10px] text-slate-700 dark:text-white uppercase tracking-wider">
                Rincian Evaluasi 8 Kriteria Aspek
              </h3>
              
              <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden text-xs">
                <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-950 p-3 font-bold border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[9px] uppercase tracking-wider">
                  <div className="col-span-5 sm:col-span-6">Aspek Penilaian</div>
                  <div className="col-span-2 text-center">Skor (1-5)</div>
                  <div className="col-span-2 text-center">Bobot</div>
                  <div className="col-span-3 sm:col-span-2 text-right text-[#0284c7]">Nilai Kontribusi</div>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {(Object.keys(activeEval.scores) as AspectKey[]).map((key) => {
                    const label = ASPECT_LABELS[key];
                    const weight = ASPECT_WEIGHTS[key];
                    const score = activeEval.scores[key] || 0;
                    const contrib = Math.round((score * weight) * 100) / 100;
                    
                    return (
                      <div key={key} className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                        <div className="col-span-5 sm:col-span-6 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-800 dark:text-white text-xs">{label}</span>
                            <span className="text-[8px] font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-450 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">
                              Evaluator: {ASPECT_EVALUATORS[key]}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{ASPECT_DESCRIPTIONS[key].replace(/\n/g, "; ")}</p>
                        </div>
                        <div className="col-span-2 text-center font-bold text-slate-800 dark:text-slate-100">{score}</div>
                        <div className="col-span-2 text-center text-slate-500 font-bold">{weight * 100}%</div>
                        <div className="col-span-3 sm:col-span-2 text-right font-black text-slate-800 dark:text-white">{contrib}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summary Comments & Recommendations */}
            <div className="space-y-3">
              <h3 className="font-bold text-[10px] text-slate-700 dark:text-white uppercase tracking-wider">
                Rekomendasi Manajerial & Tindak Lanjut
              </h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap leading-relaxed shadow-xs">
                &ldquo;{activeEval.rekomendasi}&rdquo;
              </div>
            </div>

            {/* Print Signature Section */}
            <div className="grid grid-cols-2 pt-6 border-t border-slate-200 dark:border-slate-800 gap-8 text-xs">
              <div className="space-y-12">
                <p className="text-slate-500">Pihak Pertama,<br /><span className="font-bold text-slate-800 dark:text-white">PT PEMBANGKITAN JAWA BALI</span></p>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 dark:text-white underline">{activeEval.evaluator.split(" (")[0]}</p>
                  <p className="text-[10px] text-slate-400">Evaluator / Penilai Mutu</p>
                  <p className="text-[9px] text-slate-400 font-mono">ID Penilai: {activeEval.evaluator.split("(")[1]?.replace(")", "") || "MANAJER_LOGISTIK"}</p>
                </div>
              </div>

              <div className="space-y-12 text-right">
                <p className="text-slate-500">Pihak Kedua,<br /><span className="font-bold text-slate-800 dark:text-white">{currentSupplier?.nama}</span></p>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 dark:text-white underline">{currentSupplier?.kontak}</p>
                  <p className="text-[10px] text-slate-400">Pimpinan / Perwakilan Mitra</p>
                  <p className="text-[9px] text-slate-400">Tanggal Pengesahan: {activeEval.tanggalPenilaian}</p>
                </div>
              </div>
            </div>

          </div>

          {/* SIDEBAR: RAPORT PERFORMANCE VISUAL SUMMARY (Col 1) */}
          <div className="space-y-6 no-print">
            
            {/* Visual KPI Performance */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rangkuman Kinerja</p>
              
              <div className="mx-auto w-20 h-20 rounded-full border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 shadow-inner">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{activeEval.nilaiAkhir}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Skor Akhir</span>
              </div>

              {/* Predikat & Total PO Info */}
              {(() => {
                const { predikat, color, bgColor, borderColor } = getPredikatAndColor(activeEval.nilaiAkhir);
                return (
                  <div className="space-y-2">
                    <span className={`inline-block px-2.5 py-0.5 font-bold rounded text-[10px] border ${bgColor} ${color} ${borderColor} uppercase tracking-wider`}>
                      {predikat}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Evaluasi resmi disahkan pada <span className="font-bold">{activeEval.tanggalPenilaian}</span> oleh {activeEval.evaluator.split(" (")[0]}
                    </p>
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-[11px] text-slate-500">
                      <span className="font-medium">Total PO Terintegrasi:</span>
                      <span className="font-black text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono border border-slate-200/40 dark:border-slate-700/40">{totalPoCount} PO</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Radar-like Bar Summary of Aspects */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Indikator Kunci Kinerja
              </h3>

              <div className="space-y-3">
                {(Object.keys(activeEval.scores) as AspectKey[]).map((key) => {
                  const label = ASPECT_LABELS[key];
                  const val = activeEval.scores[key] || 0;
                  
                  let barColor = "bg-[#0284c7] dark:bg-sky-450";
                  if (val < 3.5) barColor = "bg-rose-500 dark:bg-rose-400";
                  else if (val >= 4.25) barColor = "bg-emerald-500 dark:bg-emerald-400";
                  
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-600 dark:text-slate-400 truncate max-w-[160px]">{label}</span>
                        <span className="font-black text-slate-800 dark:text-white font-mono">{val}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                        <div 
                          className={`h-full rounded ${barColor}`} 
                          style={{ width: `${(val / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Print Guidelines Box */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
              <h4 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-slate-400" />
                Petunjuk Cetak Fisik
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Gunakan kertas ukuran A4 (Standard laporan).</li>
                <li>Aktifkan opsi "Cetak Latar Belakang Grafis" pada setelan browser Anda agar warna meter bar dan badge tercetak sempurna.</li>
                <li>Halaman cetak hanya mengisolasi Raport utama (Sidebar dan tombol aksi otomatis disembunyikan).</li>
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
