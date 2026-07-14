// src/routes/cacheRoutes.js
const express = require('express');
const cacheController = require('../controllers/cacheController');

const router = express.Router();

/**
 * @swagger
 * /api/cache/{key}:
 *   get:
 *     summary: Obtiene un valor de caché
 *     tags: [Cache]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Valor recuperado
 */
// GET /api/cache/:key – Obtiene valor de caché
router.get('/:key', cacheController.getCache);

/**
 * @swagger
 * /api/cache:
 *   post:
 *     summary: Guarda una clave-valor en caché
 *     tags: [Cache]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: object
 *               ttl:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Valor guardado en caché
 */
// POST /api/cache – Guarda clave-valor en caché
router.post('/', cacheController.setCache);

/**
 * @swagger
 * /api/cache/{key}:
 *   delete:
 *     summary: Elimina una clave de caché
 *     tags: [Cache]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clave eliminada
 */
// DELETE /api/cache/:key – Elimina clave de caché
router.delete('/:key', cacheController.deleteCache);

module.exports = router;
