// src/middlewares/authMiddleware.js – Verificación de JWT
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Token de acceso requerido. Incluya "Authorization: Bearer <token>"',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Incluir id_usuario y rol en el request
    req.usuario = {
      id_usuario: decoded.id_usuario,
      rol:        decoded.rol,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        mensaje: 'Su sesión ha expirado. Inicie sesión nuevamente.',
      });
    }
    return res.status(401).json({
      error: 'Token inválido',
      mensaje: 'El token de autenticación no es válido.',
    });
  }
};

module.exports = authMiddleware;
