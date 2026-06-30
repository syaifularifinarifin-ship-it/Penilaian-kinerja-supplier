/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useSuppliers } from "../context/SupplierContext";
import { 
  Menu, 
  Sun, 
  Moon, 
  Map, 
  Cpu, 
  Globe, 
  Clock 
} from "lucide-react";

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const { activeTab, darkMode, setDarkMode } = useSuppliers();

  // Map Tab ID to Human Title
  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard Utama";
      case "suppliers":
        return "Database Supplier";
      case "units":
        return "Database Unit Pembangkit";
      case "input":
        return "Lembaran Evaluasi Baru";
      case "rekap":
        return "Rekapitulasi Satu Tahun";
      case "raport":
        return "Raport Penilaian Kinerja";
      case "settings":
        return "Pengaturan User & Keamanan";
      default:
        return "SIPEKS";
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between h-16 sticky top-0 z-30 no-print">
      
      {/* Left side: Hamburger (mobile) & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
            {getTabTitle()}
          </h1>
        </div>
      </div>

      {/* Right side: Dark Mode, Language, Current Time info */}
      <div className="flex items-center gap-4">
        
        {/* Indonesian Flag & IDR Currency Tag */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>IDR (Rp)</span>
        </div>

        {/* Real-time formatted Date badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{new Date().toLocaleDateString("id-ID", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 text-slate-500 hover:text-sky-600 dark:hover:text-amber-400 rounded hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors"
          title={darkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

      </div>

    </header>
  );
}
