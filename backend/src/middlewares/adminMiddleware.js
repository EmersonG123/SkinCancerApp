// src/middlewares/adminMiddleware.js – Restricción para Administradores
const adminMiddleware = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({
      error: 'Acceso prohibido',
      mensaje: 'Esta sección requiere privilegios de Administrador.',
    });
  }
  next();
};

module.exports = adminMiddleware;
