// tests/models/AnalisisIA.test.js

const mockDb = {
  query: vi.fn(),
  connect: vi.fn(),
};

const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = { exports: mockDb };

const pool = mockDb;
const AnalisisIA = require('../../src/models/AnalisisIA');

describe('Modelo AnalisisIA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('crear', () => {
    it('debe crear un registro de análisis de IA', async () => {
      const fakeRecord = { id_analisis: 1, clase_predicha: 'mel' };
      pool.query.mockResolvedValue({ rows: [fakeRecord] });

      const res = await AnalisisIA.crear(1, 2, 'mel', 95.0, 'alto', 'explicacion', 'aviso');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO analisis_ia'),
        [1, 2, 'mel', 95.0, 'alto', 'explicacion', 'aviso']
      );
      expect(res).toEqual(fakeRecord);
    });
  });

  describe('findByUsuario', () => {
    it('debe listar los análisis de un usuario con paginación y sin clase', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await AnalisisIA.findByUsuario(1, { limit: 5, offset: 10 });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE a.id_usuario = $1'),
        [1, 5, 10]
      );
    });

    it('debe filtrar por clase si se proporciona', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await AnalisisIA.findByUsuario(1, { limit: 5, offset: 10, clase: 'mel' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND a.clase_predicha = $2'),
        [1, 'mel', 5, 10]
      );
    });
  });

  describe('countByUsuario', () => {
    it('debe contar sin clase', async () => {
      pool.query.mockResolvedValue({ rows: [{ count: '10' }] });

      const res = await AnalisisIA.countByUsuario(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*)'),
        [1]
      );
      expect(res).toBe(10);
    });

    it('debe contar con clase', async () => {
      pool.query.mockResolvedValue({ rows: [{ count: '5' }] });

      const res = await AnalisisIA.countByUsuario(1, 'mel');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND clase_predicha = $2'),
        [1, 'mel']
      );
      expect(res).toBe(5);
    });
  });

  describe('findById', () => {
    it('debe retornar el detalle de un análisis', async () => {
      const fakeRecord = { id_analisis: 5 };
      pool.query.mockResolvedValue({ rows: [fakeRecord] });

      const res = await AnalisisIA.findById(5);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE a.id_analisis = $1'),
        [5]
      );
      expect(res).toEqual(fakeRecord);
    });
  });

  describe('eliminar', () => {
    it('debe eliminar un análisis', async () => {
      const fakeRecord = { id_analisis: 3 };
      pool.query.mockResolvedValue({ rows: [fakeRecord] });

      const res = await AnalisisIA.eliminar(3);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM analisis_ia'),
        [3]
      );
      expect(res).toEqual(fakeRecord);
    });
  });
});
