/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { useSuppliers } from "../context/SupplierContext";
import { Supplier, Evaluation, AspectScores, calculateFinalScore, getPredikatAndColor } from "../types";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UploadCloud, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  FileSpreadsheet, 
  FileJson, 
  X, 
  RefreshCw,
  Info,
  ChevronRight,
  Database,
  Eye
} from "lucide-react";

export default function SupplierDatabaseView() {
  const { 
    suppliers, 
    evaluations, 
    addSupplier, 
    updateSupplier, 
    deleteSupplier,
    setSuppliers,
    setEvaluations,
    addLog,
    setActiveTab,
    setSelectedSupplierIdForRaport,
    hasPermission,
    units,
    currentUser
  } = useSuppliers();

  // Unit restriction logic
  const isUnitRestricted = !!(currentUser && currentUser.role !== "Administrator" && currentUser.unitId);
  const userAssignedUnitId = isUnitRestricted ? currentUser.unitId : null;
  const userAssignedUnitObj = userAssignedUnitId ? units.find(u => u.id === userAssignedUnitId) : null;

  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<"supplier" | "evaluation">("supplier");
  const [pasteData, setPasteData] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [parsedPreview, setParsedPreview] = useState<any[] | null>(null);
  const [fileType, setFileType] = useState<"json" | "csv" | "excel">("json");
  
  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supplier Form State
  const [formNama, setFormNama] = useState("");
  const [formNoVendor, setFormNoVendor] = useState("");
  const [formKategori, setFormKategori] = useState("");
  const [formAlamat, setFormAlamat] = useState("");
  const [formKontak, setFormKontak] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelepon, setFormTelepon] = useState("");

  // Get unique categories for filtering
  const categories = ["Semua", ...Array.from(new Set(suppliers.map(s => s.kategoriBisnis)))];

  // Map each supplier to its evaluation stats
  const supplierStats = suppliers.map(sup => {
    const supEvals = evaluations.filter(e => e.supplierId === sup.id && (isUnitRestricted ? e.unitId === userAssignedUnitId : true));
    const evalCount = supEvals.length;
    const avgScore = evalCount > 0 
      ? Math.round((supEvals.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / evalCount) * 100) / 100
      : null;
    
    return {
      ...sup,
      evalCount,
      avgScore
    };
  });

  // Filter and search
  const filteredSuppliers = supplierStats.filter(sup => {
    const matchesSearch = 
      sup.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sup.noVendorEllipse && sup.noVendorEllipse.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sup.kategoriBisnis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.kontak.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "Semua" || sup.kategoriBisnis === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle Form open for Add
  const handleAddOpen = () => {
    setEditingSupplier(null);
    setFormNama("");
    setFormNoVendor("");
    setFormKategori("");
    setFormAlamat("");
    setFormKontak("");
    setFormEmail("");
    setFormTelepon("");
    setIsFormOpen(true);
  };

  // Handle Form open for Edit
  const handleEditOpen = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormNama(sup.nama);
    setFormNoVendor(sup.noVendorEllipse || "");
    setFormKategori(sup.kategoriBisnis);
    setFormAlamat(sup.alamat);
    setFormKontak(sup.kontak);
    setFormEmail(sup.email);
    setFormTelepon(sup.telepon);
    setIsFormOpen(true);
  };

  // Handle Submit Form
  const handleSubmitSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formKategori.trim()) {
      alert("Nama Supplier dan Kategori Bisnis wajib diisi!");
      return;
    }

    const supplierData = {
      nama: formNama.trim(),
      noVendorEllipse: formNoVendor.trim(),
      kategoriBisnis: formKategori.trim(),
      alamat: formAlamat.trim(),
      kontak: formKontak.trim(),
      email: formEmail.trim(),
      telepon: formTelepon.trim(),
    };

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        ...supplierData
      });
      addLog("Edit Supplier", `Mengedit data supplier: ${formNama}`);
    } else {
      addSupplier(supplierData);
    }

    setIsFormOpen(false);
  };

  // Handle Delete Supplier
  const handleDeleteSupplier = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus supplier "${name}"? Semua penilaian terkait tidak akan terhapus namun akan kehilangan relasi nama.`)) {
      deleteSupplier(id);
    }
  };

  // Helper to parse CSV text
  const parseCSV = (text: string) => {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return [];
    
    // Simple CSV parser handling quotes
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

    const headers = parseCSVLine(lines[0]);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        data.push(obj);
      }
    }
    return data;
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

  // Process Parsed Data for Validation & Preview
  const processParsedData = (parsed: any[]) => {
    setUploadError("");
    setUploadSuccess("");
    setParsedPreview(null);

    if (!parsed || parsed.length === 0) {
      setUploadError("Data kosong atau format tidak sesuai.");
      return;
    }

    // Quick validation check
    if (uploadTab === "supplier") {
      const missingFields = parsed.some(item => !item.nama || !item.kategoriBisnis);
      if (missingFields) {
        setUploadError("Validasi Gagal: Sebagian baris tidak memiliki kolom 'nama' atau 'kategoriBisnis' yang wajib diisi.");
        return;
      }
    } else {
      // Validation for evaluations
      const invalidScores = parsed.some(item => {
        const s = [
          Number(item.integritas), Number(item.kerjasama), Number(item.mutu), 
          Number(item.waktu), Number(item.harga), Number(item.k3l), 
          Number(item.keamanan), Number(item.energi)
        ];
        return s.some(val => isNaN(val) || val < 1 || val > 5);
      });

      if (invalidScores) {
        setUploadError("Validasi Gagal: Penilaian harus memiliki nilai angka antara skala 1.0 sampai 5.0.");
        return;
      }

      const missingFields = parsed.some(item => !item.supplierNama || !item.tahun || !item.periode);
      if (missingFields) {
        setUploadError("Validasi Gagal: Sebagian baris tidak memiliki kolom wajib 'supplierNama', 'tahun', atau 'periode'.");
        return;
      }
    }

    setParsedPreview(parsed);
    setUploadSuccess(`Berhasil memuat ${parsed.length} baris data dari berkas. Silakan tinjau dan klik 'Simpan Impor' di bawah.`);
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

  // Live preview parser
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
      if (uploadTab === "supplier") {
        const newSuppliers: Supplier[] = parsedPreview.map((item, index) => ({
          id: item.id || `sup-${Date.now()}-${index}`,
          nama: String(item.nama),
          noVendorEllipse: String(item.noVendorEllipse || item.noVendor || item.vendorEllipse || ""),
          kategoriBisnis: String(item.kategoriBisnis || "Penyedia"),
          alamat: String(item.alamat || ""),
          kontak: String(item.kontak || ""),
          email: String(item.email || ""),
          telepon: String(item.telepon || "")
        }));

        // Deduplicate or append? We will append but avoid exact name duplicates
        setSuppliers(prev => {
          const filteredNew = newSuppliers.filter(ns => !prev.some(ps => ps.nama.toLowerCase() === ns.nama.toLowerCase()));
          const combined = [...prev, ...filteredNew];
          addLog("Impor Bulk Supplier", `Mengimpor ${filteredNew.length} supplier baru (mengabaikan duplikat nama).`);
          return combined;
        });

        alert(`Impor Sukses! ${newSuppliers.length} supplier telah berhasil diintegrasikan.`);
      } else {
        // Import Evaluations
        const newEvaluations: Evaluation[] = parsedPreview.map((item, index) => {
          const supplierObj = suppliers.find(s => s.nama.toLowerCase() === String(item.supplierNama).toLowerCase());
          const supplierId = supplierObj ? supplierObj.id : `sup-${Date.now()}-${index}`;
          
          // Ensure supplier is created if not exists
          if (!supplierObj) {
            addSupplier({
              nama: String(item.supplierNama),
              noVendorEllipse: item.noVendorEllipse || "",
              kategoriBisnis: "Hasil Impor",
              alamat: "",
              kontak: "PIC Impor",
              email: "",
              telepon: ""
            });
          }

          const scores: AspectScores = {
            integritas: Number(item.integritas || 4.0),
            kerjasama: Number(item.kerjasama || 4.0),
            mutu: Number(item.mutu || 4.0),
            waktu: Number(item.waktu || 4.0),
            harga: Number(item.harga || 4.0),
            k3l: Number(item.k3l || 4.0),
            keamanan: Number(item.keamanan || 4.0),
            energi: Number(item.energi || 4.0),
          };

          const finalScore = calculateFinalScore(scores);
          const { predikat } = getPredikatAndColor(finalScore);

          return {
            id: item.id || `eval-${Date.now()}-${index}`,
            supplierId,
            supplierNama: String(item.supplierNama),
            tahun: Number(item.tahun || 2026),
            periode: String(item.periode || "Semester 1"),
            scores,
            nilaiAkhir: finalScore,
            predikat,
            rekomendasi: String(item.rekomendasi || `Kinerja dinilai ${predikat} dengan nilai ${finalScore}`),
            evaluator: String(item.evaluator || "Syaiful Arifin (Impor)"),
            tanggalPenilaian: String(item.tanggalPenilaian || new Date().toISOString().split("T")[0]),
            noPo: item.noPo ? String(item.noPo) : undefined,
            deskripsiPo: item.deskripsiPo ? String(item.deskripsiPo) : undefined,
            tanggalPo: item.tanggalPo ? String(item.tanggalPo) : undefined
          };
        });

        setEvaluations(prev => {
          const combined = [...prev, ...newEvaluations];
          addLog("Impor Bulk Evaluasi", `Mengimpor ${newEvaluations.length} data penilaian kinerja.`);
          return combined;
        });

        alert(`Impor Sukses! ${newEvaluations.length} evaluasi kinerja telah berhasil ditambahkan.`);
      }

      // Reset
      setPasteData("");
      setParsedPreview(null);
      setUploadSuccess("");
      setIsUploadOpen(false);
    } catch (err: any) {
      alert(`Gagal menyimpan impor: ${err.message}`);
    }
  };

  // Templates structures for users to copy
  const supplierJsonTemplate = `[
  {
    "nama": "PT Baja Perkasa Abadi",
    "noVendorEllipse": "V-10029301",
    "kategoriBisnis": "Penyedia Konstruksi & Logam",
    "alamat": "Kawasan Industri Pulo Gadung, Jakarta",
    "kontak": "Bapak Hermawan",
    "email": "hermawan@bajaperkasa.com",
    "telepon": "+62 21 460 7788"
  }
]`;

  const supplierCsvTemplate = `nama,noVendorEllipse,kategoriBisnis,alamat,kontak,email,telepon
