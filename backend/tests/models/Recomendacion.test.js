// tests/models/Recomendacion.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = {
  query: vi.fn(),
  connect: vi.fn(),
};

const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = { exports: mockDb };

const pool = mockDb;
const Recomendacion = require('../../src/models/Recomendacion');

describe('Modelo Recomendacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByClase', () => {
    it('debe buscar recomendación por clase', async () => {
      const fakeRec = { id_recomendacion: 1, clase: 'mel' };
      pool.query.mockResolvedValue({ rows: [fakeRec] });

      const res = await Recomendacion.findByClase('mel');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE clase = $1'),
        ['mel']
      );
      expect(res).toEqual(fakeRec);
    });
  });

  describe('findAll', () => {
    it('debe listar todas las recomendaciones ordenadas', async () => {
      const fakeRecs = [{ id_recomendacion: 1 }, { id_recomendacion: 2 }];
      pool.query.mockResolvedValue({ rows: fakeRecs });

      const res = await Recomendacion.findAll();

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY nivel_riesgo DESC, clase ASC')
      );
      expect(res).toEqual(fakeRecs);
    });
  });
});
