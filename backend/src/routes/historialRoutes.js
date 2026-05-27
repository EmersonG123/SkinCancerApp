// src/routes/historialRoutes.js
const express              = require('express');
const historialController  = require('../controllers/historialController');
const authMiddleware       = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET    /api/historial         – listar con paginación (?page=1&limit=10&clase=mel)
router.get('/',    historialController.listarHistorial);

// GET    /api/historial/:id     – detalle de un análisis
router.get('/:id', historialController.obtenerDetalle);

// DELETE /api/historial/:id     – eliminar un análisis
router.delete('/:id', historialController.eliminarAnalisis);

module.exports = router;
