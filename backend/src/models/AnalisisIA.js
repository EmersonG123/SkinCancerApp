// src/models/AnalisisIA.js
const pool = require('../config/db');

/**
 * Crea un registro de análisis de IA.
 */
const crear = async (id_usuario, id_imagen, clase_predicha, confianza, nivel_riesgo, explicacion, aviso_legal) => {
  const result = await pool.query(
    `INSERT INTO analisis_ia
       (id_usuario, id_imagen, clase_predicha, confianza, nivel_riesgo, explicacion, aviso_legal)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id_usuario, id_imagen, clase_predicha, confianza, nivel_riesgo, explicacion, aviso_legal]
  );
  return result.rows[0];
};

/**
 * Lista el historial de análisis de un usuario con paginación y filtro opcional por clase.
 */
const findByUsuario = async (id_usuario, { limit = 10, offset = 0, clase = null } = {}) => {
  let query = `
    SELECT
      a.id_analisis,
      a.clase_predicha,
      a.confianza,
      a.nivel_riesgo,
      a.explicacion,
      a.fecha_analisis,
      r.nombre_amigable,
      r.recomendacion AS recomendacion_texto,
      i.nombre_archivo,
      i.ruta_archivo
    FROM analisis_ia a
    JOIN imagenes_lesiones i ON a.id_imagen = i.id_imagen
    JOIN recomendaciones   r ON a.clase_predicha = r.clase
    WHERE a.id_usuario = $1
  `;
  const params = [id_usuario];

  if (clase) {
    params.push(clase);
    query += ` AND a.clase_predicha = $${params.length}`;
  }

  params.push(limit);
  query += ` ORDER BY a.fecha_analisis DESC LIMIT $${params.length}`;

  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Cuenta el total de análisis de un usuario (para paginación).
 */
const countByUsuario = async (id_usuario, clase = null) => {
  let query = 'SELECT COUNT(*) FROM analisis_ia WHERE id_usuario = $1';
  const params = [id_usuario];

  if (clase) {
    params.push(clase);
    query += ` AND clase_predicha = $${params.length}`;
  }

  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count, 10);
};

/**
 * Obtiene el detalle completo de un análisis (con JOIN).
 */
const findById = async (id_analisis) => {
  const result = await pool.query(
    `SELECT
      a.*,
      r.nombre_amigable,
      r.descripcion   AS descripcion_clase,
      r.recomendacion AS recomendacion_texto,
      i.nombre_archivo,
      i.ruta_archivo,
      i.mimetype,
      i.size_bytes,
      i.uploaded_at
    FROM analisis_ia a
    JOIN imagenes_lesiones i ON a.id_imagen = i.id_imagen
    JOIN recomendaciones   r ON a.clase_predicha = r.clase
    WHERE a.id_analisis = $1`,
    [id_analisis]
  );
  return result.rows[0];
};

/**
 * Elimina un análisis por ID. Retorna el registro eliminado.
 */
const eliminar = async (id_analisis) => {
  const result = await pool.query(
    'DELETE FROM analisis_ia WHERE id_analisis = $1 RETURNING *',
    [id_analisis]
  );
  return result.rows[0];
};

module.exports = { crear, findByUsuario, countByUsuario, findById, eliminar };
