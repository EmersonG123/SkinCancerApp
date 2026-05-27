// src/models/ChatHistorial.js
const pool = require('../config/db');

/**
 * Guarda un mensaje en el historial del chat.
 * rol: 'usuario' | 'asistente'
 */
const crear = async (id_analisis, id_usuario, rol, contenido) => {
  const result = await pool.query(
    `INSERT INTO chat_historial (id_analisis, id_usuario, rol, contenido)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id_analisis, id_usuario, rol, contenido]
  );
  return result.rows[0];
};

/**
 * Recupera todos los mensajes de un análisis ordenados cronológicamente.
 */
const findByAnalisis = async (id_analisis) => {
  const result = await pool.query(
    `SELECT id_mensaje, rol, contenido, created_at
     FROM chat_historial
     WHERE id_analisis = $1
     ORDER BY created_at ASC`,
    [id_analisis]
  );
  return result.rows;
};

/**
 * Elimina todos los mensajes de un análisis (cascade al eliminar analisis).
 */
const eliminarPorAnalisis = async (id_analisis) => {
  await pool.query('DELETE FROM chat_historial WHERE id_analisis = $1', [id_analisis]);
};

module.exports = { crear, findByAnalisis, eliminarPorAnalisis };
