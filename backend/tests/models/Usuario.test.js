// tests/models/Usuario.test.js

const mockDb = {
  query: vi.fn(),
  connect: vi.fn(),
};

const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = { exports: mockDb };

const pool = mockDb;
const Usuario = require('../../src/models/Usuario');

// ══════════════════════════════════════════════════════════════
// MODELO USUARIO
// ══════════════════════════════════════════════════════════════
describe('Modelo Usuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── crear ──────────────────────────────────────────────────
  describe('crear', () => {
    it('debe insertar un nuevo usuario y retornar el registro creado', async () => {
      // Arrange
      const fakeUser = {
        id_usuario: 1,
        email: 'test@test.com',
        nombre: 'Dr. Test',
        name: 'Dr. Test',
        license: 'CO-12345-A',
        specialty: 'Dermatología Clínica',
        analyses: 0,
        precision: 95,
        rol: 'usuario',
        created_at: new Date(),
      };
      pool.query.mockResolvedValue({ rows: [fakeUser] });

      // Act
      const resultado = await Usuario.crear(
        'test@test.com',
        'Dr. Test',
        'hashed_password',
        'CO-12345-A',
        'Dermatología Clínica',
        'usuario'
      );

      // Assert
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usuarios'),
        expect.arrayContaining(['test@test.com', 'Dr. Test', 'hashed_password'])
      );
      expect(resultado).toEqual(fakeUser);
      expect(resultado.id_usuario).toBe(1);
    });
  });

  // ── findByEmail ────────────────────────────────────────────
  describe('findByEmail', () => {
    it('debe encontrar un usuario por email', async () => {
      // Arrange
      const fakeUser = {
        id_usuario: 1,
        email: 'emerson@gmail.com',
        nombre: 'Ing. Emerson',
        name: 'Ing. Emerson',
        password_hash: 'hashed_eng947750',
        rol: 'admin',
      };
      pool.query.mockResolvedValue({ rows: [fakeUser] });

      // Act
      const resultado = await Usuario.findByEmail('emerson@gmail.com');

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['emerson@gmail.com']
      );
      expect(resultado).toEqual(fakeUser);
    });

    it('debe retornar undefined si el email no existe', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      const resultado = await Usuario.findByEmail('noexiste@test.com');

      // Assert
      expect(resultado).toBeUndefined();
    });
  });

  // ── findById ───────────────────────────────────────────────
  describe('findById', () => {
    it('debe encontrar un usuario por ID', async () => {
      // Arrange
      const fakeUser = { id_usuario: 5, email: 'doctor@test.com', nombre: 'Dr. Doctor' };
      pool.query.mockResolvedValue({ rows: [fakeUser] });

      // Act
      const resultado = await Usuario.findById(5);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id_usuario'),
        [5]
      );
      expect(resultado.id_usuario).toBe(5);
    });

    it('debe retornar undefined si el ID no existe', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      const resultado = await Usuario.findById(999);

      // Assert
      expect(resultado).toBeUndefined();
    });
  });

  // ── findAll ────────────────────────────────────────────────
  describe('findAll', () => {
    it('debe retornar todos los usuarios ordenados', async () => {
      // Arrange
      const fakeUsers = [
        { id_usuario: 1, nombre: 'Admin', rol: 'admin' },
        { id_usuario: 2, nombre: 'Doctor', rol: 'usuario' },
      ];
      pool.query.mockResolvedValue({ rows: fakeUsers });

      // Act
      const resultado = await Usuario.findAll();

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC')
      );
      expect(resultado).toHaveLength(2);
    });
  });

  // ── actualizarPorAdmin ────────────────────────────────────
  describe('actualizarPorAdmin', () => {
    it('debe actualizar los datos de un usuario y retornar el registro modificado', async () => {
      // Arrange
      const updatedUser = {
        id_usuario: 2,
        email: 'updated@test.com',
        nombre: 'Dr. Updated',
        name: 'Dr. Updated',
        license: 'CO-99999-B',
        specialty: 'Oncología Cutánea',
        rol: 'usuario',
        precision: 90,
        analyses: 5,
      };
      pool.query.mockResolvedValue({ rows: [updatedUser] });

      // Act
      const resultado = await Usuario.actualizarPorAdmin(2, {
        nombre: 'Dr. Updated',
        email: 'updated@test.com',
        license: 'CO-99999-B',
        specialty: 'Oncología Cutánea',
        rol: 'usuario',
        precision: 90,
        analyses: 5,
      });

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE usuarios'),
        expect.arrayContaining(['Dr. Updated', 'updated@test.com'])
      );
      expect(resultado.id_usuario).toBe(2);
    });
  });

  // ── eliminar ───────────────────────────────────────────────
  describe('eliminar', () => {
    it('debe eliminar un usuario y retornar el registro eliminado', async () => {
      // Arrange
      const deleted = { id_usuario: 3, email: 'borrado@test.com', nombre: 'Borrado' };
      pool.query.mockResolvedValue({ rows: [deleted] });

      // Act
      const resultado = await Usuario.eliminar(3);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM usuarios'),
        [3]
      );
      expect(resultado.id_usuario).toBe(3);
    });
  });
});
