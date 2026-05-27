// src/routes/usuarioRoutes.js – Rutas CRUD de Usuarios para Administrador
const express           = require('express');
const usuarioController = require('../controllers/usuarioController');
const authMiddleware    = require('../middlewares/authMiddleware');
const adminMiddleware   = require('../middlewares/adminMiddleware');

const router = express.Router();

// Todas las rutas de este router requieren autenticación de administrador
router.use(authMiddleware);
router.use(adminMiddleware);

// GET    /api/usuarios      – Listar todos
router.get('/',    usuarioController.listarUsuarios);

// POST   /api/usuarios      – Crear nuevo usuario
router.post('/',   usuarioController.crearUsuario);

// PUT    /api/usuarios/:id  – Actualizar datos de usuario
router.put('/:id',  usuarioController.actualizarUsuario);

// DELETE /api/usuarios/:id  – Eliminar usuario
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;
