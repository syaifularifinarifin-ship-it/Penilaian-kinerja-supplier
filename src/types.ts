/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AspectScores {
  integritas: number; // 15%
  kerjasama: number;  // 10%
  mutu: number;       // 15%
  waktu: number;      // 15%
  harga: number;      // 10%
  k3l: number;        // 20% (Manajemen K3 & Lingkungan)
  keamanan: number;   // 10% (Manajemen Keamanan & Komunikasi)
  energi: number;     // 5%  (Manajemen Energi)
}

export type AspectKey = keyof AspectScores;

export interface Supplier {
  id: string;
  nama: string;
  noVendorEllipse?: string; // No. Vendor Ellipse (PLN ERP System)
  kategoriBisnis: string; // e.g., "Bahan Bakar Batubara", "Suku Cadang Turbin", "Jasa Pemeliharaan"
  alamat: string;
  kontak: string;
  email: string;
  telepon: string;
}

export interface Evaluation {
  id: string;
  supplierId: string;
  supplierNama: string; // denormalized for easy lookup
  unitId?: string;      // designated Unit ID
  unitKode?: string;    // designated Unit Code
  unitNama?: string;    // designated Unit Name
  tahun: number;
  periode: string; // e.g., "Semester 1", "Semester 2", "Tahunan"
  scores: AspectScores;
  nilaiAkhir: number; // Weighted average (0 - 100)
  predikat: "Sangat Baik" | "Baik" | "Cukup" | "Kurang" | "Sangat Kurang";
  rekomendasi: string;
  evaluator: string;
  tanggalPenilaian: string;
  noPo?: string;
  deskripsiPo?: string;
  tanggalPo?: string;
  lampiranPdf?: string;
  lampiranNama?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface UserProfile {
  nama: string;
  email: string;
  role: string;
  unitId?: string;
  nid?: string;
}

export interface SystemUser {
  id: string;
  nama: string;
  email: string;
  role: "Administrator" | "Manajer Logistik" | "Evaluator Kinerja" | "Viewer / Staff";
  password?: string;
  canManageSuppliers: boolean;
  canManageUnits: boolean;
  canManageEvaluations: boolean;
  canManageUsers: boolean;
  unitId?: string;
  nid?: string;
}

export interface Unit {
  id: string;
  kode: string;
  nama: string;
}

export const ASPECT_WEIGHTS: Record<AspectKey, number> = {
  integritas: 0.15,
  kerjasama: 0.10,
  mutu: 0.15,
  waktu: 0.15,
  harga: 0.10,
  k3l: 0.20,
  keamanan: 0.10,
  energi: 0.05,
};

export const ASPECT_LABELS: Record<AspectKey, string> = {
  integritas: "Integritas",
  kerjasama: "Kerjasama",
  mutu: "Mutu",
  waktu: "Ketepatan Waktu",
  harga: "Kelayakan Harga",
  k3l: "Manajemen K3 & Lingkungan",
  keamanan: "Manajemen Keamanan & Komunikasi",
  energi: "Manajemen Energi",
};

export const ASPECT_EVALUATORS: Record<AspectKey, string> = {
  integritas: "Pengadaan",
  kerjasama: "Pengadaan",
  mutu: "Tim Pemeriksa Barang / Jasa",
  waktu: "Gudang",
  harga: "Pengadaan",
  k3l: "K3L",
  keamanan: "Bagian Keamanan",
  energi: "Bagian Energi",
};

export const ASPECT_DESCRIPTIONS: Record<AspectKey, string> = {
  integritas: "Jujur dalam segala informasi perusahaan\nTaat dan patuh terhadap peraturan dan etika yang berlaku di PLN NP Services dan Unit-unit yang dikelola\nTidak melakukan/berperilaku KKN\nTidak melakukan tindakan kriminal\nMempengaruhi orang lain untuk menegakkan aspek integritas",
  kerjasama: "Keaktifan dalam melayani permintaan informasi harga, mengikuti anwijzing, dan memasukan dokumen penawaran\nKeaktifan dalam menghadiri kegiatan PLN NP Services dan melakukan update informasi perusahaan (profil, produk, dll)\nKeterlibatan langsung pemilik dalam proses transaksi\nKemudahan untuk dihubungi (fast respon)\nAkurasi invoice, ketepatan waktu penagihan, profesionalisme, kompetensi staf Penyedia, serta layanan purna jual",
  mutu: "Kesesuaian dengan spesifikasi Perjanjian, pengiriman lengkap, dan memenuhi kualitas standar\nFleksibilitas dalam pelaksanaan pekerjaan serta keaktifan dalam memberikan masukan yang inovatif\nKoreksi, perbaikan permasalahan yang dihadapi dilakukan dengan cepat dan efektif\nPemenuhan dokumen penyerahan pekerjaan",
  waktu: "Ketepatan waktu pengiriman produk/penyelesaian pekerjaan\nKetepatan waktu penyerahan dokumen pendukung\nWork efficiency planned (efisiensi kerja terencana)",
  harga: "Harga penawaran terhadap HPS dan pendukung (jaminan penawaran jika diperlukan)\nHarga penawaran terhadap hasil negosiasi (Contract completed on budget/HPS)\nRincian penawaran harga (Financial aspect monitor & tracked)",
  k3l: "Jasa: Pemenuhan terhadap ketentuan CSMS yang berlaku dalam manajemen K3 dan lingkungan untuk pekerjaan jasa (kriteria penilaian sesuai CSMS)\nBarang: Pemenuhan terhadap ketentuan, peraturan dan perundangan yang berlaku dalam manajemen K3 dan lingkungan, atau ketentuan dalam perundangan lainnya termasuk pemenuhan kesanggupan dalam penyelesaian komplain",
  keamanan: "Pemenuhan terhadap ketentuan, peraturan dan perundangan yang berlaku dalam manajemen keamanan, baik itu terkait barang yang dikirim/hasil pekerjaan maupun perilaku Penyedia barang/jasanya\nMenjamin keamanan produk & jasa yang diberikan\nKomunikasi yang efektif dan terbuka",
  energi: "Pemenuhan terhadap ketentuan, peraturan dan perundangan yang berlaku dalam manajemen ENERGI, baik itu terkait barang yang dikirim/hasil pekerjaan maupun perilaku Penyedia barang/jasanya\nPemenuhan kesanggupan dan penyelesaian komplain",
};

export function calculateFinalScore(scores: AspectScores): number {
  let final = 0;
  for (const key in ASPECT_WEIGHTS) {
    const k = key as AspectKey;
    final += (scores[k] || 0) * ASPECT_WEIGHTS[k];
  }
  return Math.round(final);
}

export function getPredikatAndColor(score: number): {
  predikat: Evaluation["predikat"];
  color: string;
  bgColor: string;
  borderColor: string;
} {
  const roundedScore = Math.round(score);
  if (roundedScore >= 5 || score >= 4.25) {
    return {
      predikat: "Sangat Baik",
      color: "text-emerald-700 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    };
  } else if (roundedScore === 4 || score >= 3.5) {
    return {
      predikat: "Baik",
      color: "text-sky-700 dark:text-sky-400",
      bgColor: "bg-sky-50 dark:bg-sky-950/40",
      borderColor: "border-sky-200 dark:border-sky-800",
    };
  } else if (roundedScore === 3 || score >= 3.0) {
    return {
      predikat: "Cukup",
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-200 dark:border-amber-800",
    };
  } else if (roundedScore === 2 || score >= 2.5) {
    return {
      predikat: "Kurang",
      color: "text-orange-700 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/40",
      borderColor: "border-orange-200 dark:border-orange-800",
    };
  } else {
    return {
      predikat: "Sangat Kurang",
      color: "text-rose-700 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      borderColor: "border-rose-200 dark:border-rose-800",
    };
  }
}
