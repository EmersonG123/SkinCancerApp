// server.ts – Servidor Integrado Full-Stack MedAI Skin (Puerto 3000)
import "./src/backend-config"; // Carga variables de entorno antes de importar las rutas
import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";

// ── Iniciar conexión a Base de Datos PostgreSQL ────────────────
import pool from "./backend/src/config/db";

// ── Importar Rutas del Backend MVC ────────────────────────────
import authRoutes from "./backend/src/routes/authRoutes";
import analisisRoutes from "./backend/src/routes/analisisRoutes";
import historialRoutes from "./backend/src/routes/historialRoutes";
import chatRoutes from "./backend/src/routes/chatRoutes";
import usuarioRoutes from "./backend/src/routes/usuarioRoutes";
import errorHandler from "./backend/src/middlewares/errorHandler";

const app = express();
const PORT = 3000; // Unificado en el puerto 3000

// ── Middlewares globales ─────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// ── Servir archivos estáticos (imágenes subidas localmente) ──
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Registrar Rutas de la API Real ───────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/analisis',  analisisRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/chat',      chatRoutes);
app.use('/api/usuarios',  usuarioRoutes);

// Diagnostics API for testing DB connections and records
app.get("/api/diagnostics", async (_req, res) => {
  const report: any = {
    timestamp: new Date().toISOString(),
    db_connected: false,
    db_error: null,
    tables: {},
    usuarios: [],
    analisis: []
  };

  try {
    const dbTest = await pool.query('SELECT NOW()');
    report.db_connected = true;
    report.db_time = dbTest.rows[0].now;

    const tableNames = ['usuarios', 'imagenes_lesiones', 'recomendaciones', 'analisis_ia', 'chat_historial'];
    for (const table of tableNames) {
      try {
        const countRes = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        report.tables[table] = {
          exists: true,
          count: parseInt(countRes.rows[0].count, 10)
        };
      } catch (err: any) {
        report.tables[table] = {
          exists: false,
          error: err.message
        };
      }
    }

    try {
      const usersRes = await pool.query('SELECT id_usuario, email, nombre, rol, analyses FROM usuarios');
      report.usuarios = usersRes.rows;
    } catch (err: any) {
      report.usuarios_error = err.message;
    }

    try {
      const analysisRes = await pool.query('SELECT id_analisis, id_usuario, clase_predicha, nivel_riesgo FROM analisis_ia');
      report.analisis = analysisRes.rows;
    } catch (err: any) {
      report.analisis_error = err.message;
    }

  } catch (err: any) {
    report.db_error = err.message;
  }

  res.json(report);
});

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "MedAI Skin Full-Stack Integrado v2.0",
  });
});

// ── Vite Dev/Prod Setup ──────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("🚀 Iniciando Vite en modo DESARROLLO (Middleware HMR)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 Iniciando servidor en modo PRODUCCIÓN...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Manejo de errores centralizado del backend
  app.use(errorHandler);

  // Escuchar en el puerto 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n=============================================================`);
    console.log(`  MedAI Skin Full-Stack Server corriendo en el puerto ${PORT}`);
    console.log(`  Accede a la interfaz en: http://localhost:${PORT}`);
    console.log(`=============================================================\n`);
  });
}

startServer();
