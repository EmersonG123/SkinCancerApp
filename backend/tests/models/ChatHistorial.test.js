// tests/models/ChatHistorial.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = {
  query: vi.fn(),
  connect: vi.fn(),
};

const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = { exports: mockDb };

const pool = mockDb;
const ChatHistorial = require('../../src/models/ChatHistorial');

describe('Modelo ChatHistorial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('crear', () => {
    it('debe insertar un mensaje y retornar el registro', async () => {
      const fakeMsg = { id_mensaje: 1, contenido: 'test' };
      pool.query.mockResolvedValue({ rows: [fakeMsg] });

      const res = await ChatHistorial.crear(1, 2, 'usuario', 'test');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO chat_historial'),
        [1, 2, 'usuario', 'test']
      );
      expect(res).toEqual(fakeMsg);
    });
  });

  describe('findByAnalisis', () => {
    it('debe buscar mensajes de un análisis', async () => {
      const fakeMsgs = [{ id_mensaje: 1 }];
      pool.query.mockResolvedValue({ rows: fakeMsgs });

      const res = await ChatHistorial.findByAnalisis(5);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id_analisis = $1'),
        [5]
      );
      expect(res).toEqual(fakeMsgs);
    });
  });

  describe('eliminarPorAnalisis', () => {
    it('debe eliminar mensajes de un análisis', async () => {
      pool.query.mockResolvedValue({});

      await ChatHistorial.eliminarPorAnalisis(5);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM chat_historial WHERE id_analisis = $1'),
        [5]
      );
    });
  });
});
