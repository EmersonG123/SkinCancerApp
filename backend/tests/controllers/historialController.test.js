// tests/controllers/historialController.test.js

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
  it('debe inicializar historial si el usuario no tiene registros', async () => {
    const req = { usuario: { id_usuario: 1 }, query: { page: '1', limit: '10' } };
    const res = mockRes();

    // Simulamos que al inicio no hay, luego el controlador llama a inicializar, luego ya hay.
    AnalisisIA.countByUsuario.mockResolvedValueOnce(0).mockResolvedValueOnce(3);
    AnalisisIA.findByUsuario.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id_analisis: 1 }]);

    // Asumimos que pool.query se ejecuta varias veces para insertar
    mockDb.query.mockResolvedValue({ rows: [{ id_imagen: 99 }] });

    await listarHistorial(req, res, mockNext);

    expect(mockDb.query).toHaveBeenCalled(); // Se inicializó el historial
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      paginacion: expect.objectContaining({ total_items: 3 })
    }));
  });

  it('debe manejar errores y llamar a next', async () => {
    const req = { usuario: { id_usuario: 1 }, query: {} };
    const res = mockRes();
    AnalisisIA.findByUsuario.mockRejectedValue(new Error('DB Fallo'));

    await listarHistorial(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
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
  it('debe manejar errores internos', async () => {
    const req = { usuario: { id_usuario: 1 }, params: { id: '5' } };
    const res = mockRes();
    AnalisisIA.findById.mockRejectedValue(new Error('Falló db'));
    await obtenerDetalle(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
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

  it('debe devolver 400 si el ID a eliminar es inválido', async () => {
    const req = { usuario: { id_usuario: 1 }, params: { id: 'invalido' } };
    const res = mockRes();
    await eliminarAnalisis(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('debe devolver 403 si el análisis a eliminar es de otro', async () => {
    const req = { usuario: { id_usuario: 1 }, params: { id: '5' } };
    const res = mockRes();
    AnalisisIA.findById.mockResolvedValue({ id_analisis: 5, id_usuario: 99 });

    await eliminarAnalisis(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('debe manejar caso donde fs falla sin que caiga la app', async () => {
    const req = { usuario: { id_usuario: 1 }, params: { id: '5' } };
    const res = mockRes();
    AnalisisIA.findById.mockResolvedValue({ id_analisis: 5, id_usuario: 1, ruta_archivo: 'uploads/5.jpg' });
    AnalisisIA.eliminar.mockResolvedValue();
    ImagenLesion.eliminar.mockResolvedValue();
    fs.existsSync.mockReturnValue(true);
    fs.unlinkSync.mockImplementation(() => { throw new Error('Unlink error'); }); // Simulate warning path

    await eliminarAnalisis(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: 'Análisis eliminado correctamente.' }));
  });

  it('debe manejar error interno de base de datos', async () => {
    const req = { usuario: { id_usuario: 1 }, params: { id: '5' } };
    const res = mockRes();
    AnalisisIA.findById.mockRejectedValue(new Error('Internal'));
    await eliminarAnalisis(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
