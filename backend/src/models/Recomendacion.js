// src/models/Recomendacion.js
const pool = require('../config/db');

/**
 * Obtiene la recomendación para una clase específica de HAM10000.
 */
const findByClase = async (clase) => {
  const result = await pool.query(
    'SELECT * FROM recomendaciones WHERE clase = $1',
    [clase]
  );
  return result.rows[0];
};

/**
 * Lista todas las recomendaciones disponibles.
 */
const findAll = async () => {
  const result = await pool.query(
    'SELECT * FROM recomendaciones ORDER BY nivel_riesgo DESC, clase ASC'
  );
  return result.rows;
};

module.exports = { findByClase, findAll };
