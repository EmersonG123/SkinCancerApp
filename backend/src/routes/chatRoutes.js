// src/routes/chatRoutes.js
const express          = require('express');
const chatController   = require('../controllers/chatController');
const authMiddleware   = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /api/chat/{id_analisis}:
 *   post:
 *     summary: Enviar una pregunta al chatbot sobre un análisis
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_analisis
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pregunta:
 *                 type: string
 *     responses:
 *       200:
 *         description: Respuesta del chatbot
 */
// POST /api/chat/:id_analisis  – enviar pregunta
router.post('/:id_analisis', chatController.preguntar);

/**
 * @swagger
 * /api/chat/{id_analisis}:
 *   get:
 *     summary: Obtener el historial de chat de un análisis
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_analisis
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de mensajes del chat
 */
// GET  /api/chat/:id_analisis  – obtener historial de chat
router.get('/:id_analisis',  chatController.obtenerHistorialChat);

module.exports = router;
