// src/models/Usuario.js
const pool = require('../config/db');

/**
 * Crea un nuevo usuario en la base de datos con campos clínicos completos.
 */
const crear = async (email, nombre, password_hash, license = 'CO-00000-GEN', specialty = 'Dermatología General', rol = 'usuario') => {
  const result = await pool.query(
    `INSERT INTO usuarios (email, nombre, password_hash, license, specialty, analyses, precision, rol)
     VALUES ($1, $2, $3, $4, $5, 0, 95, $6)
     RETURNING id_usuario, email, nombre, nombre AS name, license, specialty, analyses, precision, rol, created_at`,
    [email, nombre, password_hash, license, specialty, rol]
  );
  return result.rows[0];
};

/**
 * Busca un usuario por su email (devuelve todo el registro incluyendo password_hash).
 */
const findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT *, nombre AS name FROM usuarios WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

/**
 * Busca un usuario por ID.
 */
const findById = async (id) => {
  const result = await pool.query(
    `SELECT id_usuario, email, nombre, nombre AS name, license, specialty, analyses, precision, rol, created_at
     FROM usuarios
     WHERE id_usuario = $1`,
    [id]
  );
  return result.rows[0];
};

/**
 * Obtiene todos los usuarios ordenados por fecha de creación (CRUD Admin).
 */
const findAll = async () => {
  const result = await pool.query(
    `SELECT id_usuario, email, nombre, nombre AS name, license, specialty, analyses, precision, rol, created_at
     FROM usuarios
     ORDER BY created_at DESC`
  );
  return result.rows;
};

/**
 * Actualiza la información de un usuario desde el panel del Administrador.
 */
const actualizarPorAdmin = async (id_usuario, { nombre, email, license, specialty, rol, precision, analyses }) => {
  const result = await pool.query(
    `UPDATE usuarios
     SET nombre = $1, email = $2, license = $3, specialty = $4, rol = $5, precision = $6, analyses = $7
     WHERE id_usuario = $8
     RETURNING id_usuario, email, nombre, nombre AS name, license, specialty, analyses, precision, rol, created_at`,
    [nombre, email, license, specialty, rol, precision, analyses, id_usuario]
  );
  return result.rows[0];
};

/**
 * Elimina un usuario de la base de datos (CRUD Admin).
 */
const eliminar = async (id_usuario) => {
  const result = await pool.query(
    'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario, email, nombre',
    [id_usuario]
  );
  return result.rows[0];
};

module.exports = {
  crear,
  findByEmail,
  findById,
  findAll,
  actualizarPorAdmin,
  eliminar
};
