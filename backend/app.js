// app.js – Configuración de Express
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes      = require('./src/routes/authRoutes');
const analisisRoutes  = require('./src/routes/analisisRoutes');
const historialRoutes = require('./src/routes/historialRoutes');
const chatRoutes      = require('./src/routes/chatRoutes');
const usuarioRoutes   = require('./src/routes/usuarioRoutes');
const cacheRoutes     = require('./src/routes/cacheRoutes');
const errorHandler    = require('./src/middlewares/errorHandler');
const pool            = require('./src/config/db');

const app = express();

// ── Middlewares globales ─────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "https://skincancerapp-jah5.onrender.com"
];

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("No permitido por CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Archivos estáticos (imágenes subidas) ────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rutas de la API ──────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/analisis',  analisisRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/chat',      chatRoutes);
app.use('/api/usuarios',  usuarioRoutes);
app.use('/api/cache',     cacheRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'SkinCancerApp Backend v1.0',
  });
});

// Diagnostics API for testing DB connections and records
app.get("/api/diagnostics", async (_req, res) => {
  const report = {
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
      } catch (err) {
        report.tables[table] = {
          exists: false,
          error: err.message
        };
      }
    }

    try {
      const usersRes = await pool.query('SELECT id_usuario, email, nombre, rol, analyses FROM usuarios');
      report.usuarios = usersRes.rows;
    } catch (err) {
      report.usuarios_error = err.message;
    }

    try {
      const analysisRes = await pool.query('SELECT id_analisis, id_usuario, clase_predicha, nivel_riesgo FROM analisis_ia');
      report.analisis = analysisRes.rows;
    } catch (err) {
      report.analisis_error = err.message;
    }

  } catch (err) {
    report.db_error = err.message;
  }

  res.json(report);
});

// ── Ruta de cortesía para el root del backend standalone ──────
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>MedAI Skin - Backend Standalone</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-align: center;
          padding: 80px 20px;
          background: #070a13;
          color: #f1f5f9;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(13, 18, 30, 0.8);
          border: 1px solid rgba(0, 240, 255, 0.25);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 0 30px rgba(0, 240, 255, 0.08);
        }
        h2 {
          color: #00f0ff;
          margin-top: 0;
          letter-spacing: 1px;
        }
        p {
          color: #94a3b8;
          line-height: 1.6;
          font-size: 15px;
        }
        .cmd {
          background: #000;
          color: #00f0ff;
          padding: 12px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          margin: 20px 0;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Servidor Backend Activo 🚀</h2>
        <p>Estás accediendo directamente al puerto exclusivo de la API del backend.</p>
        <p>Para cargar la <strong>aplicación completa con la interfaz gráfica</strong>, debes iniciar el servidor unificado ejecutando el siguiente comando en la <strong>carpeta raíz del proyecto</strong> (no dentro de backend/):</p>
        <div class="cmd">npm run dev</div>
        <p>Luego, abre <a href="http://localhost:3000" style="color: #00f0ff; text-decoration: none; font-weight: bold;">http://localhost:3000</a> para ver la interfaz.</p>
      </div>
    </body>
    </html>
  `);
});
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found', mensaje: 'Ruta no encontrada' });
});

// ── Error handler global ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
