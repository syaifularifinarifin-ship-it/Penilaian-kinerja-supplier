/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useSuppliers } from "../context/SupplierContext";
import Logo from "./Logo";
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  FileSpreadsheet, 
  FileText, 
  X,
  Zap,
  UserCheck,
  Database,
  Cpu,
  Settings
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { activeTab, setActiveTab, userProfile, units } = useSuppliers();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      desc: "Ringkasan & Metrik Utama",
    },
    {
      id: "suppliers",
      label: "Database Supplier",
      icon: Database,
      desc: "Manajemen & Upload Data",
    },
    {
      id: "units",
      label: "Database Unit",
      icon: Cpu,
      desc: "Kode Unit & Loader Excel",
    },
    {
      id: "input",
      label: "Input Penilaian",
      icon: ClipboardCheck,
      desc: "Kuesioner & Evaluasi Kinerja",
    },
    {
      id: "rekap",
      label: "Rekapitulasi Penilaian",
      icon: FileSpreadsheet,
      desc: "Tabel Data & Manajemen CRUD",
    },
    {
      id: "raport",
      label: "Raport Supplier",
      icon: FileText,
      desc: "Laporan Resmi Cetak",
    },
    {
      id: "settings",
      label: "Pengaturan User",
      icon: Settings,
      desc: "Profil & Keamanan Sandi",
    },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onClose(); // Close mobile sidebar if open
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-72 bg-[#0c4a6e] text-white border-r border-[#0e5a84] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:h-screen no-print`}
      >
        {/* Branding Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#0e5a84] bg-[#0a3f5e]">
          <Logo variant="white" height={36} />
          
          {/* Mobile close button */}
          <button 
            onClick={onClose}
            className="p-1 text-sky-200 hover:text-white lg:hidden rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors group cursor-pointer ${
                  isActive 
                    ? "bg-[#0369a1] text-white font-medium shadow-xs" 
                    : "text-sky-100 hover:bg-[#075985] hover:text-white"
                }`}
              >
                <div className={`p-1 rounded-md transition-colors ${
                  isActive 
                    ? "bg-sky-400 text-white" 
                    : "text-sky-200 group-hover:text-white"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-tight">{item.label}</p>
                  <p className={`text-[9px] ${isActive ? "text-sky-200" : "text-sky-300/70"}`}>
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info: User logged-in session */}
        <div className="p-4 border-t border-[#0e5a84] bg-[#093a57]">
          <button 
            onClick={() => handleTabClick("settings")}
            className="w-full text-left flex items-center gap-3 p-2 rounded-lg bg-[#0c4a6e]/50 border border-[#0e5a84]/40 hover:bg-[#0c4a6e]/80 hover:border-sky-500/50 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-sky-400/20 text-sky-200 flex items-center justify-center font-extrabold text-xs border border-sky-400/30 group-hover:bg-sky-400/30 transition-colors">
              {userProfile.nama ? userProfile.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "US"}
            </div>
            <div className="truncate text-[11px] flex-1">
              <p className="font-bold text-white flex items-center gap-1 group-hover:text-sky-200 transition-colors">
                {userProfile.nama}
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/10" />
              </p>
              <p className="text-[10px] text-sky-300/80 truncate">{userProfile.email}</p>
              <p className="text-[9px] text-sky-200/90 font-bold tracking-tight truncate mt-0.5 flex items-center gap-1">
                🏢 {units.find(u => u.id === userProfile.unitId)?.nama || "Semua Unit"}
              </p>
            </div>
          </button>
        </div>

      </aside>
    </>
  );
}
