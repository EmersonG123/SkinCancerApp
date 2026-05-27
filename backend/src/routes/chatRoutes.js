// src/routes/chatRoutes.js
const express          = require('express');
const chatController   = require('../controllers/chatController');
const authMiddleware   = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// POST /api/chat/:id_analisis  – enviar pregunta
router.post('/:id_analisis', chatController.preguntar);

// GET  /api/chat/:id_analisis  – obtener historial de chat
router.get('/:id_analisis',  chatController.obtenerHistorialChat);

module.exports = router;
