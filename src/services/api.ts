// src/services/api.ts – Cliente de API centralizado para MedAI Skin
import { User, DiagnosticRecord } from "../types";

const BASE_URL = "/api";

// Helper para normalizar la estructura del usuario
const normalizeUser = (u: any): User => {
  if (!u) return u;
  return {
    ...u,
    name: u.nombre || u.name || "Sin Nombre",
  };
};

// Obtener token JWT desde LocalStorage
const getToken = (): string | null => {
  return localStorage.getItem("medai_jwt_token");
};

// Guardar token JWT y datos de sesión
export const saveSession = (token: string, user: User) => {
  localStorage.setItem("medai_jwt_token", token);
  localStorage.setItem("medai_active_user", JSON.stringify(user));
};

// Limpiar sesión
export const clearSession = () => {
  localStorage.removeItem("medai_jwt_token");
  localStorage.removeItem("medai_active_user");
};

// Generar headers por defecto (JSON y Auth)
const getHeaders = (isMultipart = false) => {
  const token = getToken();
  const headers: Record<string, string> = {};
  
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

export const api = {
  // ── Autenticación ──────────────────────────────────────────
  async login(email: string, password: string): Promise<{ token: string; usuario: User }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || data.error || "Error al iniciar sesión.");
    }
    if (data.usuario) {
      data.usuario = normalizeUser(data.usuario);
    }
    return data;
  },

  async register(userData: {
    nombre: string;
    email: string;
    password: string;
    license: string;
    specialty: string;
  }): Promise<{ usuario: User }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || data.error || "Error al registrarse.");
    }
    if (data.usuario) {
      data.usuario = normalizeUser(data.usuario);
    }
    return data;
  },

  // ── Gestión de Usuarios (CRUD Admin) ────────────────────────
  async getUsuarios(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/usuarios`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || data.error || "Error al listar usuarios.");
    }
    return (data.usuarios || []).map(normalizeUser);
  },

  async crearUsuario(usuario: any): Promise<User> {
    const res = await fetch(`${BASE_URL}/usuarios`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(usuario),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || data.error || "Error al crear usuario.");
    }
    return normalizeUser(data.usuario);
  },

  async actualizarUsuario(idUsuario: number, usuario: any): Promise<User> {
    const res = await fetch(`${BASE_URL}/usuarios/${idUsuario}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(usuario),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || data.error || "Error al actualizar usuario.");
    }
    return normalizeUser(data.usuario);
  },

  async eliminarUsuario(idUsuario: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/usuarios/${idUsuario}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || data.error || "Error al eliminar usuario.");
    }
  },

  // ── Análisis Clínico (IA) ───────────────────────────────────
  async analizarImagen(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("imagen", file);

    const res = await fetch(`${BASE_URL}/analisis`, {
      method: "POST",
      headers: getHeaders(true), // Indica que es multipart
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || data.error || "Error en el análisis de la lesión.");
    }
    return data.analisis;
  },

  // ── Historial Clínico ────────────────────────────────────────
  async getHistorial(clase?: string | null): Promise<DiagnosticRecord[]> {
    let url = `${BASE_URL}/historial?limit=50`;
    if (clase) {
      url += `&clase=${clase}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || data.error || "Error al obtener historial.");
    }

    // Adaptar campos del backend (fecha_analisis, etc.) al formato frontend (DiagnosticRecord)
    return (data.data || []).map((item: any) => ({
      id:              String(item.id_analisis),
      nombre_amigable: item.nombre_amigable || "Lesión sin nombre",
      clave:           item.clase_predicha || "unknown",
      codigo_icd10:    item.clase_predicha === "mel" ? "C43.9" : item.clase_predicha === "nv" ? "D22.9" : "L82.0",
      nivel_riesgo:    item.nivel_riesgo || "bajo",
      confianza:       item.confianza ? parseFloat(item.confianza) : 0.0,
      explicacion:     item.explicacion || "Sin explicación disponible.",
      recomendacion:   (item.recomendacion_texto || item.explicacion || "Sin recomendaciones.").split("\n"),
      aviso_legal:     item.aviso_legal || "",
      fecha:           item.fecha_analisis 
        ? new Date(item.fecha_analisis).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        : "Sin Fecha",
      imagen:          item.ruta_archivo
        ? (item.ruta_archivo.startsWith("http")
            ? item.ruta_archivo
            : (item.ruta_archivo.startsWith("/") ? item.ruta_archivo : `/${item.ruta_archivo}`))
        : "",
    }));
  },

  async eliminarAnalisis(idAnalisis: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/historial/${idAnalisis}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || data.error || "Error al eliminar análisis.");
    }
  },

  // ── Chat Clínico ─────────────────────────────────────────────
  async getChatHistorial(idAnalisis: string): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/chat/${idAnalisis}`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || data.error || "Error al cargar chat.");
    }
    return data.mensajes;
  },

  async preguntarChat(idAnalisis: string, pregunta: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/chat/${idAnalisis}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ pregunta }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || data.error || "Error al enviar pregunta.");
    }
    return data.mensaje;
  }
};
