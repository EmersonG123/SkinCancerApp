import React, { useState } from "react";
import { HeartPulse, Shield, Activity, Clock, Database, ChevronDown, CheckCircle2, Image as ImageIcon, Send, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] bg-cyber-grid text-white overflow-x-hidden font-sans selection:bg-primary/30">
      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <nav className="fixed w-full z-50 glassmorphism border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.2)] text-primary relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/20 scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full" />
                <HeartPulse className="w-7 h-7 neon-glow animate-pulse relative z-10" />
              </div>
              <div>
                <span className="font-display font-bold text-white text-xl tracking-wider group-hover:text-primary transition-colors">SkinCancer <span className="text-primary neon-glow">IA</span></span>
                <span className="text-[10px] text-text-secondary block tracking-widest uppercase font-mono">Detección Temprana</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold text-text-secondary hover:text-white transition-colors">Características</a>
              <a href="#how-it-works" className="text-sm font-semibold text-text-secondary hover:text-white transition-colors">¿Cómo funciona?</a>
              <a href="#faq" className="text-sm font-semibold text-text-secondary hover:text-white transition-colors">FAQ</a>
              <a href="#contact" className="text-sm font-semibold text-text-secondary hover:text-white transition-colors">Contacto</a>
              <button 
                onClick={onLoginClick}
                className="ml-4 bg-primary/10 border border-primary/50 text-primary px-6 py-2.5 rounded-xl font-bold hover:bg-primary hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center gap-2 group"
              >
                Iniciar Sesión
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ──────────────────────────────────────── */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden flex items-center min-h-[90vh]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
            <Shield className="w-4 h-4" />
            Precisión Diagnóstica Asistida por IA
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-8 leading-tight">
            Detecta lesiones cutáneas<br />
            con el apoyo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">Inteligencia Artificial</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
            Obtén un análisis rápido y preciso de imágenes dermatoscópicas para apoyar la detección temprana del cáncer de piel. Una plataforma segura, diseñada exclusivamente para profesionales de la salud.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="bg-primary text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Comenzar Ahora <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#features"
              className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-md w-full sm:w-auto"
            >
              Conocer más
            </a>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS (FEATURES) ─────────────────────────────── */}
      <section id="features" className="py-24 relative bg-slate-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Beneficios de la Plataforma</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Nuestra red neuronal procesa imágenes clínicas al instante, entregando métricas de confianza vitales para su decisión médica.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Activity, title: "Análisis Seguro", desc: "Clasificador DenseNet201 con más de 90% de exactitud diagnóstica en 7 clases." },
              { icon: Clock, title: "Resultados Inmediatos", desc: "Latencia menor a 2 segundos desde la subida de la imagen hasta el reporte." },
              { icon: Database, title: "Historial Clínico", desc: "Registro inmutable de todos sus análisis previos asociados a su cuenta." },
              { icon: CheckCircle2, title: "Reportes Automáticos", desc: "Sugerencias de manejo clínico y diagnósticos diferenciales integrados." }
            ].map((Feature, i) => (
              <div key={i} className="bg-slate-800/40 border border-white/5 p-8 rounded-2xl hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{Feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{Feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">¿Cómo funciona?</h2>
              <p className="text-text-secondary mb-12 text-lg">Un flujo de trabajo optimizado que respeta el valioso tiempo de la consulta médica.</p>
              
              <div className="space-y-8">
                {[
                  { num: "01", title: "Inicie Sesión", desc: "Acceda a su entorno privado y seguro con sus credenciales médicas." },
                  { num: "02", title: "Suba una Imagen", desc: "Cargue una imagen dermatoscópica de la lesión sospechosa del paciente." },
                  { num: "03", title: "Procesamiento IA", desc: "Nuestro modelo PyTorch extrae las características visuales en tiempo real." },
                  { num: "04", title: "Visualice Resultados", desc: "Obtenga el nivel de riesgo, la clase predicha y guías de derivación clínica." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center font-mono font-bold text-primary">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{step.title}</h4>
                      <p className="text-text-secondary">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {/* Simulated UI Window */}
                <div className="bg-slate-900 h-10 border-b border-white/5 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="bg-slate-800 p-8 aspect-video flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-cyber-grid opacity-50" />
                  <div className="relative z-10 text-center">
                    <ImageIcon className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                    <div className="h-2 w-48 bg-slate-700 rounded-full overflow-hidden mx-auto mb-2">
                      <div className="h-full bg-primary w-2/3" />
                    </div>
                    <p className="text-xs text-text-secondary font-mono">Analizando matriz de píxeles...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Preguntas Frecuentes</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { q: "¿La Inteligencia Artificial reemplaza al dermatólogo?", a: "En absoluto. SkinCancer IA es una herramienta de soporte a la decisión diagnóstica (CDSS) diseñada para médicos de atención primaria. Todo resultado requiere confirmación y biopsia por un dermatólogo especialista." },
              { q: "¿Qué tipo de imágenes puedo analizar?", a: "El sistema está optimizado para imágenes dermatoscópicas claras (iluminación uniforme y aumento adecuado). Acepta formatos JPG, PNG, WEBP y BMP." },
              { q: "¿Mis datos y los de mis pacientes están protegidos?", a: "Sí. Las imágenes subidas se anonimizan y procesan en servidores seguros. No conservamos metadatos identificativos (EXIF) de los pacientes y la base de datos de historiales cuenta con estrictas políticas de privacidad." }
            ].map((faq, i) => (
              <div key={i} className="border border-white/10 rounded-xl bg-slate-800/40 overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 flex items-center justify-between font-bold text-lg hover:bg-white/5 transition-colors text-left"
                >
                  {faq.q}
                  <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ${activeFaq === i ? "max-h-48 py-4 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="text-text-secondary">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACTO ───────────────────────────────────────────── */}
      <section id="contact" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glassmorphism border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="text-center mb-10">
              <h2 className="text-3xl font-display font-bold mb-4">¿Desea implementar SkinCancer IA en su clínica?</h2>
              <p className="text-text-secondary">Póngase en contacto con nuestro equipo técnico para licencias empresariales.</p>
            </div>

            <form className="space-y-6 relative z-10" onSubmit={(e) => { e.preventDefault(); alert('Mensaje enviado. Nos contactaremos pronto.'); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">Nombre Completo</label>
                  <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white" placeholder="Dr. Juan Pérez" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">Correo Electrónico</label>
                  <input type="email" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white" placeholder="doctor@clinica.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Mensaje</label>
                <textarea rows={4} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white resize-none" placeholder="¿Cómo podemos ayudarle?" required></textarea>
              </div>
              <button type="submit" className="w-full bg-primary/10 border border-primary/50 text-primary hover:bg-primary hover:text-black font-bold text-lg py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                Enviar Mensaje <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-border-divider/80 bg-[#060912] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center md:items-start text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <HeartPulse className="w-6 h-6 text-primary" />
                <span className="font-display font-bold text-white text-lg">SkinCancer IA</span>
              </div>
              <p className="text-text-secondary text-sm max-w-xs mx-auto md:mx-0">
                Llevando la precisión de la inteligencia artificial al consultorio dermatológico moderno.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <a href="#" className="hover:text-primary transition-colors">Acerca del Proyecto</a>
              <a href="#" className="hover:text-primary transition-colors">Documentación Clínica</a>
            </div>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <a href="#" className="hover:text-primary transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-primary transition-colors">Términos y Condiciones</a>
              <a href="#" className="hover:text-primary transition-colors">Contacto Técnico</a>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 text-center text-xs text-text-secondary">
            © {new Date().getFullYear()} SkinCancer IA Corp. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
