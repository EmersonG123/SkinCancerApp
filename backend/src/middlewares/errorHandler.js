// src/middlewares/errorHandler.js – Manejador global de errores
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${new Date().toISOString()} – ${req.method} ${req.path}`);
  console.error(err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    error: err.name || 'Error interno',
    mensaje: err.message || 'Ha ocurrido un error inesperado en el servidor.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
