import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Activity, ShieldCheck, HeartPulse } from "lucide-react";
import { User } from "../types";
import { api, saveSession } from "../services/api";

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onToggleToRegister: () => void;
}

export default function LoginView({ onLoginSuccess, onToggleToRegister }: LoginViewProps) {
  const [email, setEmail] = useState("emerson@gmail.com");
  const [password, setPassword] = useState("eng947750");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Por favor, complete todos los campos de acceso.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.login(email.toLowerCase().trim(), password);
      // Guardar token JWT y datos en sesión local
      saveSession(response.token, response.usuario);
      onLoginSuccess(response.usuario);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-container" className="w-full max-w-[440px] z-10 animate-fade-in my-12">
      <div className="glassmorphism rounded-2xl p-8 border border-primary/20 shadow-[0_0_30px_rgba(0,240,255,0.08)]">
        
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-xl mb-3 shadow-[0_0_15px_rgba(0,240,255,0.2)] text-primary">
            <HeartPulse className="w-7 h-7 neon-glow animate-pulse" />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary tracking-widest uppercase neon-glow">MedAI Skin</h1>
        </div>

        {/* Header Section */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-display font-semibold text-text-main mb-1 tracking-wider">Acceso de Operador</h2>
          <p className="text-xs text-text-secondary font-mono">Autentique clave para inicializar MedAI Core</p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs text-red-400 bg-red-500/10 rounded-lg border border-red-500/30 font-mono" role="alert">
            {error}
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary block ml-1 font-mono uppercase tracking-wider" htmlFor="email-input">
              Identidad de Correo
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                <Mail className="w-5 h-5" />
              </span>
              <input
                id="email-input"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@hospital-central.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950/75 text-text-main text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all duration-200"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary block ml-1 font-mono uppercase tracking-wider" htmlFor="password-input">
              Clave de Seguridad Encendida
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="password-input"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-700 bg-slate-950/75 text-text-main text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all duration-200"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-slate-800 text-primary bg-slate-900/60 focus:ring-0 cursor-pointer"
              />
              <span className="text-text-secondary group-hover:text-text-main transition-colors font-mono">Recordarme</span>
            </label>
            <button
              type="button"
              onClick={() => alert("Simulación Core: Clave de contingencia temporal enviada a su terminal clínica vinculada.")}
              className="text-primary/90 hover:text-primary font-mono transition-colors"
            >
              ¿Olvidó contraseña?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/45 text-sm font-bold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.1)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Inicializando Sistema...</span>
              </>
            ) : (
              <>
                <span>Montar Interfaz</span>
                <span className="text-[14px]">➔</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-[1px] flex-grow bg-slate-800"></div>
          <span className="text-[10px] font-bold text-primary/70 tracking-wider uppercase font-mono">Acceso Clínico Cifrado</span>
          <div className="h-[1px] flex-grow bg-slate-800"></div>
        </div>

        {/* Registration Link */}
        <div className="text-center text-sm">
          <p className="text-text-secondary">
            ¿Sin acceso aún?{" "}
            <button
              onClick={onToggleToRegister}
              className="text-primary font-bold hover:underline decoration-2 underline-offset-4 font-mono transition-all"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 flex justify-center items-center gap-6 text-text-secondary opacity-80 font-mono">
        <div className="flex items-center gap-1.5 text-xs">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span>Fiducia SHA-256</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Activity className="w-5 h-5 text-primary" />
          <span>MedAI Core HIPAA</span>
        </div>
      </div>
    </div>
  );
}
