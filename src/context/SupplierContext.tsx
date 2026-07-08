/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, onSnapshot, setDoc, doc, deleteDoc, getDocs } from "firebase/firestore";
import { 
  Supplier, 
  Evaluation, 
  ActivityLog, 
  AspectScores, 
  Unit,
  UserProfile,
  SystemUser,
  calculateFinalScore, 
  getPredikatAndColor 
} from "../types";

interface SupplierContextProps {
  suppliers: Supplier[];
  evaluations: Evaluation[];
  activityLogs: ActivityLog[];
  units: Unit[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedPeriode: string;
  setSelectedPeriode: (periode: string) => void;
  selectedSupplierIdForRaport: string;
  setSelectedSupplierIdForRaport: (id: string) => void;
  editingEvaluation: Evaluation | null;
  setEditingEvaluation: (evaluation: Evaluation | null) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  
  // User Profile & Password Settings
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  appPassword: string;
  setAppPassword: React.Dispatch<React.SetStateAction<string>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  
  // User Accounts & Permissions (Hak Akses)
  systemUsers: SystemUser[];
  setSystemUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
  currentUser: SystemUser | null;
  setCurrentUser: (user: SystemUser | null) => void;
  addSystemUser: (user: Omit<SystemUser, "id">) => SystemUser;
  updateSystemUser: (user: SystemUser) => void;
  deleteSystemUser: (id: string) => void;
  hasPermission: (permission: "suppliers" | "units" | "evaluations" | "users") => boolean;
  
  // CRUD Suppliers
  addSupplier: (supplier: Omit<Supplier, "id">) => Supplier;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;

  // CRUD Evaluations
  addEvaluation: (evaluation: Omit<Evaluation, "id" | "nilaiAkhir" | "predikat">) => Evaluation;
  updateEvaluation: (evaluation: Evaluation) => void;
  deleteEvaluation: (id: string) => void;

  // CRUD Units
  addUnit: (unit: Omit<Unit, "id">) => Unit;
  updateUnit: (unit: Unit) => void;
  deleteUnit: (id: string) => void;

  // Logging
  addLog: (action: string, details: string) => void;
  clearLogs: () => void;
}

const SupplierContext = createContext<SupplierContextProps | undefined>(undefined);

// Initial Seed Data for Suppliers
const initialSuppliers: Supplier[] = [
  {
    id: "sup-1",
    nama: "PT Batubara Mulia Abadi",
    kategoriBisnis: "Penyedia Bahan Bakar Batubara",
    alamat: "Jl. Jenderal Sudirman No. 45, Jakarta Selatan",
    kontak: "Ir. Bambang Wijaya, M.T.",
    email: "bambang.w@batubaramulia.co.id",
    telepon: "+62 21 555 4321",
  },
  {
    id: "sup-2",
    nama: "PT Turbin Sinergi Nusantara",
    kategoriBisnis: "Suku Cadang & Pemeliharaan Turbin",
    alamat: "Kawasan Industri MM2100 Blok C-3, Cikarang",
    kontak: "Ir. Hendra Setiawan",
    email: "hendra.s@turbinsinergi.id",
    telepon: "+62 21 890 1234",
  },
  {
    id: "sup-3",
    nama: "PT Pompa Hidro Mekanika",
    kategoriBisnis: "Jasa Pemeliharaan Pompa & Katup",
    alamat: "Jl. Rungkut Industri Raya No. 12, Surabaya",
    kontak: "Ahmad Fauzi, S.T.",
    email: "ahmad.fauzi@hidromekanika.com",
    telepon: "+62 31 843 9876",
  },
  {
    id: "sup-4",
    nama: "CV Kaltim Lestari Safety",
    kategoriBisnis: "Alat Pelindung Diri & Peralatan K3L",
    alamat: "Jl. Mulawarman No. 88, Samarinda",
    kontak: "Siti Rahmawati",
    email: "siti.rahma@kaltimsafety.co.id",
    telepon: "+62 541 777 9090",
  },
  {
    id: "sup-5",
    nama: "PT Solusi Energi Hijau",
    kategoriBisnis: "Konsultan Manajemen Energi",
    alamat: "Graha Energi Lantai 15, SCBD, Jakarta",
    kontak: "Dr. Eng. Dian Pratama",
    email: "dian.pratama@solusienergi.id",
    telepon: "+62 21 250 8899",
  },
  {
    id: "sup-6",
    nama: "PT Siber Tekno Keamanan",
    kategoriBisnis: "Sistem IT, Security & Komunikasi",
    alamat: "Ruko Tekno No. 5, BSD City, Tangerang",
    kontak: "Rudi Hermawan, S.Kom.",
    email: "rudi@sibertekno.id",
    telepon: "+62 21 531 6789",
  },
  {
    id: "sup-7",
    nama: "CV Surya Abadi Teknik",
    kategoriBisnis: "Penyedia Kabel & Instrumen Kelistrikan",
    alamat: "Jl. Kramat Raya No. 102, Jakarta Pusat",
    kontak: "Agus Salim",
    email: "agus.salim@suryaabaditeknik.com",
    telepon: "+62 21 319 4455",
  }
];

// Initial Seed Data for Evaluations
const initialEvaluations: Evaluation[] = [
  {
    id: "eval-1",
    supplierId: "sup-1",
    supplierNama: "PT Batubara Mulia Abadi",
    tahun: 2026,
    periode: "Semester 1",
    scores: {
      integritas: 4.6,
      kerjasama: 4.25,
      mutu: 4.4,
      waktu: 4.0,
      harga: 4.25,
      k3l: 4.5,
      keamanan: 4.3,
      energi: 4.0,
    },
    nilaiAkhir: 4.33,
    predikat: "Sangat Baik",
    rekomendasi: "Sangat direkomendasikan untuk perpanjangan kontrak pengadaan batubara. Kepatuhan K3L sangat prima.",
    evaluator: "Syaiful Arifin (Manajer Logistik)",
    tanggalPenilaian: "2026-06-15",
    noPo: "PO/2026/00451",
    deskripsiPo: "Pengadaan Batubara Kalori Rendah 15.000 Ton",
    tanggalPo: "2026-01-10",
  },
  {
    id: "eval-2",
    supplierId: "sup-2",
    supplierNama: "PT Turbin Sinergi Nusantara",
    tahun: 2026,
    periode: "Semester 1",
    scores: {
      integritas: 4.25,
      kerjasama: 4.5,
      mutu: 4.6,
      waktu: 3.5,
      harga: 3.75,
      k3l: 4.25,
      keamanan: 4.4,
      energi: 4.25,
    },
    nilaiAkhir: 4.17,
    predikat: "Baik",
    rekomendasi: "Perlu ditekankan ketepatan waktu pengiriman suku cadang rotor turbin. Kualitas material sangat unggul.",
    evaluator: "Syaiful Arifin (Manajer Pemeliharaan)",
    tanggalPenilaian: "2026-06-18",
    noPo: "PO/2026/00512",
    deskripsiPo: "Suku Cadang Rotor Blade Turbin Generator Unit 2",
    tanggalPo: "2026-02-14",
  },
  {
    id: "eval-3",
    supplierId: "sup-3",
    supplierNama: "PT Pompa Hidro Mekanika",
    tahun: 2026,
    periode: "Semester 1",
    scores: {
      integritas: 4.0,
      kerjasama: 3.75,
      mutu: 3.6,
      waktu: 3.25,
      harga: 4.0,
      k3l: 3.0,
      keamanan: 3.5,
      energi: 3.25,
    },
    nilaiAkhir: 3.52,
    predikat: "Baik",
    rekomendasi: "Kontrak berjalan dapat diteruskan, namun wajib ada evaluasi berkala mengenai kelengkapan APD kru lapangan saat overhaul.",
    evaluator: "Syaiful Arifin (Superintendent Mekanik)",
    tanggalPenilaian: "2026-06-20",
    noPo: "PO/2026/00389",
    deskripsiPo: "Jasa Overhaul & Pemeliharaan Pompa Boiler Feed Pump C",
    tanggalPo: "2026-03-05",
  },
  {
    id: "eval-4",
    supplierId: "sup-4",
    supplierNama: "CV Kaltim Lestari Safety",
    tahun: 2026,
    periode: "Semester 1",
    scores: {
      integritas: 4.75,
      kerjasama: 4.75,
      mutu: 4.5,
      waktu: 4.6,
      harga: 4.4,
      k3l: 4.75,
      keamanan: 4.5,
      energi: 4.25,
    },
    nilaiAkhir: 4.63,
    predikat: "Sangat Baik",
    rekomendasi: "Mitra berkinerja luar biasa. Respon cepat, harga sangat bersaing, dan pemenuhan sertifikasi alat keselamatan lengkap.",
    evaluator: "Syaiful Arifin (Manajer K3L)",
    tanggalPenilaian: "2026-06-22",
    noPo: "PO/2026/00277",
    deskripsiPo: "Pengadaan Alat Pelindung Diri (APD) dan Safety Shoes",
    tanggalPo: "2026-04-01",
  },
  {
    id: "eval-5",
    supplierId: "sup-5",
    supplierNama: "PT Solusi Energi Hijau",
    tahun: 2026,
    periode: "Semester 1",
    scores: {
      integritas: 4.5,
      kerjasama: 4.0,
      mutu: 4.25,
      waktu: 4.25,
      harga: 3.5,
      k3l: 4.25,
      keamanan: 4.0,
      energi: 4.75,
    },
    nilaiAkhir: 4.23,
    predikat: "Baik",
    rekomendasi: "Kinerja baik dalam menyusun baseline audit energi pembangkit. Perlu peningkatan koordinasi rapat.",
    evaluator: "Syaiful Arifin (Manajer Efisiensi Energi)",
    tanggalPenilaian: "2026-06-24",
    noPo: "PO/2026/00199",
    deskripsiPo: "Jasa Konsultan Audit Energi Sektor 1-4 PLN NPS",
    tanggalPo: "2026-02-18",
  },
  {
    id: "eval-6",
    supplierId: "sup-6",
    supplierNama: "PT Siber Tekno Keamanan",
    tahun: 2026,
    periode: "Semester 1",
    scores: {
      integritas: 4.4,
      kerjasama: 4.1,
      mutu: 4.0,
      waktu: 4.0,
      harga: 4.1,
      k3l: 3.75,
      keamanan: 4.6,
      energi: 3.5,
    },
    nilaiAkhir: 4.1,
    predikat: "Baik",
    rekomendasi: "Pekerjaan migrasi firewall pembangkit berjalan aman. Komunikasi dan penanganan insiden siber berjalan cepat.",
    evaluator: "Syaiful Arifin (Manajer IT)",
    tanggalPenilaian: "2026-06-25",
    noPo: "PO/2026/00310",
    deskripsiPo: "Pembaruan Lisensi & Hardening Firewall Network Pembangkit",
    tanggalPo: "2026-03-12",
  },
  {
    id: "eval-7",
    supplierId: "sup-7",
    supplierNama: "CV Surya Abadi Teknik",
    tahun: 2026,
    periode: "Semester 1",
    scores: {
      integritas: 3.9,
      kerjasama: 3.5,
      mutu: 3.25,
      waktu: 3.0,
      harga: 3.6,
      k3l: 2.75,
      keamanan: 3.25,
      energi: 3.0,
    },
    nilaiAkhir: 3.27,
    predikat: "Cukup",
    rekomendasi: "Diberikan teguran tertulis pertama (SP-1) karena keterlambatan pengiriman kabel kontrol sejauh 14 hari, dan kurangnya kepatuhan APD teknisi.",
    evaluator: "Syaiful Arifin (Manajer Logistik)",
    tanggalPenilaian: "2026-06-27",
    noPo: "PO/2026/00602",
    deskripsiPo: "Pengadaan Kabel Kontrol NYY 4x10mm & Accessories Trafo",
    tanggalPo: "2026-05-02",
  },
  // 2025 Historical evaluations to show trend
  {
    id: "eval-2025-1",
    supplierId: "sup-1",
    supplierNama: "PT Batubara Mulia Abadi",
    tahun: 2025,
    periode: "Tahunan",
    scores: {
      integritas: 4.4,
      kerjasama: 4.0,
      mutu: 4.25,
      waktu: 4.1,
      harga: 4.1,
      k3l: 4.4,
      keamanan: 4.1,
      energi: 3.9,
    },
    nilaiAkhir: 4.21,
    predikat: "Baik",
    rekomendasi: "Evaluasi tahunan menunjukkan pengiriman batubara stabil dan kalori sesuai dengan nilai kontrak.",
    evaluator: "Admin Logistik",
    tanggalPenilaian: "2025-12-18",
  },
  {
    id: "eval-2025-2",
    supplierId: "sup-2",
    supplierNama: "PT Turbin Sinergi Nusantara",
    tahun: 2025,
    periode: "Tahunan",
    scores: {
      integritas: 4.3,
      kerjasama: 4.4,
      mutu: 4.5,
      waktu: 3.9,
      harga: 3.9,
      k3l: 4.1,
      keamanan: 4.25,
      energi: 4.0,
    },
    nilaiAkhir: 4.15,
    predikat: "Baik",
    rekomendasi: "Dapat dipertahankan untuk pemeliharaan Turbin Gas Blok 2.",
    evaluator: "Admin Pemeliharaan",
    tanggalPenilaian: "2025-12-20",
  }
];

// Initial Logs
const initialLogs: ActivityLog[] = [
  {
    id: "log-1",
    timestamp: "2026-06-29T08:00:00Z",
    user: "Syaiful Arifin",
    action: "Inisialisasi Sistem",
    details: "Sistem penilaian kinerja supplier berhasil dimuat dengan data awal.",
  }
];

// Initial Seed Data for Units
const initialUnits: Unit[] = [
  { id: "unit-1", kode: "U1", nama: "Unit 1" },
  { id: "unit-2", kode: "U2", nama: "Unit 2" },
  { id: "unit-3", kode: "U3", nama: "Unit 3" },
  { id: "unit-4", kode: "U4", nama: "Unit 4" }
];

// Initial Seed Data for System Users (with explicit permissions / hak akses)
const initialSystemUsers: SystemUser[] = [
  {
    id: "user-1",
    nama: "Syaiful Arifin",
    email: "syaiful.arifinarifin@gmail.com",
    role: "Administrator",
    password: "admin123",
    canManageSuppliers: true,
    canManageUnits: true,
    canManageEvaluations: true,
    canManageUsers: true,
    unitId: "", // All Units / Semua Unit
    nid: "NID19870512"
  },
  {
    id: "user-2",
    nama: "Hendra Setiawan",
    email: "hendra.s@turbinsinergi.id",
    role: "Manajer Logistik",
    password: "manajer123",
    canManageSuppliers: true,
    canManageUnits: true,
    canManageEvaluations: true,
    canManageUsers: false,
    unitId: "unit-1",
    nid: "NID19910405"
  },
  {
    id: "user-3",
    nama: "Ahmad Fauzi",
    email: "ahmad.fauzi@hidromekanika.com",
    role: "Evaluator Kinerja",
    password: "evaluator123",
    canManageSuppliers: false,
    canManageUnits: false,
    canManageEvaluations: true,
    canManageUsers: false,
    unitId: "unit-2",
    nid: "NID19930819"
  },
  {
    id: "user-4",
    nama: "Viewer Staff",
    email: "viewer@sipeks.id",
    role: "Viewer / Staff",
    password: "viewer123",
    canManageSuppliers: false,
    canManageUnits: false,
    canManageEvaluations: false,
    canManageUsers: false,
    unitId: "unit-3",
    nid: "NID19951231"
  }
];

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const local = localStorage.getItem("sipeks_suppliers");
    return local ? JSON.parse(local) : initialSuppliers;
  });

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    const local = localStorage.getItem("sipeks_evaluations");
    return local ? JSON.parse(local) : initialEvaluations;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const local = localStorage.getItem("sipeks_logs");
    return local ? JSON.parse(local) : initialLogs;
  });

  const [units, setUnits] = useState<Unit[]>(() => {
    const local = localStorage.getItem("sipeks_units");
    return local ? JSON.parse(local) : initialUnits;
  });

  // User Accounts & Permissions (Hak Akses)
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => {
    const local = localStorage.getItem("sipeks_systemUsers");
    return local ? JSON.parse(local) : initialSystemUsers;
  });

  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => {
    const local = localStorage.getItem("sipeks_currentUser");
    return local ? JSON.parse(local) : initialSystemUsers[0];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const local = localStorage.getItem("sipeks_userProfile");
    return local ? JSON.parse(local) : {
      nama: "Syaiful Arifin",
      email: "syaiful.arifinarifin@gmail.com",
      role: "Administrator",
      unitId: ""
    };
  });

  const [appPassword, setAppPassword] = useState<string>(() => {
    const local = localStorage.getItem("sipeks_appPassword");
    return local ? JSON.parse(local) : "admin123";
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const local = localStorage.getItem("sipeks_isLoggedIn");
    return local ? local === "true" : false;
  });

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedPeriode, setSelectedPeriode] = useState<string>("Semester 1");
  const [selectedSupplierIdForRaport, setSelectedSupplierIdForRaport] = useState<string>("sup-1");
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("sipeks_darkMode");
    return saved === "true";
  });

  // Firestore connection and seeding on first load
  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const settingsSnap = await getDocs(collection(db, "appSettings"));
        let hasSeeded = false;
        settingsSnap.forEach((doc) => {
          if (doc.id === "global" && doc.data().seeded) {
            hasSeeded = true;
          }
        });

        if (!hasSeeded) {
          console.log("Seeding initial data to Firestore...");
          for (const s of initialSuppliers) {
            await setDoc(doc(db, "suppliers", s.id), s);
          }
          for (const e of initialEvaluations) {
            await setDoc(doc(db, "evaluations", e.id), e);
          }
          for (const u of initialUnits) {
            await setDoc(doc(db, "units", u.id), u);
          }
          for (const u of initialSystemUsers) {
            await setDoc(doc(db, "systemUsers", u.id), u);
          }
          for (const l of initialLogs) {
            await setDoc(doc(db, "activityLogs", l.id), l);
          }
          await setDoc(doc(db, "appSettings", "global"), { seeded: true });
          console.log("Firestore Seeding complete!");
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "appSettings/global");
      }
    };

    checkAndSeed();
  }, []);

  // Listen for suppliers in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "suppliers"), (snapshot) => {
      if (!snapshot.empty) {
        const list: Supplier[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Supplier);
        });
        setSuppliers(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "suppliers");
    });
    return () => unsub();
  }, []);

  // Listen for evaluations in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "evaluations"), (snapshot) => {
      if (!snapshot.empty) {
        const list: Evaluation[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Evaluation);
        });
        setEvaluations(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "evaluations");
    });
    return () => unsub();
  }, []);

  // Listen for activityLogs in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "activityLogs"), (snapshot) => {
      if (!snapshot.empty) {
        const list: ActivityLog[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as ActivityLog);
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivityLogs(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "activityLogs");
    });
    return () => unsub();
  }, []);

  // Listen for units in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "units"), (snapshot) => {
      if (!snapshot.empty) {
        const list: Unit[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Unit);
        });
        setUnits(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "units");
    });
    return () => unsub();
  }, []);

  // Listen for systemUsers in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "systemUsers"), (snapshot) => {
      if (!snapshot.empty) {
        const list: SystemUser[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as SystemUser);
        });
        setSystemUsers(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "systemUsers");
    });
    return () => unsub();
  }, []);

  // Keep localStorage in sync for user session states
  useEffect(() => {
    localStorage.setItem("sipeks_userProfile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("sipeks_appPassword", JSON.stringify(appPassword));
  }, [appPassword]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("sipeks_currentUser", JSON.stringify(currentUser));
      setUserProfile({
        nama: currentUser.nama,
        email: currentUser.email,
        role: currentUser.role,
        unitId: currentUser.unitId,
        nid: currentUser.nid
      });
      if (currentUser.password) {
        setAppPassword(currentUser.password);
      }
    } else {
      localStorage.removeItem("sipeks_currentUser");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("sipeks_isLoggedIn", String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem("sipeks_darkMode", String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const addLog = (action: string, details: string) => {
    const newId = `log-${Date.now()}`;
    const newLog: ActivityLog = {
      id: newId,
      timestamp: new Date().toISOString(),
      user: `${userProfile.nama} (${userProfile.role})`,
      action,
      details,
    };
    setDoc(doc(db, "activityLogs", newId), newLog)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `activityLogs/${newId}`));
  };

  const clearLogs = () => {
    activityLogs.forEach(log => {
      deleteDoc(doc(db, "activityLogs", log.id))
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `activityLogs/${log.id}`));
    });
    addLog("Bersihkan Log", "Semua riwayat log aktivitas dibersihkan.");
  };

  // CRUD Suppliers
  const addSupplier = (supplierData: Omit<Supplier, "id">) => {
    const newId = `sup-${Date.now()}`;
    const newSupplier: Supplier = {
      ...supplierData,
      id: newId,
    };
    setDoc(doc(db, "suppliers", newId), newSupplier)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `suppliers/${newId}`));
    addLog("Tambah Supplier", `Menambahkan supplier baru: ${newSupplier.nama}`);
    return newSupplier;
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setDoc(doc(db, "suppliers", updatedSupplier.id), updatedSupplier)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `suppliers/${updatedSupplier.id}`));
    
    // Also denormalize evaluation supplierNama if updated
    evaluations.forEach(e => {
      if (e.supplierId === updatedSupplier.id) {
        setDoc(doc(db, "evaluations", e.id), {
          ...e,
          supplierNama: updatedSupplier.nama
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, `evaluations/${e.id}`));
      }
    });
    addLog("Update Supplier", `Memperbarui profil supplier: ${updatedSupplier.nama}`);
  };

  const deleteSupplier = (id: string) => {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;
    deleteDoc(doc(db, "suppliers", id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `suppliers/${id}`));
    
    evaluations.forEach(e => {
      if (e.supplierId === id) {
        deleteDoc(doc(db, "evaluations", e.id))
          .catch(err => handleFirestoreError(err, OperationType.DELETE, `evaluations/${e.id}`));
      }
    });
    addLog("Hapus Supplier", `Menghapus supplier: ${supplier.nama} beserta data penilaiannya.`);
  };

  // CRUD Evaluations
  const addEvaluation = (evalData: Omit<Evaluation, "id" | "nilaiAkhir" | "predikat">) => {
    const newId = `eval-${Date.now()}`;
    const nilaiAkhir = calculateFinalScore(evalData.scores);
    const { predikat } = getPredikatAndColor(nilaiAkhir);
    
    const newEvaluation: Evaluation = {
      ...evalData,
      id: newId,
      nilaiAkhir,
      predikat,
      tanggalPenilaian: evalData.tanggalPenilaian || new Date().toISOString().split("T")[0]
    };

    setDoc(doc(db, "evaluations", newId), newEvaluation)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `evaluations/${newId}`));
    addLog("Tambah Penilaian", `Menginput penilaian untuk ${newEvaluation.supplierNama} periode ${newEvaluation.periode} ${newEvaluation.tahun}`);
    return newEvaluation;
  };

  const updateEvaluation = (updatedEval: Evaluation) => {
    const nilaiAkhir = calculateFinalScore(updatedEval.scores);
    const { predikat } = getPredikatAndColor(nilaiAkhir);
    
    const finalEval: Evaluation = {
      ...updatedEval,
      nilaiAkhir,
      predikat
    };

    setDoc(doc(db, "evaluations", finalEval.id), finalEval)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `evaluations/${finalEval.id}`));
    addLog("Update Penilaian", `Memperbarui penilaian ${finalEval.supplierNama} periode ${finalEval.periode} ${finalEval.tahun}`);
  };

  const deleteEvaluation = (id: string) => {
    const evaluation = evaluations.find(e => e.id === id);
    if (!evaluation) return;
    deleteDoc(doc(db, "evaluations", id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `evaluations/${id}`));
    addLog("Hapus Penilaian", `Menghapus penilaian ${evaluation.supplierNama} periode ${evaluation.periode} ${evaluation.tahun}`);
  };

  // CRUD Units
  const addUnit = (unitData: Omit<Unit, "id">) => {
    const newId = `unit-${Date.now()}`;
    const newUnit: Unit = {
      ...unitData,
      id: newId
    };
    setDoc(doc(db, "units", newId), newUnit)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `units/${newId}`));
    addLog("Tambah Unit", `Menambahkan unit baru: [${newUnit.kode}] ${newUnit.nama}`);
    return newUnit;
  };

  const updateUnit = (updatedUnit: Unit) => {
    setDoc(doc(db, "units", updatedUnit.id), updatedUnit)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `units/${updatedUnit.id}`));
    addLog("Update Unit", `Memperbarui data unit: [${updatedUnit.kode}] ${updatedUnit.nama}`);
  };

  const deleteUnit = (id: string) => {
    const unit = units.find(u => u.id === id);
    if (!unit) return;
    deleteDoc(doc(db, "units", id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `units/${id}`));
    addLog("Hapus Unit", `Menghapus unit: [${unit.kode}] ${unit.nama}`);
  };

  // CRUD System Users (Hak Akses)
  const addSystemUser = (userData: Omit<SystemUser, "id">) => {
    const newId = `user-${Date.now()}`;
    const newUser: SystemUser = {
      id: newId,
      ...userData
    };
    setDoc(doc(db, "systemUsers", newId), newUser)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `systemUsers/${newId}`));
    addLog("Tambah Pengguna", `Menambahkan pengguna sistem baru: ${newUser.nama} (${newUser.role})`);
    return newUser;
  };

  const updateSystemUser = (updatedUser: SystemUser) => {
    setDoc(doc(db, "systemUsers", updatedUser.id), updatedUser)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `systemUsers/${updatedUser.id}`));
    addLog("Update Pengguna", `Memperbarui data pengguna: ${updatedUser.nama} (${updatedUser.role})`);
    
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const deleteSystemUser = (id: string) => {
    const userToDelete = systemUsers.find(u => u.id === id);
    if (!userToDelete) return;

    if (currentUser && currentUser.id === id) {
      alert("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.");
      return;
    }

    deleteDoc(doc(db, "systemUsers", id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `systemUsers/${id}`));
    addLog("Hapus Pengguna", `Menghapus pengguna: ${userToDelete.nama} (${userToDelete.role})`);
  };

  const hasPermission = (permission: "suppliers" | "units" | "evaluations" | "users"): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "Administrator") return true;

    switch (permission) {
      case "suppliers":
        return !!currentUser.canManageSuppliers;
      case "units":
        return !!currentUser.canManageUnits;
      case "evaluations":
        return !!currentUser.canManageEvaluations;
      case "users":
        return !!currentUser.canManageUsers;
      default:
        return false;
    }
  };

  return (
    <SupplierContext.Provider value={{
      suppliers,
      evaluations,
      activityLogs,
      units,
      activeTab,
      setActiveTab,
      selectedYear,
      setSelectedYear,
      selectedPeriode,
      setSelectedPeriode,
      selectedSupplierIdForRaport,
      setSelectedSupplierIdForRaport,
      editingEvaluation,
      setEditingEvaluation,
      darkMode,
      setDarkMode,
      setSuppliers,
      setEvaluations,
      setUnits,
      
      userProfile,
      setUserProfile,
      appPassword,
      setAppPassword,
      isLoggedIn,
      setIsLoggedIn,

      systemUsers,
      setSystemUsers,
      currentUser,
      setCurrentUser,
      addSystemUser,
      updateSystemUser,
      deleteSystemUser,
      hasPermission,
      
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addEvaluation,
      updateEvaluation,
      deleteEvaluation,
      addUnit,
      updateUnit,
      deleteUnit,
      
      addLog,
      clearLogs
    }}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error("useSuppliers must be used within a SupplierProvider");
  }
  return context;
};
