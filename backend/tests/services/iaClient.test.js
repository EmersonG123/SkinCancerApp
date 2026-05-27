// tests/services/iaClient.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAxios = {
  post: vi.fn(),
};

require.cache[require.resolve('axios')] = { exports: mockAxios };

const axios = mockAxios;
const iaClient = require('../../src/services/iaClient');

describe('iaClient - predecir', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.IA_URL = 'http://localhost:8001/predict';
  });

  it('debe enviar la imagen y retornar la predicción exitosamente', async () => {
    const fakeResponse = { data: { clase: 'mel', confianza: 84.7 } };
    mockAxios.post.mockResolvedValue(fakeResponse);

    const res = await iaClient.predecir(Buffer.from('fake-image'), 'image.jpg');

    expect(mockAxios.post).toHaveBeenCalledWith(
      'http://localhost:8001/predict',
      expect.any(Object),
      expect.objectContaining({
        headers: expect.any(Object),
        timeout: 15000,
      })
    );
    expect(res).toEqual({ clase: 'mel', confianza: 84.7 });
  });

  it('debe manejar error ECONNREFUSED correctamente', async () => {
    const error = new Error('Connection refused');
    error.code = 'ECONNREFUSED';
    mockAxios.post.mockRejectedValue(error);

    await expect(iaClient.predecir(Buffer.from('fake-image'), 'image.jpg')).rejects.toThrow(
      'El microservicio de IA no está disponible'
    );
  });

  it('debe manejar error de timeout correctamente', async () => {
    const error = new Error('Timeout');
    error.code = 'ETIMEDOUT';
    mockAxios.post.mockRejectedValue(error);

    await expect(iaClient.predecir(Buffer.from('fake-image'), 'image.jpg')).rejects.toThrow(
      'El microservicio de IA tardó demasiado en responder'
    );
  });

  it('debe manejar otros errores del servicio de IA', async () => {
    const error = new Error('Unprocessable Entity');
    error.response = { data: { detail: 'Internal error' } };
    mockAxios.post.mockRejectedValue(error);

    await expect(iaClient.predecir(Buffer.from('fake-image'), 'image.jpg')).rejects.toThrow(
      'Error del servicio de IA: Internal error'
    );
  });
});
