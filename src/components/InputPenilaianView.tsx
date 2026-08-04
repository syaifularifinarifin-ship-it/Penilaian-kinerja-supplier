/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useSuppliers } from "../context/SupplierContext";
import Logo from "./Logo";
import { 
  AspectScores, 
  ASPECT_WEIGHTS, 
  ASPECT_LABELS, 
  ASPECT_EVALUATORS,
  ASPECT_DESCRIPTIONS, 
  AspectKey, 
  calculateFinalScore, 
  getPredikatAndColor 
} from "../types";
import { 
  ClipboardCheck, 
  Building2, 
  User, 
  Calendar, 
  Save, 
  X, 
  AlertCircle, 
  Info, 
  Plus, 
  Sparkles,
  Briefcase,
  FileText,
  Cpu,
  Printer,
  ArrowLeft,
  Check
} from "lucide-react";

export default function InputPenilaianView() {
  const {
    suppliers,
    addSupplier,
    addEvaluation,
    updateEvaluation,
    editingEvaluation,
    setEditingEvaluation,
    setActiveTab,
    selectedYear,
    selectedPeriode,
    units,
    hasPermission,
    currentUser
  } = useSuppliers();

  // User unit assignment check
  const userAssignedUnitId = currentUser?.unitId || null;
  const isUnitRestricted = !!(currentUser && currentUser.role !== "Administrator" && currentUser.unitId);
  const userAssignedUnitObj = userAssignedUnitId ? units.find(u => u.id === userAssignedUnitId) : null;

  // Selected Supplier
  const [supplierId, setSupplierId] = useState("");
  const [unitId, setUnitId] = useState(userAssignedUnitId || "");
  const [tahun, setTahun] = useState<number>(selectedYear);
  const [periode, setPeriode] = useState<string>(selectedPeriode === "Semua" ? "Semester 1" : selectedPeriode);
  
    // 8 Aspects scores state
  const [scores, setScores] = useState<AspectScores>({
    integritas: 4.0,
    kerjasama: 4.0,
    mutu: 4.0,
    waktu: 4.0,
    harga: 4.0,
    k3l: 4.0,
    keamanan: 4.0,
    energi: 4.0,
  });

  const [rekomendasi, setRekomendasi] = useState("");
  const [evaluator, setEvaluator] = useState(currentUser ? `${currentUser.nama} (${currentUser.role})` : "Syaiful Arifin (Manajer Logistik)");
  const [tanggalPenilaian, setTanggalPenilaian] = useState(new Date().toISOString().split("T")[0]);
  const [noPo, setNoPo] = useState("");
  const [deskripsiPo, setDeskripsiPo] = useState("");
  const [tanggalPo, setTanggalPo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isPrintBlankForm, setIsPrintBlankForm] = useState(false);

  // Quick Inline Supplier registration
  const [isInlineSupOpen, setIsInlineSupOpen] = useState(false);
  const [newSupNama, setNewSupNama] = useState("");
  const [newSupNoVendor, setNewSupNoVendor] = useState("");
  const [newSupKategori, setNewSupKategori] = useState("Penyedia Bahan Bakar Batubara");
  const [newSupKontak, setNewSupKontak] = useState("");

  // Load editing state if active
  useEffect(() => {
    if (editingEvaluation) {
      setSupplierId(editingEvaluation.supplierId);
      setUnitId(editingEvaluation.unitId || "");
      setTahun(editingEvaluation.tahun);
      setPeriode(editingEvaluation.periode);
      setScores({ ...editingEvaluation.scores });
      setRekomendasi(editingEvaluation.rekomendasi);
      setEvaluator(editingEvaluation.evaluator);
      setTanggalPenilaian(editingEvaluation.tanggalPenilaian || new Date().toISOString().split("T")[0]);
      setNoPo(editingEvaluation.noPo || "");
      setDeskripsiPo(editingEvaluation.deskripsiPo || "");
      setTanggalPo(editingEvaluation.tanggalPo || "");
    } else {
      // Default reset
      if (suppliers.length > 0 && !supplierId) {
        setSupplierId(suppliers[0].id);
      }
      if (userAssignedUnitId) {
        setUnitId(userAssignedUnitId);
      } else if (units.length > 0 && !unitId) {
        setUnitId(units[0].id);
      }
      setTanggalPenilaian(new Date().toISOString().split("T")[0]);
      setNoPo("");
      setDeskripsiPo("");
      setTanggalPo("");
      setEvaluator(currentUser ? `${currentUser.nama} (${currentUser.role})` : "Syaiful Arifin (Manajer Logistik)");
      setScores({
        integritas: 4.0,
        kerjasama: 4.0,
        mutu: 4.0,
        waktu: 4.0,
        harga: 4.0,
        k3l: 4.0,
        keamanan: 4.0,
        energi: 4.0,
      });
    }
  }, [editingEvaluation, suppliers, units, currentUser, userAssignedUnitId]);

  // Set first supplier as default when suppliers load
  useEffect(() => {
    if (suppliers.length > 0 && !supplierId && !editingEvaluation) {
      setSupplierId(suppliers[0].id);
    }
  }, [suppliers, supplierId, editingEvaluation]);

  // Set default unit automatically matching user assignment in user settings when units load or user changes
  useEffect(() => {
    if (editingEvaluation) return;

    if (userAssignedUnitId) {
      setUnitId(userAssignedUnitId);
    } else if (units.length > 0 && (!unitId || !units.some(u => u.id === unitId))) {
      setUnitId(units[0].id);
    }
  }, [units, userAssignedUnitId, editingEvaluation]);

  // Handle score change
  const handleScoreChange = (key: AspectKey, val: number) => {
    const safeVal = Math.max(1, Math.min(5, Math.round(val * 100) / 100));
    setScores(prev => ({
      ...prev,
      [key]: safeVal
    }));
  };

  // Real-time calculation
  const currentNilaiAkhir = calculateFinalScore(scores);
  const { predikat, color, bgColor, borderColor } = getPredikatAndColor(currentNilaiAkhir);

  // Quick Register inline supplier
  const handleQuickSupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupNama.trim() || !newSupKontak.trim()) return;
    const created = addSupplier({
      nama: newSupNama,
      noVendorEllipse: newSupNoVendor.trim(),
      kategoriBisnis: newSupKategori,
      alamat: "Alat Kelengkapan Lapangan Pembangkit",
      kontak: newSupKontak,
      email: `${newSupNama.toLowerCase().replace(/[^a-z0-9]/g, "")}@pembangkit-mitra.id`,
      telepon: "+62 812-3456-7890"
    });
    setSupplierId(created.id);
    setNewSupNama("");
    setNewSupNoVendor("");
    setNewSupKontak("");
    setIsInlineSupOpen(false);
  };

  // Main Form Submit
  const handleSubmitPenilaian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      setErrorMsg("Harap pilih supplier terlebih dahulu.");
      return;
    }

    const selectedSup = suppliers.find(s => s.id === supplierId);
    if (!selectedSup) {
      setErrorMsg("Supplier tidak ditemukan.");
      return;
    }

    const activeUnitId = isUnitRestricted && userAssignedUnitId ? userAssignedUnitId : unitId;
    const selectedUnit = units.find(u => u.id === activeUnitId);

    const evaluationPayload = {
      supplierId,
      supplierNama: selectedSup.nama,
      unitId: selectedUnit?.id,
      unitKode: selectedUnit?.kode,
      unitNama: selectedUnit?.nama,
      tahun,
      periode,
      scores,
      rekomendasi: rekomendasi.trim() || `Kinerja dinilai ${predikat} dengan rata-rata tertimbang ${currentNilaiAkhir}.`,
      evaluator: evaluator.trim() || "Syaiful Arifin",
      tanggalPenilaian,
      noPo: noPo.trim(),
      deskripsiPo: deskripsiPo.trim(),
      tanggalPo: tanggalPo || undefined
    };

    if (editingEvaluation) {
      // Edit
      updateEvaluation({
        ...editingEvaluation,
        ...evaluationPayload,
        nilaiAkhir: currentNilaiAkhir,
        predikat
      });
      setEditingEvaluation(null);
    } else {
      // Add
      addEvaluation(evaluationPayload);
    }

    // Reset Form and Redirect
    setErrorMsg("");
    setRekomendasi("");
    setNoPo("");
    setDeskripsiPo("");
    setTanggalPo("");
    setUnitId(units.length > 0 ? units[0].id : "");
    setActiveTab("rekap");
  };

  const handleCancelEdit = () => {
    setEditingEvaluation(null);
    setErrorMsg("");
    setRekomendasi("");
    setNoPo("");
    setDeskripsiPo("");
    setTanggalPo("");
    setUnitId(units.length > 0 ? units[0].id : "");
    setActiveTab("rekap");
  };

  if (!hasPermission("evaluations")) {
    return (
      <div id="input-penilaian-view" className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-slate-400" />
              Input Evaluasi Kinerja Supplier
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Masukkan skor indikator kinerja supplier berdasarkan kriteria aspek dengan bobot tetap pembangkit.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-900">
            <ClipboardCheck className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Akses Terbatas: Mode Lihat Saja</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Akun Anda dengan peran <strong className="font-semibold text-slate-700 dark:text-slate-300">{currentUser?.role || "Staff"}</strong> tidak memiliki otorisasi untuk menginput atau mengedit data evaluasi kinerja supplier.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab("rekap")}
              className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900 rounded cursor-pointer transition-colors"
            >
              Lihat Rekapitulasi Evaluasi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Find selected supplier for preview
  const selectedSup = isPrintBlankForm ? (suppliers.find(s => s.id === supplierId) || null) : suppliers.find(s => s.id === supplierId);
  // Find selected unit for preview
  const selectedUnit = isPrintBlankForm ? (units.find(u => u.id === unitId) || null) : units.find(u => u.id === unitId);

  if (showPrintPreview) {
    return (
      <div id="print-preview-container" className="space-y-6">
        {/* Top Sticky Bar - No Print */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-center no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowPrintPreview(false);
                setIsPrintBlankForm(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-350 dark:hover:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali Edit
            </button>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-white">
                {isPrintBlankForm ? "Pratinjau Formulir Kosong" : "Mode Pratinjau Dokumen"}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {isPrintBlankForm 
                  ? "Formulir ini dicetak tanpa nilai untuk pengisian penilaian secara manual/fisik." 
                  : "Gunakan tombol cetak untuk menyimpan sebagai PDF atau mencetak fisik."}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" /> Cetak Sekarang (Print)
            </button>
          </div>
        </div>

        {/* Formal Paper Printable Container */}
        <div className="bg-white text-slate-900 dark:bg-white dark:text-slate-900 rounded-lg border border-slate-250 p-8 sm:p-12 shadow-md max-w-4xl mx-auto space-y-6 print-container relative overflow-hidden">
          {/* Top colored aesthetic bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-sky-400 via-sky-600 to-emerald-500"></div>

          {/* SIPEKS / PLN Kop Surat */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-300 pb-5 gap-4">
            <div className="space-y-3">
              <Logo variant="print" height={42} />
              <div className="space-y-1">
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900 mt-1">
                  Formulir Evaluasi Kinerja Supplier {isPrintBlankForm && "(Kosongan)"}
                </h1>
                <p className="text-[10px] font-mono text-slate-500">
                  No. Dok: EVL/FORM/{tahun}/{selectedSup?.nama ? selectedSup.nama.slice(0,3).toUpperCase() : "MITRA"}
                </p>
              </div>
            </div>
            
            <div className="text-left sm:text-right bg-slate-50 p-4 rounded-lg border border-slate-200 min-w-[200px]">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Periode Penilaian</p>
              <p className="text-xs font-extrabold text-slate-800 mt-0.5">{isPrintBlankForm && !supplierId ? "............................" : periode}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Tahun Buku {isPrintBlankForm && !supplierId ? "............" : tahun}</p>
              {selectedUnit ? (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="inline-block text-[9px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                    {selectedUnit.nama} ({selectedUnit.kode})
                  </span>
                </div>
              ) : isPrintBlankForm ? (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="inline-block text-[9px] font-semibold text-slate-400">
                    Unit: .......................................
                  </span>
                </div>
              ) : null}
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
                  {selectedSup?.nama || "Nama Mitra: .............................................................."}
                </p>
                <p className="text-slate-500 font-medium pl-5 text-[11px]">
                  {selectedSup?.kategoriBisnis || "Kategori/Bidang: ...................................................."}
                </p>
                <p className="text-slate-600 pl-5 text-[11px] flex items-start gap-1 leading-relaxed">
                  <span className="font-semibold text-slate-400">Alamat:</span> {selectedSup?.alamat || "......................................................................................"}
                </p>
              </div>
            </div>

            <div className="space-y-3 md:border-l border-slate-200 md:pl-6">
              <h3 className="font-extrabold text-slate-500 uppercase tracking-wider text-[9px] border-b border-slate-200 pb-1">
                Keterangan Penilaian
              </h3>
              <div className="space-y-1.5 text-slate-800 text-[11px]">
                <p><span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] inline-block w-24">Evaluator:</span> <span className="font-semibold text-slate-800">{isPrintBlankForm && !supplierId ? "........................................................" : evaluator}</span></p>
                <p><span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] inline-block w-24">Tanggal Input:</span> <span className="font-mono font-semibold text-slate-800">{isPrintBlankForm && !supplierId ? "................................" : tanggalPenilaian}</span></p>
                <p><span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] inline-block w-24">Kontak PIC:</span> <span className="font-semibold text-slate-800">{selectedSup?.kontak ? `${selectedSup.kontak} (${selectedSup.telepon || "-"})` : "................................ / ............................."}</span></p>
              </div>
            </div>
          </div>

          {/* PO Information (If Filled or Blank Form mode) */}
          {(isPrintBlankForm || noPo || deskripsiPo || tanggalPo) && (
            <div className="bg-sky-50/50 p-4 rounded-lg border border-sky-150 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[8px]">Nomor Purchase Order (PO)</p>
                <p className="font-bold text-slate-800 text-[11px] font-mono">{isPrintBlankForm && !noPo ? "........................................" : (noPo || "-")}</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[8px]">Tanggal Purchase Order</p>
                <p className="font-bold text-slate-800 text-[11px] font-mono">{isPrintBlankForm && !tanggalPo ? "........................................" : (tanggalPo || "-")}</p>
              </div>
              <div className="space-y-0.5 md:col-span-1">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[8px]">Deskripsi Pekerjaan PO</p>
                <p className="font-medium text-slate-700 text-[11px] truncate" title={deskripsiPo}>
                  {isPrintBlankForm && !deskripsiPo ? "............................................................" : (deskripsiPo || "-")}
                </p>
              </div>
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
                {(Object.keys(scores) as AspectKey[]).map((key) => {
                  const label = ASPECT_LABELS[key];
                  const weight = ASPECT_WEIGHTS[key];
                  const score = isPrintBlankForm ? null : (scores[key] || 0);
                  const contrib = score !== null ? Math.round((score * weight) * 100) / 100 : null;

                  return (
                    <div key={key} className="grid grid-cols-12 p-3 items-center bg-white">
                      <div className="col-span-5 sm:col-span-6 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-xs">{label}</span>
                          <span className="text-[8px] font-extrabold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                            Evaluator: {ASPECT_EVALUATORS[key]}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{ASPECT_DESCRIPTIONS[key].replace(/\n/g, "; ")}</p>
                      </div>
                      <div className="col-span-2 text-center font-bold text-slate-850 font-mono">
                        {score !== null ? score.toFixed(1) : "........"}
                      </div>
                      <div className="col-span-2 text-center text-slate-500 font-bold">{weight * 100}%</div>
                      <div className="col-span-3 sm:col-span-2 text-right font-black text-slate-900 font-mono">
                        {contrib !== null ? contrib.toFixed(2) : "........"}
                      </div>
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
                    {isPrintBlankForm ? "........" : currentNilaiAkhir.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Peringkat Kelayakan Badge in Document */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-300 rounded-lg gap-4">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Peringkat & Kategori Kelayakan</p>
              {isPrintBlankForm ? (
                <div className="flex flex-wrap gap-4 mt-2 text-[10px] font-bold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs inline-block bg-white"></span>
                    <span>Sangat Baik (&ge; 4.25)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs inline-block bg-white"></span>
                    <span>Baik (3.5 - 4.24)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs inline-block bg-white"></span>
                    <span>Cukup (3.0 - 3.49)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs inline-block bg-white"></span>
                    <span>Kurang (&lt; 3.0)</span>
                  </div>
                </div>
              ) : (
                <h4 className={`text-base font-black uppercase mt-1 ${color}`}>
                  {predikat}
                </h4>
              )}
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
            <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-300 text-xs text-slate-700 italic leading-relaxed shadow-xs min-h-[80px]">
              {isPrintBlankForm ? (
                <div className="space-y-3 pt-1">
                  <p className="text-slate-300">Catatan: ..................................................................................................................................................................................................................</p>
                  <p className="text-slate-300">................................................................................................................................................................................................................................</p>
                </div>
              ) : (
                rekomendasi.trim() ? `“${rekomendasi}”` : `“Kinerja dinilai ${predikat} dengan rata-rata tertimbang ${currentNilaiAkhir.toFixed(2)}.”`
              )}
            </div>
          </div>

          {/* Signatures Row */}
          <div className="grid grid-cols-2 pt-10 border-t border-slate-200 gap-12 text-xs">
            <div className="space-y-16">
              <p className="text-slate-500 font-medium">Pihak Pertama,<br /><span className="font-bold text-slate-900">PT PLN NUSANTARA POWER SERVICES</span></p>
              <div className="space-y-1">
                <p className="font-bold text-slate-950 underline">{isPrintBlankForm && !supplierId ? "..........................................................." : evaluator.split(" (")[0]}</p>
                <p className="text-[10px] text-slate-500">Evaluator / Penilai Mutu</p>
                <p className="text-[9px] text-slate-400 font-mono">NID / NIP: {isPrintBlankForm && !supplierId ? "........................................" : (currentUser?.nid || "-")}</p>
              </div>
            </div>

            <div className="space-y-16 text-right">
              <p className="text-slate-500 font-medium">Pihak Kedua,<br /><span className="font-bold text-slate-900">{selectedSup?.nama || "Nama Supplier"}</span></p>
              <div className="space-y-1">
                <p className="font-bold text-slate-950 underline">{selectedSup?.kontak || "_________________________"}</p>
                <p className="text-[10px] text-slate-500">Pimpinan / Perwakilan Mitra</p>
                <p className="text-[9px] text-slate-400">Tanggal Pengesahan: {isPrintBlankForm && !supplierId ? "..............................." : tanggalPenilaian}</p>
              </div>
            </div>
          </div>

          {/* Document Footer Note */}
          <div className="text-center pt-8 border-t border-slate-150 text-[9px] text-slate-400 uppercase tracking-wider font-medium">
            Dokumen ini diunduh secara resmi melalui Sistem Informasi Penilaian Kinerja Supplier (SIPEKS)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="input-penilaian-view" className="space-y-6">
      
      {/* Header View */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#0284c7]" />
            {editingEvaluation ? "Edit Penilaian Supplier" : "Input Evaluasi Kinerja Supplier"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {editingEvaluation 
              ? `Memodifikasi formulir penilaian kinerja untuk ${editingEvaluation.supplierNama}` 
              : "Masukkan skor indikator kinerja supplier berdasarkan kriteria aspek dengan bobot tetap pembangkit."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            type="button"
            onClick={() => {
              setErrorMsg("");
              setIsPrintBlankForm(true);
              setShowPrintPreview(true);
            }}
            className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1.5 rounded border border-indigo-200 dark:border-indigo-900/40 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Cetak Formulir Kosong
          </button>
          <button 
            type="button"
            onClick={() => {
              if (!supplierId) {
                setErrorMsg("Harap pilih supplier terlebih dahulu untuk melihat pratinjau cetak.");
                return;
              }
              setErrorMsg("");
              setIsPrintBlankForm(false);
              setShowPrintPreview(true);
            }}
            className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1.5 rounded border border-emerald-250 dark:border-emerald-900/40 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Pratinjau & Cetak
          </button>
          {editingEvaluation && (
            <button 
              type="button"
              onClick={handleCancelEdit}
              className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1.5 rounded border border-rose-200 dark:border-rose-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Batal Edit
            </button>
          )}
        </div>
      </div>

      {isUnitRestricted && userAssignedUnitObj && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-lg flex items-center gap-2.5 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Hak Akses Terbatas Unit:</strong> Anda terdaftar khusus untuk <strong>[{userAssignedUnitObj.kode}] {userAssignedUnitObj.nama}</strong>. Lembaran evaluasi dan penilaian hanya akan tersimpan untuk unit penugasan Anda.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-250 dark:border-rose-900 text-rose-700 dark:text-rose-400 rounded flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid Layout of Form and Real-time Calculator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Core Inputs Form */}
        <form onSubmit={handleSubmitPenilaian} className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          
          {/* Section 1: Administrasi & Profil */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 uppercase tracking-wider">
              1. Identitas & Periode Evaluasi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Supplier Selection */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Pilih Supplier *
                  </label>
                  {!isInlineSupOpen && (
                    <button 
                      type="button" 
                      onClick={() => setIsInlineSupOpen(true)}
                      className="text-[10px] font-bold text-[#0284c7] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" /> Supplier Baru
                    </button>
                  )}
                </div>
                
                {isInlineSupOpen ? (
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-2 mt-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registrasi Supplier Cepat</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text"
                        placeholder="Nama PT / CV Baru"
                        value={newSupNama}
                        onChange={(e) => setNewSupNama(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                      />
                      <input 
                        type="text"
                        placeholder="No. Vendor Ellipse"
                        value={newSupNoVendor}
                        onChange={(e) => setNewSupNoVendor(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text"
                        placeholder="Narahubung"
                        value={newSupKontak}
                        onChange={(e) => setNewSupKontak(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                      />
                      <select
                        value={newSupKategori}
                        onChange={(e) => setNewSupKategori(e.target.value)}
                        className="w-full px-2 py-1 text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                      >
                        <option value="Penyedia Bahan Bakar Batubara">Batubara</option>
                        <option value="Suku Cadang & Pemeliharaan Turbin">Turbin</option>
                        <option value="Jasa Pemeliharaan Pompa & Katup">Mekanikal</option>
                        <option value="Alat Pelindung Diri & Peralatan K3L">K3L / Safety</option>
                        <option value="Sistem IT, Security & Komunikasi">IT & Security</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button 
                        type="button" 
                        onClick={() => setIsInlineSupOpen(false)}
                        className="px-2 py-1 text-[9px] font-bold text-slate-500 hover:bg-slate-100 rounded"
                      >
                        Batal
                      </button>
                      <button 
                        type="button" 
                        onClick={handleQuickSupSubmit}
                        className="px-2 py-1 text-[9px] font-bold text-white bg-sky-600 rounded"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} {s.noVendorEllipse ? `[Ellipse: ${s.noVendorEllipse}]` : ""} ({s.kategoriBisnis})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Unit Pembangkit Selection */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    Unit Pembangkit *
                  </span>
                  {isUnitRestricted && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded font-bold border border-amber-300 dark:border-amber-800">
                      🔒 Terkunci
                    </span>
                  )}
                </label>
                <select
                  value={isUnitRestricted ? (userAssignedUnitId || "") : unitId}
                  disabled={isUnitRestricted}
                  onChange={(e) => setUnitId(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white ${
                    isUnitRestricted ? "cursor-not-allowed bg-amber-50/50 dark:bg-amber-950/20 font-semibold text-sky-800 dark:text-sky-300 border-amber-300 dark:border-amber-800" : ""
                  }`}
                >
                  <option value="">-- Pilih Unit --</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>[{u.kode}] {u.nama}</option>
                  ))}
                </select>
              </div>

              {/* Evaluator pre-fill */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Nama Evaluator / Penilai
                </label>
                <input 
                  type="text"
                  required
                  value={evaluator}
                  onChange={(e) => setEvaluator(e.target.value)}
                  placeholder="Nama Penilai Utama"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tahun Evaluasi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Tahun Penilaian *
                </label>
                <select
                  value={tahun}
                  onChange={(e) => setTahun(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
                >
                  <option value={2026}>Tahun 2026</option>
                  <option value={2025}>Tahun 2025</option>
                  <option value={2024}>Tahun 2024</option>
                </select>
              </div>

              {/* Periode Evaluasi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Periode Penilaian *
                </label>
                <select
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
                >
                  <option value="Semester 1">Semester 1 (Januari - Juni)</option>
                  <option value="Semester 2">Semester 2 (Juli - Desember)</option>
                  <option value="Tahunan">Tahunan (Rekap 1 Tahun)</option>
                </select>
              </div>

              {/* Tanggal Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Tanggal Input *
                </label>
                <input 
                  type="date"
                  required
                  value={tanggalPenilaian}
                  onChange={(e) => setTanggalPenilaian(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* PO Information Fields */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-3.5 space-y-3">
              <p className="text-[10px] font-extrabold text-[#0284c7] dark:text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Informasi Purchase Order (PO)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nomor PO */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    No. PO
                  </label>
                  <input 
                    type="text"
                    value={noPo}
                    onChange={(e) => setNoPo(e.target.value)}
                    placeholder="Contoh: PO/2026/00451"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>

                {/* Tanggal PO */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Tanggal PO
                  </label>
                  <input 
                    type="date"
                    value={tanggalPo}
                    onChange={(e) => setTanggalPo(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* Deskripsi PO */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Deskripsi PO
                  </label>
                  <input 
                    type="text"
                    value={deskripsiPo}
                    onChange={(e) => setDeskripsiPo(e.target.value)}
                    placeholder="Contoh: Pengadaan Batubara Kalori..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Input Bobot Aspek Kinerja */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 uppercase tracking-wider">
              2. Kriteria & Aspek Penilaian Kinerja (Bobot 100%)
            </h3>
            
            <div className="space-y-3">
              {(Object.keys(scores) as AspectKey[]).map((key) => {
                const label = ASPECT_LABELS[key];
                const weight = ASPECT_WEIGHTS[key] * 100;
                const desc = ASPECT_DESCRIPTIONS[key];
                const scoreValue = scores[key];

                // Performance label for individual category
                let scoreDesc = "Kurang";
                let scoreColor = "text-orange-500";
                if (scoreValue >= 4.25) { scoreDesc = "Sangat Baik"; scoreColor = "text-emerald-500"; }
                else if (scoreValue >= 3.5) { scoreDesc = "Baik"; scoreColor = "text-sky-500"; }
                else if (scoreValue >= 3.0) { scoreDesc = "Cukup"; scoreColor = "text-amber-500"; }
                else if (scoreValue < 2.5) { scoreDesc = "Sangat Kurang"; scoreColor = "text-rose-500"; }

                return (
                  <div key={key} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800/80 space-y-2">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold bg-sky-100 dark:bg-sky-950 text-[#0284c7] px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-900/40">
                            Bobot {weight}%
                          </span>
                          <span className="text-[9px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-150 dark:border-amber-900/40">
                            Evaluator: {ASPECT_EVALUATORS[key]}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white">{label}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-xl space-y-0.5">
                          {desc.includes("\n") ? (
                            <ul className="list-disc list-inside space-y-0.5 pl-0.5">
                              {desc.split("\n").map((line, idx) => (
                                <li key={idx} className="leading-relaxed">
                                  {line}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>{desc}</p>
                          )}
                        </div>
                      </div>

                      {/* Score Badge Selector */}
                      <div className="flex items-center gap-2 self-stretch md:self-auto justify-between bg-white dark:bg-slate-950 p-1.5 rounded border border-slate-200 dark:border-slate-800 md:w-auto">
                        <span className={`text-[10px] font-bold px-1.5 ${scoreColor}`}>
                          {scoreDesc}
                        </span>
                        <input 
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={scoreValue}
                          onChange={(e) => handleScoreChange(key, Number(e.target.value))}
                          className="w-12 px-1 py-0.5 text-center text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded border-none text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-sky-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Interactive Slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-slate-400 font-mono font-bold">1.0</span>
                      <input 
                        type="range"
                        min="1"
                        max="5"
                        step="0.1"
                        value={scoreValue}
                        onChange={(e) => handleScoreChange(key, Number(e.target.value))}
                        className="w-full accent-[#0284c7] dark:accent-sky-400 h-1 bg-slate-200 dark:bg-slate-700 rounded cursor-pointer"
                      />
                      <span className="text-[9px] text-slate-400 font-mono font-bold">5.0</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Catatan Rekomendasi */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 uppercase tracking-wider">
              3. Rekomendasi & Catatan Tindak Lanjut
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Rekomendasi Manajerial *</label>
              <textarea 
                rows={3}
                value={rekomendasi}
                onChange={(e) => setRekomendasi(e.target.value)}
                placeholder="Berikan catatan perbaikan, saran perpanjangan kontrak, atau tindakan disiplin atas keterlambatan/kelalaian..."
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button 
              type="button"
              onClick={() => {
                setEditingEvaluation(null);
                setActiveTab("rekap");
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors border border-slate-200 dark:border-slate-800"
            >
              Kembali ke Rekap
            </button>
             <button 
              type="button"
              onClick={() => {
                setErrorMsg("");
                setIsPrintBlankForm(true);
                setShowPrintPreview(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 rounded cursor-pointer transition-colors border border-indigo-200 dark:border-indigo-900/40"
            >
              <FileText className="w-4 h-4" />
              Cetak Formulir Kosong
            </button>
            <button 
              type="button"
              onClick={() => {
                if (!supplierId) {
                  setErrorMsg("Harap pilih supplier terlebih dahulu untuk melihat pratinjau cetak.");
                  return;
                }
                setErrorMsg("");
                setIsPrintBlankForm(false);
                setShowPrintPreview(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 rounded cursor-pointer transition-colors border border-emerald-200 dark:border-emerald-900/40"
            >
              <Printer className="w-4 h-4" />
              Pratinjau Cetak
            </button>
            <button 
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0284c7] hover:bg-sky-700 rounded cursor-pointer shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingEvaluation ? "Simpan Perubahan Penilaian" : "Simpan & Validasi"}
            </button>
          </div>

        </form>

        {/* Real-time Score Preview Sidebar Widget */}
        <div className="space-y-6">
          
          {/* Card Preview Nilai Akhir */}
          <div className={`p-5 rounded-lg border ${borderColor} ${bgColor} shadow-xs space-y-4`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Preview Nilai Akhir</span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                  {currentNilaiAkhir}
                </h3>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <Sparkles className="w-4 h-4 text-[#0284c7]" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Predikat Kelayakan:</span>
              <p className={`text-base font-extrabold ${color}`}>
                {predikat}
              </p>
            </div>

            {/* Visual Meter Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Kurang</span>
                <span>Cukup</span>
                <span>Baik</span>
                <span>Sangat Baik</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full bg-linear-to-r from-rose-500 via-amber-400 to-emerald-500 transition-all duration-300"
                  style={{ width: `${(currentNilaiAkhir / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Breakdown of weighted items for preview transparency */}
            <div className="space-y-2 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Perincian Nilai Tertimbang:</p>
              
              <div className="space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                {(Object.keys(scores) as AspectKey[]).map((key) => {
                  const weight = ASPECT_WEIGHTS[key];
                  const itemScore = scores[key] || 0;
                  const weightedContribution = Math.round((itemScore * weight) * 100) / 100;
                  
                  return (
                    <div key={key} className="flex justify-between">
                      <span className="truncate max-w-[120px]">{ASPECT_LABELS[key]}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {itemScore} &times; {weight * 100}% = {weightedContribution}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pedoman Penilaian Informational Box */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="font-bold text-[10px] text-slate-700 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Info className="w-4 h-4 text-[#0284c7]" />
              Pedoman Peringkat Kinerja (Skala 1 - 5)
            </h4>
            <div className="space-y-2 text-[10px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between p-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded border border-emerald-100">
                <span className="font-bold text-emerald-700 font-mono">Skor &ge; 4.25:</span>
                <span>Sangat Baik (A)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-sky-50/50 dark:bg-sky-950/20 rounded border border-sky-100">
                <span className="font-bold text-sky-700 font-mono">Skor 3.50 - 4.24:</span>
                <span>Baik (B)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-amber-50/50 dark:bg-amber-950/20 rounded border border-amber-100">
                <span className="font-bold text-amber-700 font-mono">Skor 3.00 - 3.49:</span>
                <span>Cukup (C)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-orange-50/50 dark:bg-orange-950/20 rounded border border-orange-100">
                <span className="font-bold text-orange-700 font-mono">Skor 2.50 - 2.99:</span>
                <span>Kurang (D)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-rose-50/50 dark:bg-rose-950/20 rounded border border-rose-100">
                <span className="font-bold text-rose-700 font-mono">Skor &lt; 2.50:</span>
                <span>Sangat Kurang (E)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
