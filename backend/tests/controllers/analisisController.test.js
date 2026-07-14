// tests/controllers/analisisController.test.js

const mockDb = {
  query: vi.fn(),
  connect: vi.fn(),
};
const mockImagenLesion = {
  crear: vi.fn(),
  eliminar: vi.fn(),
};
const mockAnalisisIA = {
  crear: vi.fn(),
};
const mockRecomendacion = {
  findByClase: vi.fn(),
};
const mockIaClient = {
  predecir: vi.fn(),
};
const mockSharp = vi.fn(() => ({
  resize: vi.fn().mockReturnThis(),
  toFile: vi.fn().mockResolvedValue(undefined),
}));
const mockFs = {
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
  unlinkSync: vi.fn(),
};

// Register in require.cache
require.cache[require.resolve('../../src/config/db')] = { exports: mockDb };
require.cache[require.resolve('../../src/models/ImagenLesion')] = { exports: mockImagenLesion };
require.cache[require.resolve('../../src/models/AnalisisIA')] = { exports: mockAnalisisIA };
require.cache[require.resolve('../../src/models/Recomendacion')] = { exports: mockRecomendacion };
require.cache[require.resolve('../../src/services/iaClient')] = { exports: mockIaClient };
require.cache[require.resolve('sharp')] = { exports: mockSharp };
require.cache[require.resolve('fs')] = { exports: mockFs };

const ImagenLesion = mockImagenLesion;
const AnalisisIA = mockAnalisisIA;
const Recomendacion = mockRecomendacion;
const { predecir } = mockIaClient;
const sharp = mockSharp;
const fs = mockFs;
const { analizar } = require('../../src/controllers/analisisController');

// ── Helpers ──────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

const crearReqConImagen = () => ({
  usuario: { id_usuario: 1 },
  file: {
    buffer: Buffer.from('fake-image-data'),
    originalname: 'lesion_test.jpg',
    mimetype: 'image/jpeg',
    size: 50000,
  },
});