PT Baja Perkasa Abadi,V-10029301,Penyedia Konstruksi & Logam,"Kawasan Industri Pulo Gadung, Jakarta",Bapak Hermawan,hermawan@bajaperkasa.com,+62 21 460 7788`;

  const evaluationJsonTemplate = `[
  {
    "supplierNama": "PT Batubara Mulia Abadi",
    "tahun": 2026,
    "periode": "Semester 1",
    "integritas": 4.5,
    "kerjasama": 4.2,
    "mutu": 4.0,
    "waktu": 3.8,
    "harga": 4.5,
    "k3l": 4.8,
    "keamanan": 4.0,
    "energi": 3.5,
    "rekomendasi": "Pertahankan kinerja yang prima ini.",
    "evaluator": "Syaiful Arifin (Manajer Logistik)",
    "tanggalPenilaian": "2026-06-28",
    "noPo": "PO/2026/00451",
    "deskripsiPo": "Pengadaan Batubara Kalori Rendah 15.000 Ton",
    "tanggalPo": "2026-01-10"
  }
]`;

  const evaluationCsvTemplate = `supplierNama,tahun,periode,integritas,kerjasama,mutu,waktu,harga,k3l,keamanan,energi,rekomendasi,evaluator,tanggalPenilaian,noPo,deskripsiPo,tanggalPo
