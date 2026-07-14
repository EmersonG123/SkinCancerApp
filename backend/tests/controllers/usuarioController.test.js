const mockUsuario = {
  findAll: vi.fn(),
  findByEmail: vi.fn(),
  crear: vi.fn(),
  findById: vi.fn(),
  actualizarPorAdmin: vi.fn(),
  eliminar: vi.fn(),
};

const mockBcrypt = {
  hash: vi.fn(),
  compare: vi.fn(),
};

require.cache[require.resolve('../../src/models/Usuario')] = { exports: mockUsuario };
require.cache[require.resolve('bcrypt')] = { exports: mockBcrypt };

const Usuario = mockUsuario;
const bcrypt = mockBcrypt;
const usuarioController = require('../../src/controllers/usuarioController');


describe('usuarioController', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      body: {},
      params: {},
      usuario: { id_usuario: 1 } // Admin simulator
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  describe('listarUsuarios', () => {
    it('debe listar los usuarios correctamente', async () => {
      const mockUsers = [{ id_usuario: 1, nombre: 'Admin' }, { id_usuario: 2, nombre: 'User' }];
      Usuario.findAll.mockResolvedValue(mockUsers);

      await usuarioController.listarUsuarios(req, res, next);

      expect(Usuario.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ usuarios: mockUsers, total: 2 });
    });

    it('debe manejar errores y llamar a next()', async () => {
      const error = new Error('Database Error');
      Usuario.findAll.mockRejectedValue(error);

      await usuarioController.listarUsuarios(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('crearUsuario', () => {
    it('debe retornar 400 si faltan campos obligatorios', async () => {
      req.body = { email: 'test@test.com' }; // Falta nombre y password
      await usuarioController.crearUsuario(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Campos requeridos',
        mensaje: 'Email, nombre y contraseña son obligatorios.',
      });
    });

    it('debe retornar 409 si el correo ya existe', async () => {
      req.body = { email: 'test@test.com', nombre: 'Test', password: '123' };
      Usuario.findByEmail.mockResolvedValue({ id_usuario: 2 });

      await usuarioController.crearUsuario(req, res, next);

      expect(Usuario.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Conflicto',
        mensaje: 'El correo electrónico ya se encuentra registrado.',
      });
    });

    it('debe crear el usuario correctamente', async () => {
      req.body = { email: 'test@test.com', nombre: 'Test', password: '123' };
      Usuario.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const nuevoUser = { id_usuario: 3, email: 'test@test.com' };
      Usuario.crear.mockResolvedValue(nuevoUser);

      await usuarioController.crearUsuario(req, res, next);

      expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
      expect(Usuario.crear).toHaveBeenCalledWith('test@test.com', 'Test', 'hashedPassword', 'CO-00000-GEN', 'Dermatología General', 'usuario');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Usuario creado exitosamente por el administrador.',
        usuario: nuevoUser,
      });
    });

    it('debe atrapar errores internos', async () => {
      req.body = { email: 'test@test.com', nombre: 'Test', password: '123' };
      Usuario.findByEmail.mockRejectedValue(new Error('DB Error'));

      await usuarioController.crearUsuario(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('actualizarUsuario', () => {
    it('debe retornar 400 si el ID es inválido', async () => {
      req.params.id = 'abc';
      await usuarioController.actualizarUsuario(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debe retornar 404 si el usuario no existe', async () => {
      req.params.id = '2';
      req.body = { nombre: 'Nuevo Nombre' };
      Usuario.findById.mockResolvedValue(null);

      await usuarioController.actualizarUsuario(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe retornar 409 si se cambia el email por uno ya en uso', async () => {
      req.params.id = '2';
      req.body = { email: 'nuevo@test.com' };
      Usuario.findById.mockResolvedValue({ id_usuario: 2, email: 'viejo@test.com' });
      Usuario.findByEmail.mockResolvedValue({ id_usuario: 3 }); // Otro usuario lo tiene

      await usuarioController.actualizarUsuario(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('debe actualizar el usuario si todo es válido', async () => {
      req.params.id = '2';
      req.body = { nombre: 'Nuevo Nombre', rol: 'admin' };
      Usuario.findById.mockResolvedValue({ id_usuario: 2, nombre: 'Viejo Nombre', email: 'viejo@test.com' });
      const modificado = { id_usuario: 2, nombre: 'Nuevo Nombre', rol: 'admin' };
      Usuario.actualizarPorAdmin.mockResolvedValue(modificado);

      await usuarioController.actualizarUsuario(req, res, next);

      expect(Usuario.actualizarPorAdmin).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Usuario actualizado correctamente.',
        usuario: modificado,
      });
    });

    it('debe manejar errores en actualización', async () => {
      req.params.id = '2';
      Usuario.findById.mockRejectedValue(new Error('Internal'));
      await usuarioController.actualizarUsuario(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('eliminarUsuario', () => {
    it('debe retornar 400 si el ID es inválido', async () => {
      req.params.id = 'abc';
      await usuarioController.eliminarUsuario(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debe evitar que el admin se elimine a sí mismo', async () => {
      req.params.id = '1';
      await usuarioController.eliminarUsuario(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acción inválida',
        mensaje: 'No puede eliminarse a sí mismo de la base de datos.',
      });
    });

    it('debe retornar 404 si el usuario no existe', async () => {
      req.params.id = '2';
      Usuario.findById.mockResolvedValue(null);
      await usuarioController.eliminarUsuario(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe eliminar correctamente el usuario', async () => {
      req.params.id = '2';
      Usuario.findById.mockResolvedValue({ id_usuario: 2 });
      Usuario.eliminar.mockResolvedValue({ id_usuario: 2 });

      await usuarioController.eliminarUsuario(req, res, next);

      expect(Usuario.eliminar).toHaveBeenCalledWith(2);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Usuario eliminado correctamente.',
        usuario: { id_usuario: 2 }
      });
    });

    it('debe manejar error al eliminar', async () => {
      req.params.id = '2';
      Usuario.findById.mockRejectedValue(new Error('Del error'));
      await usuarioController.eliminarUsuario(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
