/**
 * Core clinical interfaces and data types for MedAI Skin.
 */

export interface User {
  id_usuario?: number;
  name: string;
  email: string;
  license: string;
  specialty: string;
  analyses: number;
  precision: number;
  rol?: "usuario" | "admin";
}

export type RiskLevel = "bajo" | "moderado" | "alto";

export interface DiagnosticRecord {
  id: string;
  nombre_amigable: string;
  clave: string;
  codigo_icd10: string;
  nivel_riesgo: RiskLevel;
  confianza: number;
  explicacion: string;
  recomendacion: string[];
  aviso_legal: string;
  fecha: string;
  imagen: string; // Base64 data or image URL
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}
