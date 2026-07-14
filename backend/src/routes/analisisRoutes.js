// src/routes/analisisRoutes.js
const express            = require('express');
const analisisController = require('../controllers/analisisController');
const authMiddleware     = require('../middlewares/authMiddleware');
const uploadMiddleware   = require('../middlewares/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/analisis:
 *   post:
 *     summary: Realiza un análisis de imagen de una lesión
 *     tags: [Análisis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Análisis completado exitosamente
 *       401:
 *         description: No autorizado
 */
// POST /api/analisis  – requiere auth y carga de imagen
router.post('/', authMiddleware, uploadMiddleware, analisisController.analizar);

module.exports = router;
