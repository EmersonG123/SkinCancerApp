// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const SALT_ROUNDS = 10;

// Mapeador de especialidades del frontend
const specialtyLabels = {
  dermatology: "Dermatología Clínica",
  general: "Medicina General",
  oncology: "Oncología Cutánea",
  research: "Investigación Científica"
};

// ── POST /api/auth/register ──────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { email, nombre, password, license, specialty, rol } = req.body;

    // Validaciones básicas
    if (!email || !nombre || !password) {
      return res.status(400).json({
        error: 'Campos requeridos',
        mensaje: 'Email, nombre y contraseña son obligatorios.',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Contraseña débil',
        mensaje: 'La contraseña debe tener al menos 6 caracteres.',
      });
    }

    // Verificar email único
    const existe = await Usuario.findByEmail(email.toLowerCase().trim());
    if (existe) {
      return res.status(409).json({
        error: 'Email ya registrado',
        mensaje: 'Ya existe una cuenta con ese correo electrónico.',
      });
    }

    // Formatear especialidad
    const especialidadFormateada = specialtyLabels[specialty] || specialty || "Dermatología Clínica";

    // Determinar rol: si no viene o no es válido, se asume paciente (Usuario General)
    const rolAsignado = (rol === 'medico' || rol === 'admin') ? rol : 'paciente';

    // Hashear contraseña y crear usuario
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuario = await Usuario.crear(
      email.toLowerCase().trim(),
      nombre.trim(),
      password_hash,
      license ? license.trim() : (rolAsignado === 'paciente' ? 'NO-APLICA' : 'CO-00000-GEN'),
      rolAsignado === 'paciente' ? 'Usuario General' : especialidadFormateada,
      rolAsignado
    );

    return res.status(201).json({
      mensaje: 'Cuenta creada exitosamente.',
      usuario: {
        id_usuario: usuario.id_usuario,
        email:      usuario.email,
        nombre:     usuario.nombre,
        name:       usuario.nombre,
        license:    usuario.license,
        specialty:  usuario.specialty,
        analyses:   usuario.analyses,
        precision:  usuario.precision,
        rol:        usuario.rol,
        created_at: usuario.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Campos requeridos',
        mensaje: 'Email y contraseña son obligatorios.',
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findByEmail(email.toLowerCase().trim());
    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: 'Email o contraseña incorrectos.',
      });
    }

    // Comparar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: 'Email o contraseña incorrectos.',
      });
    }

    // Generar JWT (24 horas) - Codificar id_usuario y rol en el token
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        rol:        usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      mensaje: 'Sesión iniciada correctamente.',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        email:      usuario.email,
        nombre:     usuario.nombre,
        name:       usuario.nombre,
        license:    usuario.license,
        specialty:  usuario.specialty,
        analyses:   usuario.analyses,
        precision:  usuario.precision,
        rol:        usuario.rol,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
