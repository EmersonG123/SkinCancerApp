// tests/models/ImagenLesion.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = {
  query: vi.fn(),
  connect: vi.fn(),
};

const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = { exports: mockDb };

const pool = mockDb;
const ImagenLesion = require('../../src/models/ImagenLesion');

// ══════════════════════════════════════════════════════════════
// MODELO IMAGENLESION
// ══════════════════════════════════════════════════════════════
describe('Modelo ImagenLesion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── crear ──────────────────────────────────────────────────
  describe('crear', () => {
    it('debe insertar una nueva imagen y retornar el registro', async () => {
      // Arrange
      const fakeImagen = {
        id_imagen: 1,
        id_usuario: 1,
        nombre_archivo: 'lesion_001.jpg',
        ruta_archivo: 'uploads/1/lesion_001.jpg',
        mimetype: 'image/jpeg',
        size_bytes: 50000,
      };
      pool.query.mockResolvedValue({ rows: [fakeImagen] });

      // Act
      const resultado = await ImagenLesion.crear(1, 'lesion_001.jpg', 'uploads/1/lesion_001.jpg', 'image/jpeg', 50000);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO imagenes_lesiones'),
        [1, 'lesion_001.jpg', 'uploads/1/lesion_001.jpg', 'image/jpeg', 50000]
      );
      expect(resultado.id_imagen).toBe(1);
    });
  });

  // ── findById ───────────────────────────────────────────────
  describe('findById', () => {
    it('debe encontrar una imagen por ID', async () => {
      // Arrange
      const fakeImagen = { id_imagen: 5, nombre_archivo: 'lesion.jpg' };
      pool.query.mockResolvedValue({ rows: [fakeImagen] });

      // Act
      const resultado = await ImagenLesion.findById(5);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id_imagen'),
        [5]
      );
      expect(resultado.id_imagen).toBe(5);
    });

    it('debe retornar undefined si la imagen no existe', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      const resultado = await ImagenLesion.findById(999);

      // Assert
      expect(resultado).toBeUndefined();
    });
  });

  // ── eliminar ───────────────────────────────────────────────
  describe('eliminar', () => {
    it('debe eliminar una imagen y retornar el registro eliminado', async () => {
      // Arrange
      const deleted = { id_imagen: 3, nombre_archivo: 'borrada.jpg' };
      pool.query.mockResolvedValue({ rows: [deleted] });

      // Act
      const resultado = await ImagenLesion.eliminar(3);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM imagenes_lesiones'),
        [3]
      );
      expect(resultado.id_imagen).toBe(3);
    });
  });

  // ── findByUsuario ─────────────────────────────────────────
  describe('findByUsuario', () => {
    it('debe listar todas las imágenes de un usuario', async () => {
      // Arrange
      const fakeImages = [
        { id_imagen: 1, nombre_archivo: 'img1.jpg' },
        { id_imagen: 2, nombre_archivo: 'img2.jpg' },
      ];
      pool.query.mockResolvedValue({ rows: fakeImages });

      // Act
      const resultado = await ImagenLesion.findByUsuario(1);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id_usuario'),
        [1]
      );
      expect(resultado).toHaveLength(2);
    });
  });
});
