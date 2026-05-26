import React, { useState } from "react";
import { User, Shield, Bell, CheckCircle2, Award, ClipboardList, ShieldAlert, KeyRound } from "lucide-react";
import { User as UserType } from "../types";
import { DOCTOR_PORTRAIT_URL } from "../data";

interface ProfileTabProps {
  user: UserType;
  onUpdateUser: (updated: UserType) => void;
}

export default function ProfileTab({ user, onUpdateUser }: ProfileTabProps) {
  // Local state form elements
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [license, setLicense] = useState(user.license);
  const [specialty, setSpecialty] = useState(user.specialty);

  // Toggle checks states
  const [alertHighRisk, setAlertHighRisk] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [autoSaveRecords, setAutoSaveRecords] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      const updatedUser: UserType = {
        ...user,
        name: name,
        email: email,
        license: license,
        specialty: specialty
      };

      onUpdateUser(updatedUser);

      // Hide success banner after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start font-sans">
      
      {/* Sidebar: Doctor info card & stats */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Doctor Info Card */}
        <div className="glassmorphism rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(0,240,255,0.04)] p-6 flex flex-col items-center text-center overflow-hidden relative">
          
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-r from-primary/20 to-primary-dark/20 border-b border-primary/20"></div>
 
          <div className="relative mt-6 z-10">
            <div className="w-24 h-24 rounded-full border-4 border-slate-950 overflow-hidden shadow-lg shadow-black/80">
              <img
                src={DOCTOR_PORTRAIT_URL}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Status Indicator */}
            <span className="absolute bottom-1 right-1 bg-emerald-500 border-2 border-slate-950 w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse" title="Colegiado Activo"></span>
          </div>
 
          <h3 className="text-base font-bold font-display text-text-main mt-4 leading-normal uppercase tracking-wider">
            {user.name}
          </h3>
          <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest mt-1">
            {user.specialty}
          </p>
 
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-3 py-1 rounded-md border border-emerald-500/30 mt-3.5 shadow-sm">
            <Award className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>COLEGIADO VERIFICADO</span>
          </div>
 
          <p className="text-xs text-text-secondary mt-4 leading-relaxed max-w-xs border-t border-slate-800 pt-4 font-mono">
            Licencia: <strong className="font-bold text-primary neon-glow">{user.license}</strong>
          </p>
        </div>
 
        {/* Clinical Statistics Counter */}
        <div className="glassmorphism rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(0,240,255,0.04)] p-6 flex flex-col gap-4">
          <h4 className="text-[10px] font-mono font-bold text-primary tracking-widest uppercase">Métricas del Operador</h4>
          
          <div className="grid grid-cols-2 gap-4">
            
            <div className="bg-slate-950/80 p-4 rounded-xl border border-primary/25 flex flex-col gap-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
              <ClipboardList className="w-5 h-5 text-primary mb-1" />
              <span className="text-2xl font-bold text-text-main font-mono leading-none">{user.analyses}</span>
              <span className="text-[9px] font-bold font-mono text-primary uppercase mt-1">Análisis IA</span>
            </div>
 
            <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/25 flex flex-col gap-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-2xl font-bold text-text-main font-mono leading-none">{user.precision}%</span>
              <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase mt-1">Tasa Precisión</span>
            </div>
 
          </div>
        </div>
 
      </div>
 
      {/* Main Panel: Account Forms & Settings */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {saveSuccess && (
          <div className="p-4 bg-emerald-500/5 text-emerald-200 border border-emerald-500/20 rounded-xl text-xs font-mono font-bold flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>[EXPEDIENTE ACTUALIZADO] Los datos de su perfil profesional han sido archivados de forma segura.</span>
          </div>
        )}
 
        {/* Configuration Form */}
        <div className="glassmorphism rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(0,240,255,0.04)] p-6">
          <h2 className="text-sm font-display font-bold text-text-main uppercase tracking-widest text-primary neon-glow">Configuración Profesional</h2>
          <p className="text-xs text-text-secondary mt-1 font-mono">Modifique las credenciales y datos de su perfil institucional</p>
 
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary ml-1 font-mono" htmlFor="prof-name">Nombre Completo</label>
                <input
                  id="prof-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary/25 rounded-lg text-sm text-text-main outline-none transition-all placeholder:text-text-secondary/50"
                  required
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary ml-1 font-mono" htmlFor="prof-license">Nº de Colegiado</label>
                <input
                  id="prof-license"
                  type="text"
                  value={license}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-text-secondary disabled:opacity-60 cursor-not-allowed font-mono"
                  title="Para rectificar su ID de colegiado, contacte al administrador de seguridad"
                />
              </div>
 
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary ml-1 font-mono" htmlFor="prof-email">Correo Institucional</label>
                <input
                  id="prof-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary/25 rounded-lg text-sm text-text-main outline-none transition-all placeholder:text-text-secondary/50"
                  required
                />
              </div>
 
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary ml-1 font-mono" htmlFor="prof-specialty">Área Médica</label>
                <select
                  id="prof-specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary/25 rounded-lg text-sm text-text-main outline-none transition-all cursor-pointer"
                >
                  <option value="Dermatología Clínica" className="bg-slate-950 text-text-main">Dermatología Clínica</option>
                  <option value="Dermatología General" className="bg-slate-950 text-text-main">Dermatología General</option>
                  <option value="Oncología Cutánea" className="bg-slate-950 text-text-main">Oncología Cutánea</option>
                  <option value="Medicina General" className="bg-slate-950 text-text-main">Medicina General</option>
                  <option value="Investigación Científica" className="bg-slate-950 text-text-main">Investigación Científica</option>
                </select>
              </div>
 
            </div>
 
            {/* Custom save button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/45 font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-75 cursor-pointer"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
 
        </div>
 
        {/* Clinical Rules and Preferences Switches */}
        <div className="glassmorphism rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(0,240,255,0.04)] p-6">
          <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-1 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <span>Monitoreo Clínico y Operación</span>
          </h3>
          <p className="text-xs text-text-secondary font-mono mt-1">Configure la automatización y alertas globales de telemetría</p>
 
          <div className="space-y-4 mt-6">
            
            <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 hover:bg-slate-950/75 hover:border-slate-800 transition-all duration-300">
              <div className="max-w-md">
                <h4 className="text-xs font-bold font-mono text-text-main flex items-center gap-1.5 uppercase">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Notificaciones de Alto Riesgo
                </h4>
                <p className="text-xs text-text-secondary mt-1 leading-normal">
                  Alertas instantáneas y reportes destacados cuando se identifiquen lesiones consistentes con Melanoma u otros tumores neoplásicos de riesgo ALTO o maligno.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={alertHighRisk}
                  onChange={(e) => setAlertHighRisk(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-main after:border-slate-800 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
 
            <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 hover:bg-slate-950/75 hover:border-slate-800 transition-all duration-300">
              <div className="max-w-md">
                <h4 className="text-xs font-bold font-mono text-text-main flex items-center gap-1.5 uppercase">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Compilaciones Médicas Semanales
                </h4>
                <p className="text-xs text-text-secondary mt-1 leading-normal">
                  Reciba de manera segura estadísticas resumidas, tasas ponderadas de precisión diagnóstica de soporte y volúmenes semanales registrados.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={weeklyReports}
                  onChange={(e) => setWeeklyReports(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-main after:border-slate-800 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
 
            <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 hover:bg-slate-950/75 hover:border-slate-800 transition-all duration-300">
              <div className="max-w-md">
                <h4 className="text-xs font-bold font-mono text-text-main flex items-center gap-1.5 uppercase">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Auto-resguardo de Historial
                </h4>
                <p className="text-xs text-text-secondary mt-1 leading-normal">
                  Acepta registrar y resguardar en el storage local cifrado cada caso clínico nuevo concluido en su sesión de forma automatizada.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSaveRecords}
                  onChange={(e) => setAutoSaveRecords(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-main after:border-slate-800 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
 
          </div>
        </div>
 
        {/* Security Access Simulated panel */}
        <div className="glassmorphism rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(0,240,255,0.04)] p-6">
          <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-1 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            <span>Seguridad y Privacidad (2FA MOCK)</span>
          </h3>
          <p className="text-xs text-text-secondary font-mono mt-1">Administre el cifrado de su firma digital compatible con regulaciones de salud</p>
          <div className="flex flex-wrap gap-4 mt-5">
            <button
              onClick={() => alert("Simulando: Protocolo de restablecimiento emitido. Revise sus llaves de seguridad en su e-mail.")}
              className="px-4 py-2 border border-slate-800 text-text-secondary hover:text-primary hover:border-primary/45 bg-slate-900/40 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer"
            >
              Cambiar Contraseña
            </button>
            <button
              onClick={() => alert("Simulando: Filtro de autenticación biométrica de doble factor (2FA) inicializado.")}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer"
            >
              Doble Factor Biométrico (2FA)
            </button>
          </div>
        </div>
 
      </div>
 
    </div>
  );
}
