// tests/utils/imageValidator.test.js

const mockSharpMetadata = vi.fn();
const mockSharp = vi.fn(() => ({
  metadata: mockSharpMetadata,
}));

require.cache[require.resolve('sharp')] = { exports: mockSharp };

const { validarImagen, obtenerMetadata } = require('../../src/utils/imageValidator');

describe('imageValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validarImagen', () => {
    it('debe ser válida si las dimensiones son correctas', async () => {
      mockSharpMetadata.mockResolvedValue({ width: 100, height: 100, format: 'jpeg' });

      const res = await validarImagen(Buffer.from('test'));

      expect(res.valida).toBe(true);
      expect(res.ancho).toBe(100);
      expect(res.alto).toBe(100);
    });

    it('debe ser inválida si es muy pequeña', async () => {
      mockSharpMetadata.mockResolvedValue({ width: 10, height: 100, format: 'jpeg' });

      const res = await validarImagen(Buffer.from('test'));

      expect(res.valida).toBe(false);
      expect(res.mensaje).toContain('demasiado pequeña');
    });

    it('debe ser inválida si es muy grande', async () => {
      mockSharpMetadata.mockResolvedValue({ width: 9000, height: 100, format: 'jpeg' });

      const res = await validarImagen(Buffer.from('test'));

      expect(res.valida).toBe(false);
      expect(res.mensaje).toContain('demasiado grande');
    });

    it('debe manejar errores de lectura', async () => {
      mockSharpMetadata.mockRejectedValue(new Error('Corrupted'));

      const res = await validarImagen(Buffer.from('test'));

      expect(res.valida).toBe(false);
      expect(res.mensaje).toContain('No se pudo leer la imagen');
    });
  });

  describe('obtenerMetadata', () => {
    it('debe retornar la metadata completa', async () => {
      mockSharpMetadata.mockResolvedValue({
        width: 100,
        height: 100,
        format: 'jpeg',
        channels: 3,
        space: 'srgb',
      });

      const res = await obtenerMetadata(Buffer.from('test'));

      expect(res).toEqual({
        ancho: 100,
        alto: 100,
        formato: 'jpeg',
        canales: 3,
        espacio: 'srgb',
      });
    });
  });
});
