import React, { useState, useRef, useEffect } from "react";
import { Upload, Info, AlertTriangle, Printer, Share2, Bot, Send, CheckCircle2, Loader2 } from "lucide-react";
import { DiagnosticRecord, ChatMessage } from "../types";
import { PREVIEW_IMAGE_URL } from "../data";

interface AnalysisTabProps {
  onAddNewRecord: (record: DiagnosticRecord) => void;
  userAnalysesCount: number;
  onUpdateAnalysesCount: (newCount: number) => void;
}

export default function AnalysisTab({ onAddNewRecord, userAnalysesCount, onUpdateAnalysesCount }: AnalysisTabProps) {
  // Loaded image preview state
  const [selectedImage, setSelectedImage] = useState<string>(PREVIEW_IMAGE_URL);
  const [fileName, setFileName] = useState<string>("lesion_paciente_default.jpg");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Active diagnostic result state
  const [diagnosis, setDiagnosis] = useState<DiagnosticRecord>({
    id: "AI-98234-X",
    nombre_amigable: "Melanoma Maligno",
    clave: "mel",
    codigo_icd10: "C43.9",
    nivel_riesgo: "alto",
    confianza: 94.2,
    explicacion: "La imagen presenta bordes irregulares, asimetría marcada en dos ejes perpendiculares y policromía (variación de tonos marrones y negros antracita), patrones altamente asociados con lesiones melanocíticas malignas según el protocolo ABCDE clínico.",
    recomendacion: [
      "Remisión urgente a dermatología quirúrgica para biopsia escisional diagnóstica.",
      "Realizar dermatoscopia digital computarizada e inmunohistoquímica.",
      "Evitar exposición solar directa en la zona y aplicar bloqueador FPS 50+."
    ],
    aviso_legal: "AVISO LEGAL: Esta herramienta utiliza IA como apoyo al diagnóstico clínico. No sustituye el juicio de un profesional médico. Los resultados deben ser validados por un dermatólogo colegiado antes de proceder con cualquier tratamiento.",
    fecha: "25 de May, 2026",
    imagen: PREVIEW_IMAGE_URL
  });

  // Chat bot states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "greet-1",
      sender: "assistant",
      text: "Hola, soy el asistente IA de MedAI. He analizado los resultados diagnósticos de la lesión. ¿Tienes alguna duda sobre el nivel de riesgo alto obtenido, los criterios morfológicos o cuáles son los siguientes pasos clínicos?",
      timestamp: "05:30Z"
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Suggested dynamic chips for quick prompt questions
  const [suggestionChips, setSuggestionChips] = useState<string[]>([
    "¿Qué significa policromía en este caso?",
    "¿Cuáles son los márgenes de biopsia recomendados?",
    "¿Cuáles son las pautas del protocolo ABCDE?"
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // Adjust suggestion chips based on active diagnosis risk level
  useEffect(() => {
    if (diagnosis.nivel_riesgo === "alto") {
      setSuggestionChips([
        "¿Qué significa policromía en este caso?",
        "¿Cuáles son los márgenes de biopsia recomendados?",
        "¿Cuál es el siguiente paso para confirmar este Melanoma?"
      ]);
    } else if (diagnosis.nivel_riesgo === "moderado") {
      setSuggestionChips([
        "¿La Queratosis Seborreica puede malignizar?",
        "¿Es necesario retirar esta lesión?",
        "¿Qué sintomatología suele causar irritación?"
      ]);
    } else {
      setSuggestionChips([
        "¿Cuáles son las características clínicas de un Nevus Benigno?",
        "¿Cada cuánto tiempo se sugiere monitoreo clínico?",
        "¿Cuáles son las pautas de autoexploración ABCDE?"
      ]);
    }

    // Refresh default greeting from virtual bot with customized query recommendation
    setChatMessages([
      {
        id: "greet-" + Date.now(),
        sender: "assistant",
        text: `Hola, soy el asistente IA de MedAI. He analizado la imagen y detecté indicios de un posible **${diagnosis.nombre_amigable}** con un **${diagnosis.confianza}% de confianza** (nivel de riesgo: **${diagnosis.nivel_riesgo.toUpperCase()}**).\n\n¿Deseas debatir sobre este hallazgo, profundizar en el reporte analítico o consultar directrices de derivación terapéutica? Estamos listos para asistirle.`,
        timestamp: "05:30Z"
      }
    ]);
  }, [diagnosis.id]);

  // Handle local image file parsing and upload base64 scanning
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, seleccione un archivo con formato de imagen válido (JPG o PNG).");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    
    // Simulate uploading progress bar quickly
    setIsAnalyzing(true);
    setUploadProgress(10);
    
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 100);

    reader.onload = async (e) => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const base64Image = e.target?.result as string;
      setSelectedImage(base64Image);

      // Now invoke the real backend API route /api/analyze
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            image: base64Image,
            filename: file.name
          })
        });

        if (!response.ok) {
          throw new Error("La respuesta de la API no fue exitosa");
        }

        const data = await response.json();
        const randId = "AI-" + Math.floor(10000 + Math.random() * 90000) + "-X";
        const formattedDate = new Date().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });

        const newRecord: DiagnosticRecord = {
          id: randId,
          nombre_amigable: data.nombre_amigable,
          clave: data.clave,
          codigo_icd10: data.codigo_icd10,
          nivel_riesgo: data.nivel_riesgo as any,
          confianza: data.confianza,
          explicacion: data.explicacion,
          recomendacion: data.recomendacion,
          aviso_legal: data.aviso_legal,
          fecha: formattedDate,
          imagen: base64Image
        };

        // Complete analysis animation and save to active workspace state
        setTimeout(() => {
          setDiagnosis(newRecord);
          onAddNewRecord(newRecord);
          onUpdateAnalysesCount(userAnalysesCount + 1);
          setIsAnalyzing(false);
        }, 1200);

      } catch (err) {
        console.error("Error analyzing image file:", err);
        setIsAnalyzing(false);
        alert("Ocurrió un error al contactar al servidor de diagnóstico de IA. Reintentando proceso...");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const selectFileViaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  // Chat message submission
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    // Clear main chat input
    if (!customText) setChatInput("");

    // Add user bubble
    const userMsgId = "user-" + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages.map(m => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] })),
          lesionContext: {
            nombre_amigable: diagnosis.nombre_amigable,
            codigo_icd10: diagnosis.codigo_icd10,
            nivel_riesgo: diagnosis.nivel_riesgo,
            confianza: diagnosis.confianza,
            explicacion: diagnosis.explicacion
          }
        })
      });

      if (!response.ok) {
        throw new Error("Fallo en red");
      }

      const data = await response.json();
      
      setIsTyping(false);
      const assistantMsg: ChatMessage = {
        id: "assistant-" + Date.now(),
        sender: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, assistantMsg]);

    } catch (chatError) {
      console.error("Error sending query to chatbot API:", chatError);
      setIsTyping(false);
      
      const errMsg: ChatMessage = {
        id: "error-" + Date.now(),
        sender: "assistant",
        text: "Disculpe, colega. Estoy experimentando algunas dificultades técnicas internas de comunicación. En base a las directrices médicas generales, ante lesiones sospechosas le insto a seguir el protocolo clínico establecido.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, errMsg]);
    }
  };

  // Simulate print report trigger
  const triggerPrintReport = () => {
    window.print();
  };

  // Simulate social share trigger
  const triggerShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "MedAI Skin - Analítica de Paciente",
        text: `Caso médico ${diagnosis.id}: ${diagnosis.nombre_amigable} (${diagnosis.nivel_riesgo.toUpperCase()}) con un factor de confianza del ${diagnosis.confianza}%.`,
        url: window.location.href
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(`Reporte MedAI Skin ${diagnosis.id}: Diagnóstico clínico presuntivo para ${diagnosis.nombre_amigable} con ${diagnosis.confianza}% confianza.`);
      alert("Copiado al portapapeles: Enlace de expediente clínico seguro listo para transferir.");
    }
  };

  // Map risk colors dynamically
  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case "alto":
        return {
          bgBadge: "bg-red-500/10 text-red-400 border border-red-500/30 font-mono text-[10px] uppercase tracking-wider",
          textRisk: "text-red-400 neon-glow",
          progressColor: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
          bgText: "bg-red-500/15 text-red-400 border border-red-500/25",
          label: "RIESGO ALTO"
        };
      case "moderado":
        return {
          bgBadge: "bg-orange-500/10 text-orange-400 border border-orange-500/30 font-mono text-[10px] uppercase tracking-wider",
          textRisk: "text-orange-400 neon-glow",
          progressColor: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]",
          bgText: "bg-orange-500/15 text-orange-400 border border-orange-500/25",
          label: "RIESGO MODERADO"
        };
      case "bajo":
      default:
        return {
          bgBadge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] uppercase tracking-wider",
          textRisk: "text-emerald-400 neon-glow",
          progressColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
          bgText: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
          label: "RIESGO BAJO"
        };
    }
  };

  const currentStyles = getRiskStyles(diagnosis.nivel_riesgo);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative w-full items-start">
      
      {/* Left Column: Upload & Preview */}
      <div className="lg:col-span-7 flex flex-col gap-5 font-sans">
        
        {/* File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={selectFileViaInput}
          accept="image/png, image/jpeg"
          className="hidden"
        />

        <div className="glassmorphism rounded-2xl border border-primary/25 shadow-[0_0_20px_rgba(0,240,255,0.04)] p-6 overflow-hidden flex flex-col relative">
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-display font-bold text-text-main uppercase tracking-widest text-primary neon-glow">TELEMETRÍA DE ENTRADA</h2>
            <span className="text-[10px] font-bold text-primary font-mono px-3 py-1 bg-primary/10 border border-primary/25 rounded-md uppercase tracking-wider">
              Espectro: JPG, PNG
            </span>
          </div>
 
          {/* Upload Box Area */}
          <div
            id="drop-zone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group relative border border-dashed border-slate-700 hover:border-primary/80 rounded-xl transition-all duration-300 min-h-[380px] flex flex-col items-center justify-center bg-slate-950/70 cursor-pointer p-4 overflow-hidden shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]"
          >
            {/* Visual background image or upload icon depending on state */}
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Vista previa de lesión"
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-10 transition-opacity"
              />
            ) : null}
 
            <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-sm">
              <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all duration-300 shadow-lg">
                <Upload className="w-8 h-8 animate-pulse text-primary" />
              </div>
              <div>
                <p className="text-md font-display font-semibold text-text-main uppercase tracking-wider">
                  Arrastra o Carga Anatomía Cutánea
                </p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed font-mono">
                  Sitúe la lesión cutánea centrada para que el escáner neuronal pueda clasificar índices de asimetría, bordes y policromías de forma óptima.
                </p>
              </div>
              <button
                type="button"
                className="mt-3 bg-primary/10 hover:bg-primary/20 border border-primary/45 text-primary px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_10px_rgba(0,240,255,0.15)] active:scale-95 transition-all cursor-pointer"
              >
                Inyectar Imagen de Muestra
              </button>
            </div>
          </div>
 
          {/* Analysis Overlay with Linear Loader */}
          {isAnalyzing && (
            <div id="loading-overlay" className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 border-4 border-slate-800 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(0,240,255,0.15)]"></div>
              <p className="mt-4 text-sm font-display font-bold text-primary uppercase tracking-widest neon-glow">
                PROCESANDO RED NEURONAL...
              </p>
              <p className="text-[10px] text-text-secondary font-mono mt-1 uppercase tracking-wider">
                Extrayendo Mapas Diagnósticos ({uploadProgress}%)
              </p>
              
              {/* Process indicator bar */}
              <div className="w-48 bg-slate-900 border border-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(0,240,255,0.6)]" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>
 
        {/* Pro-Tip section */}
        <div className="bg-slate-900/50 rounded-xl p-4 flex gap-3 items-start border border-primary/15">
          <span className="p-1 bg-primary/10 rounded-lg text-primary mt-0.5 border border-primary/15 animate-pulse">
            <Info className="w-5 h-5 text-primary" />
          </span>
          <div className="flex-1 font-mono">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Estándar de Calibración Lumínica</h4>
            <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
              Para máxima precisión diagnóstica del MedAI Skin, mantenga una distancia focal de 10-15 cm, asegure un foco macro nítido y limpie residuos de geles refractivos o brillos directos.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Analysis Results & Chatbot panel */}
      <div className="lg:col-span-5 flex flex-col gap-6 font-sans">
        
        {/* Results Card */}
        <div className="glassmorphism rounded-2xl border border-primary/25 shadow-[0_0_25px_rgba(0,240,255,0.05)] p-6 flex flex-col gap-4">
          
          <div className="flex items-start justify-between gap-2 border-b border-border-divider/80 pb-3">
            <div>
              <h1 className="text-sm font-display font-bold uppercase tracking-widest text-text-main">Veredicto Neuronal</h1>
              <p className="text-[10px] font-mono text-text-secondary mt-1">SESIÓN ID: #{diagnosis.id}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider ${currentStyles.bgBadge}`}>
              {currentStyles.label}
            </span>
          </div>

          <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-mono font-bold text-text-secondary uppercase">Patología Clasificada</span>
              <span className={`text-sm font-bold font-mono tracking-tight ${currentStyles.textRisk}`}>
                {diagnosis.confianza}% Factor Confianza
              </span>
            </div>
            
            <h3 className="text-base font-bold text-text-main font-display uppercase tracking-wider">
              {diagnosis.nombre_amigable}
            </h3>
            
            <p className="text-[10px] font-bold text-primary/80 font-mono mt-1 capitalize">
              Código ICD-10 • {diagnosis.codigo_icd10}
            </p>

            {/* Simulated interactive progress bar matching specified risk level */}
            <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
              <div
                className={`${currentStyles.progressColor} h-full rounded-full transition-all duration-500`}
                style={{ width: `${diagnosis.confianza}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-xs text-text-secondary leading-relaxed">
            <div>
              <h4 className="font-bold text-text-main flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5 text-[11px] font-mono uppercase tracking-wider">
                <span className="text-primary neon-glow">■</span> Detalle de la Biomarcación
              </h4>
              <p className="text-text-secondary mt-1.5 text-xs text-justify">{diagnosis.explicacion}</p>
            </div>

            <div>
              <h4 className="font-bold text-text-main flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5 text-[11px] font-mono uppercase tracking-wider">
                <span className="text-primary neon-glow">■</span> Intervención Quirúrgica Directa
              </h4>
              <ul className="list-none text-text-secondary mt-2 space-y-2 pl-1 font-sans">
                {diagnosis.recomendacion.map((rec, i) => (
                  <li key={i} className="flex gap-2 items-start text-xs">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-1">
            <div className="bg-amber-500/5 text-amber-200 border border-amber-500/15 p-3 rounded-lg text-[10px] leading-relaxed flex gap-2 items-start font-mono">
              <span className="text-amber-500 text-xs font-bold flex-shrink-0 mt-0.5 animate-pulse">⚠️</span>
              <p className="text-justify leading-normal">
                <strong>{diagnosis.aviso_legal}</strong>
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-1 border-t border-border-divider/70">
            <button
              onClick={triggerPrintReport}
              className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/45 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.05)] cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-primary" />
              <span>Imprimir Ficha</span>
            </button>
            <button
              onClick={triggerShareLink}
              title="Compartir o copiar enlace"
              className="px-3.5 py-2.5 border border-slate-800 text-text-secondary rounded-lg bg-slate-900/60 hover:text-primary hover:border-primary/40 focus:outline-none transition-all flex items-center justify-center cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chatbot Widget Inline */}
        <div className="glassmorphism rounded-2xl border border-primary/25 shadow-[0_0_20px_rgba(0,240,255,0.03)] overflow-hidden flex flex-col h-[400px]">
          {/* Header */}
          <div className="bg-slate-950 border-b border-slate-850 px-4 py-3 text-text-main flex justify-between items-center shadow-[0_2px_15px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/35 shadow-[0_0_10px_rgba(0,240,255,0.15)] text-primary">
                <Bot className="w-4 h-4 text-primary neon-glow" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight font-mono uppercase tracking-wider text-primary neon-glow">MedAI Assistant</span>
                <span className="text-[9px] text-text-secondary font-mono leading-none">Agente de Soporte Dermatológico</span>
              </div>
            </div>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-[0_0_8px_rgba(0,240,255,1)]"></span>
            </span>
          </div>

          {/* Messages Wrapper */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 text-xs bg-slate-900/45 scrollbar-thin">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`${
                  msg.sender === "user"
                    ? "bg-slate-950 text-text-main border border-primary/30 self-end rounded-tl-xl rounded-tr-xs rounded-br-xl rounded-bl-xl shadow-[0_3px_15px_rgba(0,240,255,0.05)]"
                    : "bg-slate-900/90 text-text-main border border-slate-800 self-start rounded-tl-xs rounded-tr-xl rounded-br-xl rounded-bl-xl hover:border-slate-705 transition-colors"
                } p-3 max-w-[85%] leading-relaxed flex flex-col gap-1`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {/* Process simple bold highlights */}
                  {msg.text.split("\n\n").map((chunk, index) => {
                    return (
                      <p key={index} className="mb-1 last:mb-0">
                        {chunk.split("**").map((subchunk, subidx) => {
                          if (subidx % 2 === 1) {
                            return <strong key={subidx} className="font-bold text-primary neon-glow">{subchunk}</strong>;
                          }
                          return subchunk;
                        })}
                      </p>
                    );
                  })}
                </div>
                {msg.timestamp && (
                  <span
                    className={`text-[8px] text-right mt-1 font-mono ${
                      msg.sender === "user" ? "text-primary/65" : "text-text-secondary/65"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="bg-slate-900/90 text-text-secondary border border-slate-800 self-start rounded-xl p-3 flex items-center gap-1.5 shadow-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-[10px] font-mono italic">Analizando telemetría...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="p-2 border-t border-slate-800/80 bg-slate-950/70 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            {suggestionChips.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/25 rounded-full py-1 px-3 hover:bg-primary/20 hover:text-white hover:border-primary/50 transition-all cursor-pointer flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2 border-t border-slate-850 bg-slate-950 flex gap-2 items-center"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Pregunte detalles diagnósticos o márgenes quirúrgicos..."
              className="flex-grow border border-slate-800 focus:border-primary/40 focus:ring-0 text-xs font-sans text-text-main bg-slate-900/85 rounded-lg px-3 py-2 outline-none transition-all placeholder:text-text-secondary/60"
              disabled={isTyping}
            />
            <button
              type="submit"
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/35 p-2 rounded-lg transition-all flex items-center justify-center active:scale-95 disabled:opacity-40 cursor-pointer"
              disabled={isTyping || !chatInput.trim()}
            >
              <Send className="w-4 h-4 text-primary" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
