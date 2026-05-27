// src/controllers/usuarioController.js – CRUD de Usuarios para Administradores
const bcrypt  = require('bcrypt');
const Usuario = require('../models/Usuario');

const SALT_ROUNDS = 10;

// ── GET /api/usuarios (Listar todos) ─────────────────────────
const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll();
    return res.json({ usuarios, total: usuarios.length });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/usuarios (Crear Usuario desde Admin) ───────────
const crearUsuario = async (req, res, next) => {
  try {
    const { email, nombre, password, license, specialty, rol } = req.body;

    if (!email || !nombre || !password) {
      return res.status(400).json({
        error: 'Campos requeridos',
        mensaje: 'Email, nombre y contraseña son obligatorios.',
      });
    }

    // Verificar si ya existe
    const existe = await Usuario.findByEmail(email.toLowerCase().trim());
    if (existe) {
      return res.status(409).json({
        error: 'Conflicto',
        mensaje: 'El correo electrónico ya se encuentra registrado.',
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const nuevoUsuario = await Usuario.crear(
      email.toLowerCase().trim(),
      nombre.trim(),
      passwordHash,
      license || 'CO-00000-GEN',
      specialty || 'Dermatología General',
      rol || 'usuario'
    );

    return res.status(201).json({
      mensaje: 'Usuario creado exitosamente por el administrador.',
      usuario: nuevoUsuario,
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/usuarios/:id (Actualizar Usuario) ───────────────
const actualizarUsuario = async (req, res, next) => {
  try {
    const id_usuario = parseInt(req.params.id, 10);
    const { nombre, email, license, specialty, rol, precision, analyses } = req.body;

    if (isNaN(id_usuario)) {
      return res.status(400).json({ error: 'ID inválido', mensaje: 'El ID debe ser un número entero.' });
    }

    // Verificar si el usuario existe
    const usuarioExistente = await Usuario.findById(id_usuario);
    if (!usuarioExistente) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'El usuario no existe.' });
    }

    // Si cambia de email, verificar que no cause conflicto con otro
    if (email && email.toLowerCase().trim() !== usuarioExistente.email.toLowerCase()) {
      const conflicto = await Usuario.findByEmail(email.toLowerCase().trim());
      if (conflicto) {
        return res.status(409).json({
          error: 'Conflicto',
          mensaje: 'El correo electrónico ya está en uso por otro usuario.',
        });
      }
    }

    // Preparar campos para actualizar, manteniendo los existentes si no se envían
    const datosActualizados = {
      nombre:     nombre !== undefined ? nombre.trim() : usuarioExistente.nombre,
      email:      email !== undefined ? email.toLowerCase().trim() : usuarioExistente.email,
      license:    license !== undefined ? license.trim() : usuarioExistente.license,
      specialty:  specialty !== undefined ? specialty.trim() : usuarioExistente.specialty,
      rol:        rol !== undefined ? rol : usuarioExistente.rol,
      precision:  precision !== undefined ? parseInt(precision, 10) : usuarioExistente.precision,
      analyses:   analyses !== undefined ? parseInt(analyses, 10) : usuarioExistente.analyses,
    };

    const usuarioModificado = await Usuario.actualizarPorAdmin(id_usuario, datosActualizados);

    return res.json({
      mensaje: 'Usuario actualizado correctamente.',
      usuario: usuarioModificado,
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/usuarios/:id (Eliminar Usuario) ──────────────
const eliminarUsuario = async (req, res, next) => {
  try {
    const id_usuario = parseInt(req.params.id, 10);

    if (isNaN(id_usuario)) {
      return res.status(400).json({ error: 'ID inválido', mensaje: 'El ID debe ser un número entero.' });
    }

    // Evitar que el administrador se elimine a sí mismo
    if (req.usuario.id_usuario === id_usuario) {
      return res.status(400).json({
        error: 'Acción inválida',
        mensaje: 'No puede eliminarse a sí mismo de la base de datos.',
      });
    }

    const usuarioExistente = await Usuario.findById(id_usuario);
    if (!usuarioExistente) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'El usuario no existe.' });
    }

    const eliminado = await Usuario.eliminar(id_usuario);

    return res.json({
      mensaje: 'Usuario eliminado correctamente.',
      usuario: eliminado,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