PT Batubara Mulia Abadi,2026,Semester 1,4.5,4.2,4.0,3.8,4.5,4.8,4.0,3.5,Pertahankan kinerja prima,Syaiful Arifin,2026-06-28,PO/2026/00451,Pengadaan Batubara Kalori Rendah,2026-01-10`;

  // Download Excel (.xlsx) Template Loader
  const downloadSupplierTemplateXLSX = () => {
    const data = [
      {
        nama: "PT Baja Perkasa Abadi",
        noVendorEllipse: "V-10029301",
        kategoriBisnis: "Penyedia Konstruksi & Logam",
        alamat: "Kawasan Industri Pulo Gadung, Jakarta",
        kontak: "Bapak Hermawan",
        email: "hermawan@bajaperkasa.com",
        telepon: "+62 21 460 7788"
      },
      {
        nama: "CV Nusantara Teknik Utama",
        noVendorEllipse: "V-10038412",
        kategoriBisnis: "Jasa Perbaikan & Pemeliharaan",
        alamat: "Jl. Pemuda No. 45, Surabaya",
        kontak: "Ibu Ratna Purwanti",
        email: "ratna@nusantarateknik.co.id",
        telepon: "+62 31 550 1234"
      },
      {
        nama: "PT Energi Mandiri Cemerlang",
        noVendorEllipse: "V-10049283",
        kategoriBisnis: "Pengadaan Bahan Bakar & Energi",
        alamat: "Kawasan Industri Jababeka, Cikarang",
        kontak: "Bapak Budi Santoso",
        email: "budi@energimandiri.com",
        telepon: "+62 21 890 9988"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Supplier");
    XLSX.writeFile(workbook, "Template_Loader_Database_Supplier.xlsx");
  };

  const downloadEvaluationTemplateXLSX = () => {
    const data = [
      {
        supplierNama: "PT Batubara Mulia Abadi",
        tahun: 2026,
        periode: "Semester 1",
        integritas: 4.5,
        kerjasama: 4.2,
        mutu: 4.0,
        waktu: 3.8,
        harga: 4.5,
        k3l: 4.8,
        keamanan: 4.0,
        energi: 3.5,
        rekomendasi: "Pertahankan kinerja yang prima ini.",
        evaluator: "Syaiful Arifin (Manajer Logistik)",
        tanggalPenilaian: "2026-06-28",
        noPo: "PO/2026/00451",
        deskripsiPo: "Pengadaan Batubara Kalori Rendah 15.000 Ton",
        tanggalPo: "2026-01-10"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Evaluasi");
    XLSX.writeFile(workbook, "Template_Loader_Evaluasi_Supplier.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Title Header with Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0284c7] dark:text-sky-400" />
            Database & Manajemen Supplier
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar lengkap vendor mitra PKS Pembangkit, rekapitulasi performa, dan fasilitas upload impor data bulk.
          </p>
        </div>

        {hasPermission("suppliers") && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Download Template Loader Button */}
            <button
              onClick={downloadSupplierTemplateXLSX}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded cursor-pointer transition-colors"
              title="Unduh file template Excel (.xlsx) untuk loader/impor supplier"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Template Loader (.xlsx)
            </button>

            {/* Open Upload Panel Button */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50 rounded cursor-pointer transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Impor Bulk (CSV/JSON)
            </button>

            {/* Add Supplier Button */}
            <button
              onClick={handleAddOpen}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded cursor-pointer transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Tambah Supplier
            </button>
          </div>
        )}
      </div>

      {/* Main Stats Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Supplier Terdaftar</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">{suppliers.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Telah Dievaluasi</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">
            {suppliers.filter(s => evaluations.some(e => e.supplierId === s.id)).length}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kategori Bisnis Unik</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">{categories.length - 1}</p>
        </div>
      </div>

      {/* Filtering & Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, No. Vendor Ellipse, kategori, PIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Filter Kategori:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-800 dark:text-white cursor-pointer w-full md:w-auto"
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Suppliers Database List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nama Supplier & No. Vendor Ellipse</th>
                <th className="py-3 px-4">Kontak Person / PIC</th>
                <th className="py-3 px-4">Alamat Kantor</th>
                <th className="py-3 px-4 text-center">Jumlah Evaluasi</th>
                <th className="py-3 px-4 text-center">Rata-rata Skor</th>
                <th className="py-3 px-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    Tidak ada supplier yang cocok dengan kata kunci pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((sup) => {
                  const ratingInfo = sup.avgScore ? getPredikatAndColor(sup.avgScore) : null;
                  return (
                    <tr key={sup.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                      <td className="py-3.5 px-4 space-y-1 max-w-xs">
                        <p className="font-extrabold text-slate-900 dark:text-white leading-tight">{sup.nama}</p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {sup.noVendorEllipse ? (
                            <span className="inline-block text-[9px] px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50 rounded-sm font-mono font-bold">
                              Ellipse: {sup.noVendorEllipse}
                            </span>
                          ) : (
                            <span className="inline-block text-[9px] px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-sm font-mono italic">
                              Tanpa No. Vendor
                            </span>
                          )}
                          <span className="inline-block text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-sm font-semibold">
                            {sup.kategoriBisnis}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" /> {sup.kontak || "-"}
                        </p>
                        {(sup.email || sup.telepon) && (
                          <div className="text-[10px] text-slate-400 space-y-0.5">
                            {sup.email && <p className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {sup.email}</p>}
                            {sup.telepon && <p className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {sup.telepon}</p>}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={sup.alamat}>
                        <p className="flex items-start gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /> {sup.alamat || "-"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                          {sup.evalCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {sup.avgScore ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="font-black font-mono text-slate-800 dark:text-white">{sup.avgScore}</span>
                            <span className={`text-[8px] font-bold ${ratingInfo?.color}`}>
                              {ratingInfo?.predikat}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Belum ada</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sup.evalCount > 0 && (
                            <button
                              onClick={() => {
                                setSelectedSupplierIdForRaport(sup.id);
                                setActiveTab("raport");
                              }}
                              title="Tinjau Raport Resmi"
                              className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission("suppliers") && (
                            <>
                              <button
                                onClick={() => handleEditOpen(sup)}
                                title="Edit Data Mitra"
                                className="p-1.5 text-[#0284c7] hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded cursor-pointer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSupplier(sup.id, sup.nama)}
                                title="Hapus Dari Database"
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD/EDIT SUPPLIER */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full border border-slate-200 dark:border-slate-850 shadow-xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#0284c7]" />
                {editingSupplier ? "Edit Data Supplier" : "Tambah Supplier Baru"}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSupplier} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Supplier *</label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: PT Semen Indonesia"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-[#0284c7] focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. Vendor Ellipse (ERP)</label>
                  <input
                    type="text"
                    value={formNoVendor}
                    onChange={(e) => setFormNoVendor(e.target.value)}
                    placeholder="Contoh: V-10028491"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-[#0284c7] focus:outline-hidden text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori Bisnis *</label>
                <input
                  type="text"
                  required
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  placeholder="Contoh: Pengadaan Material Sipil"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-[#0284c7] focus:outline-hidden text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat Lengkap Kantor</label>
                <textarea
                  rows={2}
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Industri No. 12, Gresik, Jawa Timur"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-[#0284c7] focus:outline-hidden text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama PIC / Kontak</label>
                  <input
                    type="text"
                    value={formKontak}
                    onChange={(e) => setFormKontak(e.target.value)}
                    placeholder="Contoh: Joko Susilo"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-[#0284c7] focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Kontak</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="pic@vendor.com"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-[#0284c7] focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. Telepon / HP</label>
                  <input
                    type="text"
                    value={formTelepon}
                    onChange={(e) => setFormTelepon(e.target.value)}
                    placeholder="+62 812..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:ring-1 focus:ring-[#0284c7] focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded cursor-pointer transition-all"
                >
                  {editingSupplier ? "Simpan Perubahan" : "Simpan Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADVANCED FILE UPLOAD & DATA PASTE PORTAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full border border-slate-200 dark:border-slate-850 shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-100 dark:bg-sky-950 text-[#0284c7] dark:text-sky-400 rounded">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-white">
                    Fasilitas Impor & Upload Data Bulk
                  </h3>
                  <p className="text-[10px] text-slate-400">Import database supplier atau rekaman data penilaian kinerja dengan cepat.</p>
                </div>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inner Content Area - Scrollable */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* Type Selection */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setUploadTab("supplier");
                    setParsedPreview(null);
                    setPasteData("");
                  }}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                    uploadTab === "supplier" 
                      ? "border-[#0284c7] text-[#0284c7] dark:text-sky-400" 
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Impor Daftar Supplier
                </button>
                <button
                  onClick={() => {
                    setUploadTab("evaluation");
                    setParsedPreview(null);
                    setPasteData("");
                  }}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                    uploadTab === "evaluation" 
                      ? "border-[#0284c7] text-[#0284c7] dark:text-sky-400" 
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Impor Rekor Penilaian Kinerja
                </button>
              </div>

              {/* Drag and Drop Zone or Manual Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 space-y-3.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode 1: Unggah Berkas</p>
                  
                  {/* Drag drop zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                      dragActive 
                        ? "border-[#0284c7] bg-sky-50/40 dark:bg-sky-950/20" 
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
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Tarik & Lepas file di sini</p>
                    <p className="text-[10px] text-slate-400 mt-1">atau klik untuk memilih dari komputer Anda</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        <FileSpreadsheet className="w-3 h-3 text-[#0284c7]" /> Excel (.xlsx/.xls)
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        <FileSpreadsheet className="w-3 h-3 text-emerald-500" /> .CSV
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        <FileJson className="w-3 h-3 text-amber-500" /> .JSON
                      </span>
                    </div>
                  </div>

                  {/* Template download and instructions */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded border border-slate-100 dark:border-slate-800/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-sky-500" /> Petunjuk & File Template
                      </p>
                      <button
                        onClick={uploadTab === "supplier" ? downloadSupplierTemplateXLSX : downloadEvaluationTemplateXLSX}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs cursor-pointer transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Unduh Template .xlsx
                      </button>
                    </div>
                    
                    <p className="text-[9px] text-slate-400">Gunakan file template Excel di atas atau pastikan struktur kolom sesuai:</p>
                    
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-1.5 rounded text-[9px] font-mono border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 text-[8px] truncate mr-2">
                        {uploadTab === "supplier" ? "nama,kategoriBisnis,alamat,kontak,email,telepon" : "supplierNama,tahun,periode,integritas,kerjasama..."}
                      </span>
                      <button
                        onClick={() => {
                          const code = uploadTab === "supplier" ? supplierCsvTemplate : evaluationCsvTemplate;
                          navigator.clipboard.writeText(code);
                          alert("Template CSV disalin ke papan klip!");
                        }}
                        className="text-[#0284c7] hover:underline shrink-0 font-bold"
                      >
                        Salin CSV
                      </button>
                    </div>

                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-1.5 rounded text-[9px] font-mono border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 text-[8px]">JSON Format Array Template</span>
                      <button
                        onClick={() => {
                          const code = uploadTab === "supplier" ? supplierJsonTemplate : evaluationJsonTemplate;
                          navigator.clipboard.writeText(code);
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
                    placeholder={
                      uploadTab === "supplier" 
                        ? "Tempel baris CSV atau kode JSON di sini...\nContoh:\nnama,kategoriBisnis,alamat,kontak,email,telepon\nPT Abadi Jaya,Konsultan Mekanikal,Jl. Sudirman,Jaka,jaka@abadi.com,+62812"
                        : "Tempel data evaluasi..."
                    }
                    className="w-full flex-1 p-3 text-[10px] font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-800 dark:text-slate-100 leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Upload Messages & Validation Indicators */}
              {uploadError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs rounded flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Gagal Membaca Data</p>
                    <p className="text-[10px] mt-0.5 leading-relaxed">{uploadError}</p>
                  </div>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs rounded flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                  <div>
                    <p className="font-bold">Validasi Berhasil!</p>
                    <p className="text-[10px] mt-0.5 leading-relaxed">{uploadSuccess}</p>
                  </div>
                </div>
              )}

              {/* Data Import Preview Table */}
              {parsedPreview && parsedPreview.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden space-y-2">
                  <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Preview 3 Baris Pertama Data Yang Akan Diimpor</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead>
                        <tr className="bg-slate-100/50 dark:bg-slate-900/80 text-slate-500">
                          {uploadTab === "supplier" ? (
                            <>
                              <th className="py-2 px-3">Nama</th>
                              <th className="py-2 px-3">Kategori</th>
                              <th className="py-2 px-3">PIC</th>
                              <th className="py-2 px-3">Email</th>
                              <th className="py-2 px-3">Telepon</th>
                            </>
                          ) : (
                            <>
                              <th className="py-2 px-3">Nama Supplier</th>
                              <th className="py-2 px-3 text-center">Tahun</th>
                              <th className="py-2 px-3 text-center">Periode</th>
                              <th className="py-2 px-3 text-center">Skor Kinerja</th>
                              <th className="py-2 px-3">PO No.</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedPreview.slice(0, 3).map((item, i) => (
                          <tr key={i}>
                            {uploadTab === "supplier" ? (
                              <>
                                <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{item.nama}</td>
                                <td className="py-2 px-3">{item.kategoriBisnis}</td>
                                <td className="py-2 px-3">{item.kontak || "-"}</td>
                                <td className="py-2 px-3">{item.email || "-"}</td>
                                <td className="py-2 px-3">{item.telepon || "-"}</td>
                              </>
                            ) : (
                              <>
                                <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{item.supplierNama}</td>
                                <td className="py-2 px-3 text-center">{item.tahun}</td>
                                <td className="py-2 px-3 text-center">{item.periode}</td>
                                <td className="py-2 px-3 text-center font-bold text-sky-600">
                                  {item.integritas || 4.0} (Avg)
                                </td>
                                <td className="py-2 px-3 font-mono">{item.noPo || "-"}</td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedPreview.length > 3 && (
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 text-center text-[9px] text-slate-400">
                      Dan {parsedPreview.length - 3} baris data lainnya...
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-40 disabled:cursor-not-allowed rounded cursor-pointer transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Impor ({parsedPreview ? parsedPreview.length : 0} Item)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
