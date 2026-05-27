// src/middlewares/uploadMiddleware.js – Multer con memoryStorage
const multer = require('multer');

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
const TAMAÑO_MAXIMO   = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Tipo de archivo no permitido: ${file.mimetype}. Use JPEG, PNG, WEBP o BMP.`),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: TAMAÑO_MAXIMO },
  fileFilter,
});

// Middleware para un único archivo con el campo 'imagen'
const uploadMiddleware = (req, res, next) => {
  upload.single('imagen')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Archivo demasiado grande',
          mensaje: 'La imagen no puede superar los 10 MB.',
        });
      }
      return res.status(400).json({ error: 'Error de carga', mensaje: err.message });
    }
    if (err) {
      return res.status(400).json({ error: 'Error de validación', mensaje: err.message });
    }
    if (!req.file) {
      return res.status(400).json({
        error: 'Imagen requerida',
        mensaje: 'Debe incluir una imagen en el campo "imagen".',
      });
    }
    next();
  });
};

module.exports = uploadMiddleware;
