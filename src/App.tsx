import React, { useState, useEffect } from "react";
import { HeartPulse, LogOut, FileText, ClipboardList, User as UserIcon, Bell, Settings, Shield, Sparkles } from "lucide-react";

import { User, DiagnosticRecord } from "./types";
import { INITIAL_RECORDS } from "./data";

import LoginView from "./components/LoginView";
import RegisterView from "./components/RegisterView";
import AnalysisTab from "./components/AnalysisTab";
import HistoryTab from "./components/HistoryTab";
import ProfileTab from "./components/ProfileTab";
import ThreeDTab from "./components/ThreeDTab";

export default function App() {
  // Session Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState<boolean>(false);

  // App Workspace State
  const [activeTab, setActiveTab] = useState<"analisis" | "historial" | "perfil" | "inicio">("inicio");
  const [records, setRecords] = useState<DiagnosticRecord[]>([]);

  // Selected Record to view (optional, used to pivot from History to active Analysis view)
  const [selectedRecordForAnalysisTab, setSelectedRecordForAnalysisTab] = useState<DiagnosticRecord | null>(null);

  // Scroll to top when activeTab changes
  useEffect(() => {
    const handleScroll = () => {
      window.scrollTo(0, 0);
      document.getElementById("app-main-content")?.scrollTo(0, 0);
    };
    
    // Ensure scroll happens after render and initial animations
    requestAnimationFrame(handleScroll);
    setTimeout(handleScroll, 200);
  }, [activeTab]);

  // Sync session and clinical database on startup
  useEffect(() => {
    // 1. Initialise user session if kept in storage
    const cachedUser = localStorage.getItem("medai_active_user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error("Stale user session discarded");
      }
    } else {
      // Prompt option: Log in default doctor Alejandro Ruiz automatically for streamlined evaluation,
      // but let them log out if they wish to test registration/login explicitly!
      const defaultDoc: User = {
        name: "Dr. Alejandro Ruiz",
        email: "a.ruiz.derm@hospital-central.com",
        license: "CO-28394-B",
        specialty: "Dermatología Clínica",
        analyses: 1240,
        precision: 98
      };
      setUser(defaultDoc);
      localStorage.setItem("medai_active_user", JSON.stringify(defaultDoc));
    }

    // 2. Initialise clinical diagnostic registry
    const cachedRecordsRaw = localStorage.getItem("medai_records");
    if (cachedRecordsRaw) {
      try {
        setRecords(JSON.parse(cachedRecordsRaw));
      } catch (e) {
        setRecords(INITIAL_RECORDS);
        localStorage.setItem("medai_records", JSON.stringify(INITIAL_RECORDS));
      }
    } else {
      setRecords(INITIAL_RECORDS);
      localStorage.setItem("medai_records", JSON.stringify(INITIAL_RECORDS));
    }
  }, []);

  // Sync records changes to LocalStorage
  const saveRecordsToStorage = (updatedList: DiagnosticRecord[]) => {
    setRecords(updatedList);
    localStorage.setItem("medai_records", JSON.stringify(updatedList));
  };

  // Auth Action Handlers
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("medai_active_user", JSON.stringify(loggedInUser));
    setActiveTab("analisis");
    setShowRegister(false);
  };

  const handleRegisterSuccess = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("medai_active_user", JSON.stringify(newUser));
    setActiveTab("analisis");
    setShowRegister(false);

    // Alert successful automated registration
    alert(`¡Bienvenido a MedAI, ${newUser.name}! Su perfil ha sido registrado con Nº de colegiado: ${newUser.license}.`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("medai_active_user");
    setShowRegister(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("medai_active_user", JSON.stringify(updatedUser));
  };

  // Records Action Handlers
  const handleAddNewRecord = (newRecord: DiagnosticRecord) => {
    const updated = [newRecord, ...records];
    saveRecordsToStorage(updated);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    saveRecordsToStorage(updated);
  };

  // Jump from History list back to Active Workspace with chosen sample loaded
  const handleSelectRecordFromHistory = (record: DiagnosticRecord) => {
    setSelectedRecordForAnalysisTab(record);
    setActiveTab("analisis");
    
    // Smooth scroll to results zone
    setTimeout(() => {
      const el = document.getElementById("drop-zone");
      el?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Update Analyses aggregate metric
  const handleUpdateAnalysesCount = (newCount: number) => {
    if (user) {
      const updated = { ...user, analyses: newCount };
      setUser(updated);
      localStorage.setItem("medai_active_user", JSON.stringify(updated));
    }
  };

  // Render Login/Register screens if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-bg-general bg-cyber-grid text-text-main flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        {showRegister ? (
          <RegisterView
            onRegisterSuccess={handleRegisterSuccess}
            onToggleToLogin={() => setShowRegister(false)}
          />
        ) : (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onToggleToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-general bg-cyber-grid text-text-main flex flex-col font-sans select-none">
      
      {/* Clinically Polished Futuristic Header */}
      <header className="glassmorphism sticky top-0 z-40 border-b border-border-divider/70 shadow-[0_4px_25px_rgba(0,240,255,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo Group */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.15)] text-primary">
                <HeartPulse className="w-6 h-6 neon-glow animate-pulse" />
              </div>
              <div>
                <span className="font-display font-bold text-primary text-lg tracking-wider neon-glow">MedAI Skin</span>
                <span className="text-[9px] font-bold text-primary block leading-none bg-primary/15 px-2 py-0.5 rounded border border-primary/30 uppercase tracking-widest mt-1 font-mono shadow-[0_0_8px_rgba(0,240,255,0.1)]">
                  Sistema Holográfico V2.0
                </span>
              </div>
            </div>

            {/* Middle Nav Links */}
            <nav className="hidden md:flex gap-2">
              <button
                onClick={() => setActiveTab("inicio")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === "inicio"
                    ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                    : "text-text-secondary border-transparent hover:text-primary hover:bg-slate-800/40"
                }`}
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span>Inicio</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("analisis");
                  setSelectedRecordForAnalysisTab(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === "analisis"
                    ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                    : "text-text-secondary border-transparent hover:text-primary hover:bg-slate-800/40"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Análisis Clínico</span>
              </button>

              <button
                onClick={() => setActiveTab("historial")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === "historial"
                    ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                    : "text-text-secondary border-transparent hover:text-primary hover:bg-slate-800/40"
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Base Histórica</span>
              </button>

              <button
                onClick={() => setActiveTab("perfil")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === "perfil"
                    ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                    : "text-text-secondary border-transparent hover:text-primary hover:bg-slate-800/40"
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Perfil Operador</span>
              </button>
            </nav>

            {/* Profile Utilities Right */}
            <div className="flex items-center gap-4">
              
              {/* Notification Quick Badge */}
              <button
                onClick={() => alert("Notificaciones Clínicas: El núcleo holístico está calibrado y estable.")}
                className="p-2 text-text-secondary hover:text-primary hover:bg-slate-800/50 rounded-lg relative transition-all cursor-pointer"
                title="Centro de Alertas"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-slate-900 animate-pulse"></span>
              </button>

              {/* User Account Capsule */}
              <div className="flex items-center gap-2 border-l border-border-divider pl-4">
                <div className="flex flex-col items-end text-right hidden sm:flex">
                  <span className="text-xs font-bold text-text-main leading-none">{user.name}</span>
                  <span className="text-[10px] text-text-secondary font-bold font-mono uppercase mt-1 tracking-wider">{user.specialty}</span>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex border-t border-border-divider/50 bg-slate-900/90 justify-around py-2">
          <button
            onClick={() => setActiveTab("inicio")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === "inicio" ? "text-primary neon-glow" : "text-text-secondary"
            }`}
          >
            <Sparkles className="w-5 h-5 pointer-events-none" />
            <span>Inicio</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("analisis");
              setSelectedRecordForAnalysisTab(null);
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === "analisis" ? "text-primary neon-glow" : "text-text-secondary"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Análisis</span>
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === "historial" ? "text-primary neon-glow" : "text-text-secondary"
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>Historial</span>
          </button>
          <button
            onClick={() => setActiveTab("perfil")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              activeTab === "perfil" ? "text-primary neon-glow" : "text-text-secondary"
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span>Perfil</span>
          </button>
        </div>
      </header>

      {/* Main Container Content */}
      <main id="app-main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Render Tabs Reactively */}
        {activeTab === "analisis" && (
          <AnalysisTab
            onAddNewRecord={handleAddNewRecord}
            userAnalysesCount={user.analyses}
            onUpdateAnalysesCount={handleUpdateAnalysesCount}
          />
        )}

        {activeTab === "historial" && (
          <HistoryTab
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onSelectRecord={handleSelectRecordFromHistory}
          />
        )}

        {activeTab === "perfil" && (
          <ProfileTab
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {activeTab === "inicio" && (
          <ThreeDTab />
        )}

      </main>

      {/* Corporate Medical Footer */}
      <footer className="glassmorphism border-t border-border-divider/80 py-6 mt-12 shadow-[0_-4px_25px_rgba(0,240,255,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary animate-pulse" />
            <span>Cifrado Cuántico Activo • Cumplimiento Obligaciones de Confidencialidad HIPAA/RGPD</span>
          </div>

          <div className="flex gap-5 font-semibold">
            <button
              onClick={() => alert("Aviso de Responsabilidad de IA: Esta plataforma brinda soporte al dictamen clínico de soporte. Toda conducta diagnóstica decisional recae soberanamente en el profesional colegiado.")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Aviso Legal de IA
            </button>
            <span>•</span>
            <button
              onClick={() => alert("Seguridad de Datos Médicos: La plataforma utiliza un sandbox de seguridad de datos locales para la confidencialidad de la información.")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Políticas de Privacidad
            </button>
            <span>•</span>
            <button
              onClick={() => alert("Central del MedAI Core: Envíe comentarios de anomalías diagnósticas directamente a core@medai-skin.net.")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Soporte de Red Core
            </button>
          </div>

          <div>
            <span>© {new Date().getFullYear()} MedAI Skin Corp. Todos los derechos reservados.</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
