// tests/controllers/historialController.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = {
  query: vi.fn(() => Promise.resolve({ rows: [{ id_imagen: 99 }] })),
  connect: vi.fn(),
};
const mockAnalisisIA = {
  findByUsuario: vi.fn(),
  countByUsuario: vi.fn(),
  findById: vi.fn(),
  eliminar: vi.fn(),
};
const mockImagenLesion = {
  eliminar: vi.fn(),
};
const mockFs = {
  existsSync: vi.fn(),
  unlinkSync: vi.fn(),
};

// Register in require.cache
require.cache[require.resolve('../../src/config/db')] = { exports: mockDb };
require.cache[require.resolve('../../src/models/AnalisisIA')] = { exports: mockAnalisisIA };
require.cache[require.resolve('../../src/models/ImagenLesion')] = { exports: mockImagenLesion };
require.cache[require.resolve('fs')] = { exports: mockFs };

const AnalisisIA = mockAnalisisIA;
const ImagenLesion = mockImagenLesion;
const fs = mockFs;
const { listarHistorial, obtenerDetalle, eliminarAnalisis } = require('../../src/controllers/historialController');

// ── Helpers ──────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

// ══════════════════════════════════════════════════════════════
// LISTAR HISTORIAL
// ══════════════════════════════════════════════════════════════
describe('historialController – listarHistorial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe devolver la lista de análisis con paginación', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      query: { page: '1', limit: '10' },
    };
    const res = mockRes();

    const mockAnalisis = [
      { id_analisis: 1, clase_predicha: 'nv', confianza: 95.0 },
      { id_analisis: 2, clase_predicha: 'mel', confianza: 88.5 },
    ];

    AnalisisIA.findByUsuario.mockResolvedValue(mockAnalisis);
    AnalisisIA.countByUsuario.mockResolvedValue(2);

    // Act
    await listarHistorial(req, res, mockNext);

    // Assert
    expect(AnalisisIA.findByUsuario).toHaveBeenCalledWith(1, expect.objectContaining({ limit: 10, offset: 0 }));
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockAnalisis,
        paginacion: expect.objectContaining({
          pagina_actual: 1,
          total_items: 2,
        }),
      })
    );
  });

  it('debe filtrar por clase si se proporciona', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      query: { page: '1', limit: '10', clase: 'mel' },
    };
    const res = mockRes();

    AnalisisIA.findByUsuario.mockResolvedValue([]);
    AnalisisIA.countByUsuario.mockResolvedValue(0);

    // Act
    await listarHistorial(req, res, mockNext);

    // Assert
    expect(AnalisisIA.findByUsuario).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ clase: 'mel' })
    );
  });
});

// ══════════════════════════════════════════════════════════════
// OBTENER DETALLE
// ══════════════════════════════════════════════════════════════
describe('historialController – obtenerDetalle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe devolver el detalle de un análisis existente propio', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id: '5' },
    };
    const res = mockRes();

    AnalisisIA.findById.mockResolvedValue({
      id_analisis: 5,
      id_usuario: 1,
      clase_predicha: 'mel',
    });

    // Act
    await obtenerDetalle(req, res, mockNext);

    // Assert
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        analisis: expect.objectContaining({ id_analisis: 5 }),
      })
    );
  });

  it('debe devolver 404 si el análisis no existe', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id: '999' },
    };
    const res = mockRes();

    AnalisisIA.findById.mockResolvedValue(undefined);

    // Act
    await obtenerDetalle(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('debe devolver 403 si el análisis pertenece a otro usuario', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id: '5' },
    };
    const res = mockRes();

    AnalisisIA.findById.mockResolvedValue({
      id_analisis: 5,
      id_usuario: 99, // otro usuario
    });

    // Act
    await obtenerDetalle(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('debe devolver 400 si el ID es inválido', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id: 'abc' },
    };
    const res = mockRes();

    // Act
    await obtenerDetalle(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ══════════════════════════════════════════════════════════════
// ELIMINAR ANÁLISIS
// ══════════════════════════════════════════════════════════════
describe('historialController – eliminarAnalisis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe eliminar un análisis propio correctamente', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id: '5' },
    };
    const res = mockRes();

    AnalisisIA.findById.mockResolvedValue({
      id_analisis: 5,
      id_usuario: 1,
      id_imagen: 10,
      ruta_archivo: 'uploads/1/lesion.jpg',
    });
    AnalisisIA.eliminar.mockResolvedValue({});
    ImagenLesion.eliminar.mockResolvedValue({});
    fs.existsSync.mockReturnValue(true);

    // Act
    await eliminarAnalisis(req, res, mockNext);

    // Assert
    expect(AnalisisIA.eliminar).toHaveBeenCalledWith(5);
    expect(ImagenLesion.eliminar).toHaveBeenCalledWith(10);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: 'Análisis eliminado correctamente.' })
    );
  });

  it('debe devolver 404 si el análisis a eliminar no existe', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id: '999' },
    };
    const res = mockRes();

    AnalisisIA.findById.mockResolvedValue(undefined);

    // Act
    await eliminarAnalisis(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
