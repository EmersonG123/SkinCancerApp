import React, { useState } from "react";
import { User, Lock, HeartPulse } from "lucide-react";
import { User as UserType } from "../types";
import { api, saveSession } from "../services/api";

interface RegisterViewProps {
  onRegisterSuccess: (user: UserType) => void;
  onToggleToLogin: () => void;
}

export default function RegisterView({ onRegisterSuccess, onToggleToLogin }: RegisterViewProps) {
  const [name, setName] = useState("");
  const [license, setLicense] = useState("");
  const [specialty, setSpecialty] = useState("dermatology");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !license.trim() || !email.trim() || !password.trim()) {
      setError("Por favor, rellene todos los campos requeridos para continuar.");
      return;
    }

    if (!acceptedTerms) {
      setError("Debe aceptar los términos y condiciones de privacidad de datos médicos.");
      return;
    }

    setIsLoading(true);

    try {
      // Registramos en el backend real
      await api.register({
        nombre: name.startsWith("Dr.") ? name : `Dr. ${name}`,
        email,
        password,
        license,
        specialty,
      });

      // Login automático tras el registro
      const loginResponse = await api.login(email.toLowerCase().trim(), password);
      saveSession(loginResponse.token, loginResponse.usuario);
      onRegisterSuccess(loginResponse.usuario);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="register-container" className="registration-card glassmorphism w-full max-w-[500px] rounded-2xl p-8 border border-primary/20 shadow-[0_0_30px_rgba(0,240,255,0.08)] my-8">
      {/* Brand & Header */}
      <div className="text-center mb-6 w-full">
        <div className="flex items-center justify-center gap-2 mb-4">
          <HeartPulse className="text-primary w-10 h-10 neon-glow animate-pulse" />
          <span className="font-display text-2xl font-bold text-primary tracking-widest uppercase neon-glow">MedAI Skin</span>
        </div>
        <h1 className="text-xl font-display font-semibold text-text-main mb-1 tracking-wider">Crear Cuenta Clínica</h1>
        <p className="text-xs text-text-secondary font-mono">Únete a la red digital de diagnóstico dermatológico</p>
      </div>

      {error && (
        <div className="p-3 mb-4 text-xs text-red-400 bg-red-500/10 rounded-lg border border-red-500/30 font-mono" role="alert">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4 font-sans">
        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-text-secondary ml-1 font-mono uppercase tracking-wider" htmlFor="reg-name">
            Nombre Completo del Operador
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-mono">■</span>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Dr. Alejandro García"
              className="w-full pl-8 pr-4 py-2.5 bg-slate-950/75 border border-slate-700 rounded-lg text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Medical License */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary ml-1 font-mono uppercase tracking-wider" htmlFor="reg-license">
              Nº Colegiado / ID
            </label>
            <input
              id="reg-license"
              type="text"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              placeholder="12345678"
              className="w-full px-4 py-2.5 bg-slate-950/75 border border-slate-700 rounded-lg text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all"
              required
              disabled={isLoading}
            />
          </div>

          {/* Specialty */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary ml-1 font-mono uppercase tracking-wider" htmlFor="reg-specialty">
              Especialidad Core
            </label>
            <select
              id="reg-specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all cursor-pointer"
              disabled={isLoading}
            >
              <option value="dermatology" className="bg-slate-950 text-text-main">Dermatología</option>
              <option value="general" className="bg-slate-950 text-text-main">Medicina General</option>
              <option value="oncology" className="bg-slate-950 text-text-main">Oncología</option>
              <option value="research" className="bg-slate-950 text-text-main">Investigación</option>
            </select>
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-text-secondary ml-1 font-mono uppercase tracking-wider" htmlFor="reg-email">
            Identidad de Correo
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">@</span>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@hospital.com"
              className="w-full pl-8 pr-4 py-2.5 bg-slate-950/75 border border-slate-700 rounded-lg text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-text-secondary ml-1 font-mono uppercase tracking-wider" htmlFor="reg-password">
            Clave de Seguridad
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-mono">■</span>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-8 pr-4 py-2.5 bg-slate-950/75 border border-slate-700 rounded-lg text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="reg-terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-primary border-slate-700 bg-slate-900/60 rounded focus:ring-0 cursor-pointer"
            disabled={isLoading}
          />
          <label className="text-xs text-text-secondary leading-snug cursor-pointer font-mono" htmlFor="reg-terms">
            Acepto los{" "}
            <button
              type="button"
              onClick={() => alert("Términos Clínicos de Privacidad: Toda la información de lesiones queda amparada bajo el régimen local y cifrado SHA-256 de MedAI Skin.")}
              className="text-primary font-medium hover:underline inline"
            >
              términos y condiciones
            </button>{" "}
            de privacidad médica y el procesamiento confidencial de telemetrías cutáneas.
          </label>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/45 text-sm font-bold uppercase tracking-wider rounded-lg active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Creando expediente en Red..." : "Dar de Alta Expediente"}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center text-sm">
        <p className="text-text-secondary pb-1">
          ¿Ya tiene credenciales?{" "}
          <button
            onClick={onToggleToLogin}
            className="text-primary font-bold hover:underline font-mono"
          >
            Inicie sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}
