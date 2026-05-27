// src/routes/analisisRoutes.js
const express            = require('express');
const analisisController = require('../controllers/analisisController');
const authMiddleware     = require('../middlewares/authMiddleware');
const uploadMiddleware   = require('../middlewares/uploadMiddleware');

const router = express.Router();

// POST /api/analisis  – requiere auth y carga de imagen
router.post('/', authMiddleware, uploadMiddleware, analisisController.analizar);

module.exports = router;