// ══════════════════════════════════════════════════════════════
// ANALISIS
// ══════════════════════════════════════════════════════════════
describe('analisisController – analizar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Caso 1: Análisis exitoso con melanoma (riesgo ALTO) ────
  it('debe analizar imagen y devolver 201 para melanoma (riesgo alto)', async () => {
    // Arrange
    const req = crearReqConImagen();
    const res = mockRes();

    ImagenLesion.crear.mockResolvedValue({
      id_imagen: 10,
      nombre_archivo: 'lesion_123.jpg',
      ruta_archivo: 'uploads/1/lesion_123.jpg',
    });

    predecir.mockResolvedValue({ clase: 'mel', confianza: 92.5 });

    Recomendacion.findByClase.mockResolvedValue({
      nombre_amigable: 'Melanoma',
      descripcion: 'El melanoma es el tipo más peligroso de cáncer de piel.',
      recomendacion: 'Acuda a un dermatólogo inmediatamente.',
    });

    AnalisisIA.crear.mockResolvedValue({
      id_analisis: 20,
      clase_predicha: 'mel',
      confianza: 92.5,
      nivel_riesgo: 'alto',
      fecha_analisis: new Date(),
    });

    // Act
    await analizar(req, res, mockNext);

    // Assert
    expect(ImagenLesion.crear).toHaveBeenCalled();
    expect(predecir).toHaveBeenCalled();
    expect(Recomendacion.findByClase).toHaveBeenCalledWith('mel');
    expect(AnalisisIA.crear).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        mensaje: 'Análisis completado exitosamente.',
        analisis: expect.objectContaining({
          clase_predicha: 'mel',
          nivel_riesgo: 'alto',
        }),
      })
    );
  });

  // ── Caso 2: Análisis exitoso con nevus benigno (riesgo BAJO)
  it('debe analizar imagen y devolver riesgo bajo para nevus benigno', async () => {
    // Arrange
    const req = crearReqConImagen();
    const res = mockRes();

    ImagenLesion.crear.mockResolvedValue({
      id_imagen: 11,
      nombre_archivo: 'lesion_456.jpg',
      ruta_archivo: 'uploads/1/lesion_456.jpg',
    });

    predecir.mockResolvedValue({ clase: 'nv', confianza: 97.3 });

    Recomendacion.findByClase.mockResolvedValue({
      nombre_amigable: 'Nevo Melanocítico (Lunar)',
      descripcion: 'Los nevos melanocíticos son lunares comunes.',
      recomendacion: 'Autoexamen mensual con regla ABCDE.',
    });

    AnalisisIA.crear.mockResolvedValue({
      id_analisis: 21,
      clase_predicha: 'nv',
      confianza: 97.3,
      nivel_riesgo: 'bajo',
      fecha_analisis: new Date(),
    });

    // Act
    await analizar(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        analisis: expect.objectContaining({
          clase_predicha: 'nv',
          nivel_riesgo: 'bajo',
        }),
      })
    );
  });

  // ── Caso 3: Error del microservicio de IA ──────────────────
  it('debe devolver 503 si el microservicio de IA falla', async () => {
    // Arrange
    const req = crearReqConImagen();
    const res = mockRes();

    ImagenLesion.crear.mockResolvedValue({
      id_imagen: 12,
      nombre_archivo: 'lesion_789.jpg',
      ruta_archivo: 'uploads/1/lesion_789.jpg',
    });

    predecir.mockRejectedValue(new Error('El microservicio de IA no está disponible.'));

    // Act
    await analizar(req, res, mockNext);

    // Assert
    expect(ImagenLesion.eliminar).toHaveBeenCalledWith(12);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Servicio de IA no disponible',
      })
    );
  });

  // ── Caso 4: Análisis exitoso con carcinoma basocelular ─────
  it('debe devolver riesgo moderado para carcinoma basocelular', async () => {
    // Arrange
    const req = crearReqConImagen();
    const res = mockRes();

    ImagenLesion.crear.mockResolvedValue({
      id_imagen: 13,
      ruta_archivo: 'uploads/1/lesion_bcc.jpg',
    });

    predecir.mockResolvedValue({ clase: 'bcc', confianza: 85.0 });

    Recomendacion.findByClase.mockResolvedValue({
      nombre_amigable: 'Carcinoma Basocelular',
      descripcion: 'El carcinoma basocelular es el tipo más común de cáncer de piel.',
      recomendacion: 'Solicite una cita con dermatología urgente.',
    });

    AnalisisIA.crear.mockResolvedValue({
      id_analisis: 22,
      clase_predicha: 'bcc',
      confianza: 85.0,
      nivel_riesgo: 'moderado',
      fecha_analisis: new Date(),
    });

    // Act
    await analizar(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        analisis: expect.objectContaining({
          clase_predicha: 'bcc',
          nivel_riesgo: 'moderado',
        }),
      })
    );
  });

  // ── Caso 5: Clase desconocida sin recomendación mapeada ──────
  it('debe construir explicación fallback si la recomendación no existe', async () => {
    const req = crearReqConImagen();
    const res = mockRes();

    ImagenLesion.crear.mockResolvedValue({ id_imagen: 14, ruta_archivo: 'test.jpg' });
    predecir.mockResolvedValue({ clase: 'unknown', confianza: 50.0 });
    Recomendacion.findByClase.mockResolvedValue(null);
    AnalisisIA.crear.mockResolvedValue({
      id_analisis: 23,
      clase_predicha: 'unknown',
      nivel_riesgo: 'bajo'
    });

    await analizar(req, res, mockNext);

    expect(AnalisisIA.crear).toHaveBeenCalledWith(
      1, 14, 'unknown', 50.0, 'bajo',
      'Se detectó una lesión de tipo "unknown" con una confianza del 50.0%.',
      expect.any(String)
    );
  });

  // ── Caso 6: Error genérico debe llamar a next(err) ───────────
  it('debe llamar a next con el error si ocurre una excepción inesperada', async () => {
    const req = crearReqConImagen();
    const res = mockRes();
    const errorBD = new Error('Error de Base de Datos');

    ImagenLesion.crear.mockRejectedValue(errorBD);

    await analizar(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(errorBD);
  });
});
