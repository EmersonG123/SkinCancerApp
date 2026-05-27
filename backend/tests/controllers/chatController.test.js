// tests/controllers/chatController.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = {
  query: vi.fn(),
  connect: vi.fn(),
};
const mockAnalisisIA = {
  findById: vi.fn(),
};
const mockChatHistorial = {
  crear: vi.fn(),
  findByAnalisis: vi.fn(),
};

// Register in require.cache
require.cache[require.resolve('../../src/config/db')] = { exports: mockDb };
require.cache[require.resolve('../../src/models/AnalisisIA')] = { exports: mockAnalisisIA };
require.cache[require.resolve('../../src/models/ChatHistorial')] = { exports: mockChatHistorial };

const AnalisisIA = mockAnalisisIA;
const ChatHistorial = mockChatHistorial;
const { preguntar, obtenerHistorialChat } = require('../../src/controllers/chatController');

// ── Helpers ──────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

// ══════════════════════════════════════════════════════════════
// PREGUNTAR
// ══════════════════════════════════════════════════════════════
describe('chatController – preguntar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe responder exitosamente a una pregunta del usuario', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id_analisis: '5' },
      body: { pregunta: '¿Qué es un melanoma?' },
    };
    const res = mockRes();

    AnalisisIA.findById.mockResolvedValue({
      id_analisis: 5,
      id_usuario: 1,
      clase_predicha: 'mel',
    });

    ChatHistorial.crear
      .mockResolvedValueOnce({ id_mensaje: 100 }) // mensaje usuario
      .mockResolvedValueOnce({                     // respuesta asistente
        id_mensaje: 101,
        rol: 'asistente',
        contenido: 'El melanoma es el tipo más agresivo de cáncer de piel.',
        created_at: new Date(),
      });

    // Act
    await preguntar(req, res, mockNext);

    // Assert
    expect(ChatHistorial.crear).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        respuesta: expect.any(String),
        mensaje: expect.objectContaining({
          id_mensaje: 101,
          rol: 'asistente',
        }),
      })
    );
  });

  it('debe devolver 400 si la pregunta está vacía', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id_analisis: '5' },
      body: { pregunta: '' },
    };
    const res = mockRes();

    // Act
    await preguntar(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Pregunta requerida' })
    );
  });

  it('debe devolver 404 si el análisis no existe', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id_analisis: '999' },
      body: { pregunta: '¿Es peligroso?' },
    };
    const res = mockRes();

    AnalisisIA.findById.mockResolvedValue(undefined);

    // Act
    await preguntar(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('debe devolver 403 si el análisis pertenece a otro usuario', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id_analisis: '5' },
      body: { pregunta: '¿Es peligroso?' },
    };
    const res = mockRes();

    AnalisisIA.findById.mockResolvedValue({
      id_analisis: 5,
      id_usuario: 99,
    });

    // Act
    await preguntar(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('debe responder con la respuesta por defecto si no coincide ninguna palabra clave', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id_analisis: '5' },
      body: { pregunta: '¿Cuántos años tiene esta plataforma?' },
    };
    const res = mockRes();

    AnalisisIA.findById.mockResolvedValue({
      id_analisis: 5,
      id_usuario: 1,
      clase_predicha: 'nv',
    });

    ChatHistorial.crear
      .mockResolvedValueOnce({ id_mensaje: 200 })
      .mockResolvedValueOnce({
        id_mensaje: 201,
        rol: 'asistente',
        contenido: 'respuesta_defecto',
        created_at: new Date(),
      });

    // Act
    await preguntar(req, res, mockNext);

    // Assert
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        respuesta: expect.stringContaining('sistema de apoyo informativo'),
      })
    );
  });
});

// ══════════════════════════════════════════════════════════════
// OBTENER HISTORIAL CHAT
// ══════════════════════════════════════════════════════════════
describe('chatController – obtenerHistorialChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe devolver el historial de mensajes de un análisis', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id_analisis: '5' },
    };
    const res = mockRes();

    AnalisisIA.findById.mockResolvedValue({
      id_analisis: 5,
      id_usuario: 1,
    });

    const mockMensajes = [
      { id_mensaje: 1, rol: 'usuario', contenido: '¿Es grave?' },
      { id_mensaje: 2, rol: 'asistente', contenido: 'El nivel de riesgo es bajo.' },
    ];
    ChatHistorial.findByAnalisis.mockResolvedValue(mockMensajes);

    // Act
    await obtenerHistorialChat(req, res, mockNext);

    // Assert
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        mensajes: mockMensajes,
        total: 2,
      })
    );
  });

  it('debe devolver 404 si el análisis no existe', async () => {
    // Arrange
    const req = {
      usuario: { id_usuario: 1 },
      params: { id_analisis: '999' },
    };
    const res = mockRes();

    AnalisisIA.findById.mockResolvedValue(undefined);

    // Act
    await obtenerHistorialChat(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
