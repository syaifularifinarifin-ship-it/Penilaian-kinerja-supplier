/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useSuppliers } from "../context/SupplierContext";
import { 
  AspectScores, 
  ASPECT_WEIGHTS, 
  ASPECT_LABELS, 
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
  Cpu
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

  // Selected Supplier
  const [supplierId, setSupplierId] = useState("");
  const [unitId, setUnitId] = useState("");
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
  const [evaluator, setEvaluator] = useState("Syaiful Arifin (Manajer Logistik)");
  const [tanggalPenilaian, setTanggalPenilaian] = useState(new Date().toISOString().split("T")[0]);
  const [noPo, setNoPo] = useState("");
  const [deskripsiPo, setDeskripsiPo] = useState("");
  const [tanggalPo, setTanggalPo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Quick Inline Supplier registration
  const [isInlineSupOpen, setIsInlineSupOpen] = useState(false);
  const [newSupNama, setNewSupNama] = useState("");
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
      if (units.length > 0 && !unitId) {
        setUnitId(units[0].id);
      }
      setTanggalPenilaian(new Date().toISOString().split("T")[0]);
      setNoPo("");
      setDeskripsiPo("");
      setTanggalPo("");
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
  }, [editingEvaluation, suppliers, units]);

  // Set first supplier as default when suppliers load
  useEffect(() => {
    if (suppliers.length > 0 && !supplierId && !editingEvaluation) {
      setSupplierId(suppliers[0].id);
    }
  }, [suppliers, supplierId, editingEvaluation]);

  // Set first unit as default when units load
  useEffect(() => {
    if (units.length > 0 && !unitId && !editingEvaluation) {
      setUnitId(units[0].id);
    }
  }, [units, unitId, editingEvaluation]);

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
      kategoriBisnis: newSupKategori,
      alamat: "Alat Kelengkapan Lapangan Pembangkit",
      kontak: newSupKontak,
      email: `${newSupNama.toLowerCase().replace(/[^a-z0-9]/g, "")}@pembangkit-mitra.id`,
      telepon: "+62 812-3456-7890"
    });
    setSupplierId(created.id);
    setNewSupNama("");
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

    const selectedUnit = units.find(u => u.id === unitId);

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
        {editingEvaluation && (
          <button 
            onClick={handleCancelEdit}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1.5 rounded border border-rose-200 dark:border-rose-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Batal Edit
          </button>
        )}
      </div>

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
                    <input 
                      type="text"
                      placeholder="Nama PT / CV Baru"
                      value={newSupNama}
                      onChange={(e) => setNewSupNama(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                    />
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
                      <option key={s.id} value={s.id}>{s.nama} ({s.kategoriBisnis})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Unit Pembangkit Selection */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  Unit Pembangkit *
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
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
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold bg-sky-100 dark:bg-sky-950 text-[#0284c7] px-1.5 py-0.5 rounded border border-sky-200">
                            Bobot {weight}%
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
