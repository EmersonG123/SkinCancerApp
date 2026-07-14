// tests/integration/app.test.js
import request from 'supertest';

const mockDb = {
  query: vi.fn(),
  connect: vi.fn(),
};

require.cache[require.resolve('../../src/config/db')] = { exports: mockDb };

const app = require('../../app');

describe('Integración app.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('debe responder 200 OK con info del servicio', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: 'OK',
          service: expect.stringContaining('SkinCancerApp Backend'),
        })
      );
    });
  });

  describe('GET /', () => {
    it('debe devolver la página HTML de cortesía', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Servidor Backend Activo');
    });
  });

  describe('GET /api/diagnostics', () => {
    it('debe devolver reporte exitoso si la base de datos responde', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ now: '2026-05-26' }] }) // SELECT NOW()
        .mockResolvedValueOnce({ rows: [{ count: '10' }] }) // usuarios
        .mockResolvedValueOnce({ rows: [{ count: '5' }] }) // imagenes_lesiones
        .mockResolvedValueOnce({ rows: [{ count: '7' }] }) // recomendaciones
        .mockResolvedValueOnce({ rows: [{ count: '3' }] }) // analisis_ia
        .mockResolvedValueOnce({ rows: [{ count: '12' }] }) // chat_historial
        .mockResolvedValueOnce({ rows: [{ id_usuario: 1, email: 'test@test.com' }] }) // usuarios query
        .mockResolvedValueOnce({ rows: [{ id_analisis: 1, clase_predicha: 'mel' }] }); // analisis query

      const res = await request(app).get('/api/diagnostics');

      expect(res.status).toBe(200);
      expect(res.body.db_connected).toBe(true);
      expect(res.body.tables.usuarios.count).toBe(10);
    });

    it('debe manejar error de conexión a la base de datos', async () => {
      mockDb.query.mockRejectedValue(new Error('Connection failure'));

      const res = await request(app).get('/api/diagnostics');

      expect(res.status).toBe(200);
      expect(res.body.db_connected).toBe(false);
      expect(res.body.db_error).toBe('Connection failure');
    });

    it('debe manejar error al contar tablas individuales', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ now: '2026-05-26' }] }) // SELECT NOW()
        .mockRejectedValueOnce(new Error('Table error')) // Falla count usuarios
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({ rows: [{ count: '7' }] })
        .mockResolvedValueOnce({ rows: [{ count: '3' }] })
        .mockResolvedValueOnce({ rows: [{ count: '12' }] })
        .mockResolvedValueOnce({ rows: [{ id_usuario: 1, email: 'test@test.com' }] })
        .mockResolvedValueOnce({ rows: [{ id_analisis: 1, clase_predicha: 'mel' }] });

      const res = await request(app).get('/api/diagnostics');
      expect(res.status).toBe(200);
      expect(res.body.tables.usuarios.exists).toBe(false);
      expect(res.body.tables.usuarios.error).toBe('Table error');
    });

    it('debe manejar error al consultar usuarios detallados', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ now: '2026-05-26' }] }) // SELECT NOW()
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({ rows: [{ count: '7' }] })
        .mockResolvedValueOnce({ rows: [{ count: '3' }] })
        .mockResolvedValueOnce({ rows: [{ count: '12' }] })
        .mockRejectedValueOnce(new Error('Users query error')) // Falla select usuarios
        .mockResolvedValueOnce({ rows: [{ id_analisis: 1, clase_predicha: 'mel' }] });

      const res = await request(app).get('/api/diagnostics');
      expect(res.status).toBe(200);
      expect(res.body.usuarios_error).toBe('Users query error');
    });

    it('debe manejar error al consultar analisis detallados', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ now: '2026-05-26' }] }) // SELECT NOW()
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({ rows: [{ count: '7' }] })
        .mockResolvedValueOnce({ rows: [{ count: '3' }] })
        .mockResolvedValueOnce({ rows: [{ count: '12' }] })
        .mockResolvedValueOnce({ rows: [{ id_usuario: 1, email: 'test@test.com' }] })
        .mockRejectedValueOnce(new Error('Analysis query error')); // Falla select analisis

      const res = await request(app).get('/api/diagnostics');
      expect(res.status).toBe(200);
      expect(res.body.analisis_error).toBe('Analysis query error');
    });
  });

  describe('GET /api/ruta-inexistente', () => {
    it('debe devolver 404 Not Found', async () => {
      const res = await request(app).get('/api/ruta-inexistente');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: 'Not Found',
        mensaje: 'Ruta no encontrada',
      });
    });
  });
});
