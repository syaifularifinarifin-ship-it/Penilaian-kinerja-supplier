/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { useSuppliers } from "../context/SupplierContext";
import { Unit } from "../types";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  RefreshCw,
  Info,
  Database,
  Building2,
  Cpu,
  FileSpreadsheet,
  FileJson
} from "lucide-react";

export default function UnitDatabaseView() {
  const { 
    units, 
    addUnit, 
    updateUnit, 
    deleteUnit,
    setUnits,
    addLog,
    hasPermission
  } = useSuppliers();

  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [pasteData, setPasteData] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [parsedPreview, setParsedPreview] = useState<any[] | null>(null);
  const [fileType, setFileType] = useState<"json" | "csv" | "excel">("json");
  
  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unit Form State
  const [formKode, setFormKode] = useState("");
  const [formNama, setFormNama] = useState("");

  // Search and Filter
  const filteredUnits = units.filter(unit => {
    return (
      unit.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle Form open for Add
  const handleAddOpen = () => {
    setEditingUnit(null);
    setFormKode("");
    setFormNama("");
    setIsFormOpen(true);
  };

  // Handle Form open for Edit
  const handleEditOpen = (unit: Unit) => {
    setEditingUnit(unit);
    setFormKode(unit.kode);
    setFormNama(unit.nama);
    setIsFormOpen(true);
  };

  // Handle Submit Form
  const handleSubmitUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKode.trim() || !formNama.trim()) {
      alert("Kode Unit dan Nama Unit wajib diisi!");
      return;
    }

    const unitData = {
      kode: formKode.trim().toUpperCase(),
      nama: formNama.trim(),
    };

    if (editingUnit) {
      updateUnit({
        ...editingUnit,
        ...unitData
      });
      addLog("Edit Unit", `Mengedit data unit: [${formKode}] ${formNama}`);
    } else {
      addUnit(unitData);
    }

    setIsFormOpen(false);
  };

  // Handle Delete Unit
  const handleDeleteUnit = (id: string, code: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus unit "[${code}] ${name}"?`)) {
      deleteUnit(id);
    }
  };

  // Helper to parse CSV text
  const parseCSV = (text: string) => {
    // Remove BOM if present
    const cleanText = text.startsWith("\uFEFF") ? text.slice(1) : text;
    const lines = cleanText.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return [];
    
    const parseCSVLine = (line: string) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    const data: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length > 0) {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] !== undefined ? values[index] : "";
        });
        data.push(obj);
      }
    }
    return data;
  };

  // Process Parsed Data for Validation & Preview
  const processParsedData = (parsed: any[]) => {
    setUploadError("");
    setUploadSuccess("");
    setParsedPreview(null);

    if (!parsed || parsed.length === 0) {
      setUploadError("Data kosong atau format tidak sesuai.");
      return;
    }

    // Normalize keys to lowercase and trim them to support any header casing (Kode, KODE, Nama, NAMA)
    const normalized = parsed.map(item => {
      const newItem: any = {};
      Object.keys(item).forEach(key => {
        const cleanKey = key.trim().toLowerCase();
        newItem[cleanKey] = item[key];
      });
      return newItem;
    });

    // Validate Kode & Nama
    const missingFields = normalized.some(item => !item.kode || !item.nama);
    if (missingFields) {
      setUploadError("Validasi Gagal: Sebagian baris tidak memiliki kolom 'kode' atau 'nama' yang wajib diisi. Pastikan berkas Anda memiliki header kolom 'kode' dan 'nama' (tidak sensitif huruf besar/kecil).");
      return;
    }

    setParsedPreview(normalized);
    setUploadSuccess(`Berhasil memuat ${normalized.length} baris data unit dari berkas. Silakan tinjau dan klik 'Simpan Impor' di bawah.`);
  };

  // Drag over handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process File
  const handleFile = (file: File) => {
    const reader = new FileReader();
    const extension = file.name.split(".").pop()?.toLowerCase();
    
    if (extension === "xlsx" || extension === "xls") {
      setFileType("excel");
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const parsed = XLSX.utils.sheet_to_json(worksheet);
          
          processParsedData(parsed);
        } catch (err: any) {
          setUploadError(`Gagal membaca berkas Excel: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (extension === "json") {
          setFileType("json");
          setPasteData(text);
          tryPreview(text, "json");
        } else if (extension === "csv" || extension === "txt") {
          setFileType("csv");
          setPasteData(text);
          tryPreview(text, "csv");
        } else {
          setUploadError("Format berkas tidak didukung! Silakan unggah berkas Excel (.xlsx/.xls), .json, atau .csv.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Live preview parser for paste
  const tryPreview = (text: string, type: "json" | "csv") => {
    if (!text.trim()) {
      setParsedPreview(null);
      setUploadError("");
      setUploadSuccess("");
      return;
    }

    try {
      let parsed: any[] = [];
      if (type === "json") {
        const item = JSON.parse(text);
        parsed = Array.isArray(item) ? item : [item];
      } else {
        parsed = parseCSV(text);
      }
      processParsedData(parsed);
    } catch (err: any) {
      setUploadError(`Gagal membaca format data: ${err.message}`);
    }
  };

  // Perform Import Execution
  const handleExecuteImport = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;

    try {
      const newUnits: Unit[] = parsedPreview.map((item, index) => ({
        id: item.id || `unit-${Date.now()}-${index}`,
        kode: String(item.kode).toUpperCase(),
        nama: String(item.nama)
      }));

      // Deduplicate by Unit Code (kode)
      setUnits(prev => {
        const filteredNew = newUnits.filter(nu => !prev.some(pu => pu.kode.toLowerCase() === nu.kode.toLowerCase()));
        const combined = [...prev, ...filteredNew];
        addLog("Impor Bulk Unit", `Mengimpor ${filteredNew.length} unit baru (mengabaikan duplikat kode).`);
        return combined;
      });

      alert(`Impor Sukses! ${newUnits.length} unit berhasil ditambahkan.`);

      // Reset
      setPasteData("");
      setParsedPreview(null);
      setUploadSuccess("");
      setIsUploadOpen(false);
    } catch (err: any) {
      alert(`Gagal menyimpan impor: ${err.message}`);
    }
  };

  // Template codes
  const unitJsonTemplate = `[
  {
    "kode": "U5",
    "nama": "Unit 5"
  },
  {
    "kode": "U6",
    "nama": "Unit 6"
  }
]`;

  const unitCsvTemplate = `kode,nama
U5,Unit 5
U6,Unit 6`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header with Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Database Unit Pembangkit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manajemen unit pembangkit yang mencakup pendaftaran kode unit, nama unit, serta import data bulk menggunakan berkas Excel.
          </p>
        </div>

        {hasPermission("units") && (
          <div className="flex items-center gap-2">
            {/* Open Upload Panel Button */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50 rounded cursor-pointer transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Impor Bulk Excel / CSV
            </button>

            {/* Add Unit Button */}
            <button
              onClick={handleAddOpen}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded cursor-pointer transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Tambah Unit
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs flex items-center gap-4">
          <div className="p-3 bg-sky-50 dark:bg-sky-950 rounded-lg text-sky-600 dark:text-sky-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Unit Terdaftar</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">{units.length}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Metrik Unit Terkelola</p>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Sistem Pelaporan Terpusat</p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari berdasarkan kode unit atau nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Units Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">No.</th>
                <th className="py-3 px-6">Kode Unit</th>
                <th className="py-3 px-6">Nama Unit</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Cpu className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    Tidak ada unit yang terdaftar.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit, index) => (
                  <tr key={unit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white font-mono">{unit.kode}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-700 dark:text-slate-300">{unit.nama}</td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasPermission("units") && (
                          <>
                            <button
                              onClick={() => handleEditOpen(unit)}
                              title="Edit Unit"
                              className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUnit(unit.id, unit.kode, unit.nama)}
                              title="Hapus Unit"
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD/EDIT FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full border border-slate-200 dark:border-slate-850 shadow-xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sky-600" />
                {editingUnit ? "Edit Data Unit" : "Tambah Unit Baru"}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUnit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kode Unit *</label>
                <input
                  type="text"
                  required
                  value={formKode}
                  onChange={(e) => setFormKode(e.target.value)}
                  placeholder="Contoh: U1"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Unit *</label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Unit 1"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer border border-slate-200 dark:border-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded cursor-pointer transition-all"
                >
                  {editingUnit ? "Simpan Perubahan" : "Simpan Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXCEL FILE UPLOAD PORTAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full border border-slate-200 dark:border-slate-850 shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-white">
                    Fasilitas Impor Unit (Excel)
                  </h3>
                  <p className="text-[10px] text-slate-400">Import database unit dengan cepat menggunakan excel, CSV, atau JSON.</p>
                </div>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 space-y-3.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode 1: Unggah Berkas Excel</p>
                  
                  {/* Drag drop zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                      dragActive 
                        ? "border-sky-500 bg-sky-50/40 dark:bg-sky-950/20" 
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300"
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      accept=".xlsx,.xls,.json,.csv,.txt"
                      className="hidden" 
                    />
                    <UploadCloud className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Tarik & Lepas file Excel di sini</p>
                    <p className="text-[10px] text-slate-400 mt-1">atau klik untuk memilih berkas dari komputer Anda</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> Excel (.xlsx/.xls)
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        <FileSpreadsheet className="w-3 h-3 text-sky-500" /> .CSV
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        <FileJson className="w-3 h-3 text-amber-500" /> .JSON
                      </span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded border border-slate-100 dark:border-slate-800/60 space-y-2">
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-sky-500" /> Format Header Kolom Excel
                    </p>
                    <p className="text-[9px] text-slate-400">Format kolom wajib berisikan header <strong className="text-sky-600 font-mono">kode</strong> dan <strong className="text-sky-600 font-mono">nama</strong> seperti contoh berikut:</p>
                    
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-1.5 rounded text-[9px] font-mono border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 text-[8px] font-mono">kode,nama</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(unitCsvTemplate);
                          alert("Template CSV disalin ke papan klip!");
                        }}
                        className="text-sky-600 hover:underline shrink-0 font-bold"
                      >
                        Salin CSV
                      </button>
                    </div>

                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-1.5 rounded text-[9px] font-mono border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 text-[8px]">JSON Format Template</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(unitJsonTemplate);
                          alert("Template JSON disalin ke papan klip!");
                        }}
                        className="text-amber-500 hover:underline shrink-0 font-bold"
                      >
                        Salin JSON
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode 2: Tempel Teks Data Mentah</p>
                    <div className="flex gap-1.5 text-[8.5px]">
                      <button 
                        onClick={() => { setFileType("json"); tryPreview(pasteData, "json"); }}
                        className={`px-1.5 py-0.5 rounded border ${fileType === "json" ? "bg-amber-100 text-amber-850 border-amber-300" : "bg-slate-100 text-slate-400 border-transparent"}`}
                      >
                        JSON Mode
                      </button>
                      <button 
                        onClick={() => { setFileType("csv"); tryPreview(pasteData, "csv"); }}
                        className={`px-1.5 py-0.5 rounded border ${fileType === "csv" ? "bg-emerald-100 text-emerald-850 border-emerald-300" : "bg-slate-100 text-slate-400 border-transparent"}`}
                      >
                        CSV Mode
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    rows={8}
                    value={pasteData}
                    onChange={(e) => {
                      setPasteData(e.target.value);
                      tryPreview(e.target.value, fileType);
                    }}
                    placeholder={"Tempel baris CSV atau kode JSON di sini...\nContoh:\nkode,nama\nU5,Unit 5\nU6,Unit 6"}
                    className="w-full flex-1 p-3 text-[10px] font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-800 dark:text-slate-100 leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Status alerts */}
              {uploadError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs rounded flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Gagal Membaca Data</p>
                    <p className="text-[10px] mt-0.5">{uploadError}</p>
                  </div>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs rounded flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                  <div>
                    <p className="font-bold">Validasi Berhasil!</p>
                    <p className="text-[10px] mt-0.5">{uploadSuccess}</p>
                  </div>
                </div>
              )}

              {/* Parsed preview table */}
              {parsedPreview && parsedPreview.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden space-y-2">
                  <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Preview Data Yang Akan Diimpor</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead>
                        <tr className="bg-slate-100/50 dark:bg-slate-900/80 text-slate-500">
                          <th className="py-2 px-3">Kode Unit</th>
                          <th className="py-2 px-3">Nama Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedPreview.slice(0, 5).map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 px-3 font-mono font-bold text-slate-850 dark:text-slate-200">{item.kode}</td>
                            <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">{item.nama}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedPreview.length > 5 && (
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 text-center text-[9px] text-slate-400">
                      Dan {parsedPreview.length - 5} baris data lainnya...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <button
                type="button"
                onClick={() => {
                  setPasteData("");
                  setParsedPreview(null);
                  setUploadSuccess("");
                  setUploadError("");
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Form
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer border border-slate-200 dark:border-slate-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!parsedPreview || parsedPreview.length === 0}
                  onClick={handleExecuteImport}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed rounded cursor-pointer transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Impor ({parsedPreview ? parsedPreview.length : 0} Unit)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
