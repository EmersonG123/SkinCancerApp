import React, { useState } from "react";
import { Search, Filter, Trash2, Calendar, FileText, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { DiagnosticRecord } from "../types";

interface HistoryTabProps {
  records: DiagnosticRecord[];
  onDeleteRecord: (id: string) => void;
  onSelectRecord: (record: DiagnosticRecord) => void;
}

export default function HistoryTab({ records, onDeleteRecord, onSelectRecord }: HistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("all");

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.nombre_amigable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.codigo_icd10.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = selectedRisk === "all" || rec.nivel_riesgo === selectedRisk;

    return matchesSearch && matchesRisk;
  });

  // Map risk levels to visual attributes
  const getSeverityBadge = (risk: string) => {
    switch (risk) {
      case "alto":
        return "bg-red-500/10 text-red-400 border border-red-500/30 font-mono text-[10px] uppercase p-1 px-2";
      case "moderado":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/30 font-mono text-[10px] uppercase p-1 px-2";
      case "bajo":
      default:
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] uppercase p-1 px-2";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "alto": return "RIESGO ALTO";
      case "moderado": return "MODERADO";
      case "bajo": return "BAJO RIESGO";
      default: return risk;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      
      {/* Search and Filters Section */}
      <div className="glassmorphism rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(0,240,255,0.04)] p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por hallazgo (ej. Melanoma), ICD-10 o ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all placeholder:text-text-secondary/50"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto justify-end">
          {/* Risk Filter */}
          <div className="relative flex-grow md:flex-grow-0 min-w-[150px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              <Filter className="w-4 h-4" />
            </span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-750 text-xs text-text-main font-semibold rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/25 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-950 text-text-main">Todos los Riesgos</option>
              <option value="alto" className="bg-slate-950 text-text-main">Alto Riesgo</option>
              <option value="moderado" className="bg-slate-950 text-text-main">Riesgo Moderado</option>
              <option value="bajo" className="bg-slate-950 text-text-main">Bajo Riesgo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Clinical Report Cards */}
      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="glassmorphism rounded-2xl border border-primary/15 hover:border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.02)] hover:shadow-[0_0_25px_rgba(0,240,255,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              
              {/* Header Image Area with Risk Overlay */}
              <div className="relative h-44 bg-slate-950 overflow-hidden border-b border-slate-800/80 flex items-center justify-center">
                <img
                  src={rec.imagen}
                  alt={rec.nombre_amigable}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 opacity-80"
                />
                
                {/* Risk Level Badge Absolute overlay */}
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm ${getSeverityBadge(rec.nivel_riesgo)}`}>
                  {getRiskLabel(rec.nivel_riesgo)}
                </span>

                {/* Patient Session Code overlay */}
                <span className="absolute bottom-3 left-3 bg-slate-950/95 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-[9px] font-mono tracking-wider backdrop-blur-xs">
                  ID: #{rec.id}
                </span>
              </div>

              {/* Main Info */}
              <div className="p-5 flex-grow flex flex-col gap-3">
                
                <div className="flex gap-2 items-start justify-between">
                  <h3 className="text-sm font-semibold text-text-main font-display leading-tight uppercase tracking-wider">
                    {rec.nombre_amigable}
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded-md whitespace-nowrap">
                    {rec.codigo_icd10}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-mono">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{rec.fecha}</span>
                </div>

                <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed mt-1 text-justify">
                  {rec.explicacion}
                </p>

                {/* Progress Mini Bar */}
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/80">
                  <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono mb-1">
                    <span>CONFIANZA DE TELEMETRÍA</span>
                    <span className="font-bold text-primary neon-glow">{rec.confianza}%</span>
                  </div>
                  <div className="w-full bg-slate-900 border border-slate-800/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        rec.nivel_riesgo === "alto" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : rec.nivel_riesgo === "moderado" ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      }`}
                      style={{ width: `${rec.confianza}%` }}
                    ></div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3.5 bg-slate-950/70 border-t border-slate-800/85 flex items-center justify-between gap-3 text-xs">
                
                <button
                  onClick={() => onSelectRecord(rec)}
                  className="text-primary hover:text-primary-dark font-mono uppercase tracking-wider text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Cargar Ficha</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`¿Confirma eliminar permanentemente el caso clínico #${rec.id} (${rec.nombre_amigable}) del historial de telemetría?`)) {
                      onDeleteRecord(rec.id);
                    }
                  }}
                  className="text-text-secondary hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all cursor-pointer"
                  title="Eliminar Reporte"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
              
            </div>
          ))}
        </div>
      ) : (
        /* Empty Case view */
        <div className="glassmorphism rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(0,240,255,0.04)] p-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto my-6 font-mono">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner border border-primary/30">
            <AlertCircle className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">EXPEDIENTES AUSENTES</h3>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed max-w-sm">
            Ningún reporte dermatológico clínico coincide con los criterios de búsqueda actuales. Reduzca la especificidad del filtro o realice un nuevo diagnóstico.
          </p>
          <button
            onClick={() => setSearchTerm("") || setSelectedRisk("all")}
            className="mt-5 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Restaurar Filtros de Red
          </button>
        </div>
      )}

      {/* Pagination Footer Representation */}
      <div className="flex justify-between items-center text-[11px] text-text-secondary mt-2 border-t border-slate-850 pt-4 font-mono">
        <span>Mostrando {filteredRecords.length} de {records.length} reportes resguardados</span>
        <span>Página 1 de 1</span>
      </div>

    </div>
  );
}
