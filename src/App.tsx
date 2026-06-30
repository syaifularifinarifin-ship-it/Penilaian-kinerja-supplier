/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SupplierProvider, useSuppliers } from "./context/SupplierContext";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DashboardView from "./components/DashboardView";
import InputPenilaianView from "./components/InputPenilaianView";
import RekapitulasiView from "./components/RekapitulasiView";
import RaportView from "./components/RaportView";
import SupplierDatabaseView from "./components/SupplierDatabaseView";
import UnitDatabaseView from "./components/UnitDatabaseView";
import SettingsView from "./components/SettingsView";
import LoginView from "./components/LoginView";

function MainLayout() {
  const { activeTab } = useSuppliers();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Render active component based on context tab
  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "suppliers":
        return <SupplierDatabaseView />;
      case "units":
        return <UnitDatabaseView />;
      case "input":
        return <InputPenilaianView />;
      case "rekap":
        return <RekapitulasiView />;
      case "raport":
        return <RaportView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-hidden font-sans">
      
      {/* Navigation Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Dynamic Topbar Header */}
        <Topbar 
          onMenuToggle={() => setSidebarOpen(true)} 
        />

        {/* Scrollable Page Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 focus:outline-hidden">
          {renderActiveView()}
        </main>

      </div>

    </div>
  );
}

function AppContent() {
  const { isLoggedIn } = useSuppliers();

  if (!isLoggedIn) {
    return <LoginView />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <SupplierProvider>
      <AppContent />
    </SupplierProvider>
  );
}
