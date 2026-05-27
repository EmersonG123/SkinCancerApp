// src/models/ImagenLesion.js
const pool = require('../config/db');

/**
 * Registra una imagen subida en la base de datos.
 */
const crear = async (id_usuario, nombre_archivo, ruta_archivo, mimetype, size_bytes) => {
  const result = await pool.query(
    `INSERT INTO imagenes_lesiones (id_usuario, nombre_archivo, ruta_archivo, mimetype, size_bytes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id_usuario, nombre_archivo, ruta_archivo, mimetype, size_bytes]
  );
  return result.rows[0];
};

/**
 * Obtiene una imagen por su ID.
 */
const findById = async (id_imagen) => {
  const result = await pool.query(
    'SELECT * FROM imagenes_lesiones WHERE id_imagen = $1',
    [id_imagen]
  );
  return result.rows[0];
};

/**
 * Elimina una imagen por su ID.
 */
const eliminar = async (id_imagen) => {
  const result = await pool.query(
    'DELETE FROM imagenes_lesiones WHERE id_imagen = $1 RETURNING *',
    [id_imagen]
  );
  return result.rows[0];
};

/**
 * Lista todas las imágenes de un usuario.
 */
const findByUsuario = async (id_usuario) => {
  const result = await pool.query(
    'SELECT * FROM imagenes_lesiones WHERE id_usuario = $1 ORDER BY uploaded_at DESC',
    [id_usuario]
  );
  return result.rows;
};

module.exports = { crear, findById, eliminar, findByUsuario };
