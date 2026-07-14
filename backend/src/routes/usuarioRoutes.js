// src/routes/usuarioRoutes.js – Rutas CRUD de Usuarios para Administrador
const express           = require('express');
const usuarioController = require('../controllers/usuarioController');
const authMiddleware    = require('../middlewares/authMiddleware');
const adminMiddleware   = require('../middlewares/adminMiddleware');

const router = express.Router();

// Todas las rutas de este router requieren autenticación de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos los usuarios (Solo Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
// GET    /api/usuarios      – Listar todos
router.get('/',    usuarioController.listarUsuarios);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crea un nuevo usuario (Solo Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               rol:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 */
// POST   /api/usuarios      – Crear nuevo usuario
router.post('/',   usuarioController.crearUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualiza datos de un usuario (Solo Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               rol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
// PUT    /api/usuarios/:id  – Actualizar datos de usuario
router.put('/:id',  usuarioController.actualizarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario (Solo Admin)
 *     tags: [Usuarios]
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
 *         description: Usuario eliminado
 */
// DELETE /api/usuarios/:id  – Eliminar usuario
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;
