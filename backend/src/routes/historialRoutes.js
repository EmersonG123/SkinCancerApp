// src/routes/historialRoutes.js
const express              = require('express');
const historialController  = require('../controllers/historialController');
const authMiddleware       = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /api/historial:
 *   get:
 *     summary: Lista el historial de análisis
 *     tags: [Historial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: clase
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de historial
 */
// GET    /api/historial         – listar con paginación (?page=1&limit=10&clase=mel)
router.get('/',    historialController.listarHistorial);

/**
 * @swagger
 * /api/historial/{id}:
 *   get:
 *     summary: Obtiene el detalle de un análisis
 *     tags: [Historial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del análisis
 */
// GET    /api/historial/:id     – detalle de un análisis
router.get('/:id', historialController.obtenerDetalle);

/**
 * @swagger
 * /api/historial/{id}:
 *   delete:
 *     summary: Elimina un análisis del historial
 *     tags: [Historial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Análisis eliminado
 */
// DELETE /api/historial/:id     – eliminar un análisis
router.delete('/:id', historialController.eliminarAnalisis);

module.exports = router;
