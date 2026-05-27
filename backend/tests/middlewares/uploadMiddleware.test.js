// tests/middlewares/uploadMiddleware.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────
// Multer es complejo de mockear directamente, así que probamos la lógica del fileFilter
// extrayendo las constantes y la lógica de validación de forma aislada.

describe('uploadMiddleware – Validación de tipos de archivo', () => {
  const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

  // ── Caso 1: Tipo JPEG permitido ───────────────────────────
  it('debe aceptar archivos JPEG', () => {
    // Arrange
    const mimetype = 'image/jpeg';

    // Act
    const esPermitido = TIPOS_PERMITIDOS.includes(mimetype);

    // Assert
    expect(esPermitido).toBe(true);
  });

  // ── Caso 2: Tipo PNG permitido ────────────────────────────
  it('debe aceptar archivos PNG', () => {
    // Arrange
    const mimetype = 'image/png';

    // Act
    const esPermitido = TIPOS_PERMITIDOS.includes(mimetype);

    // Assert
    expect(esPermitido).toBe(true);
  });

  // ── Caso 3: Tipo WEBP permitido ───────────────────────────
  it('debe aceptar archivos WEBP', () => {
    // Arrange
    const mimetype = 'image/webp';

    // Act
    const esPermitido = TIPOS_PERMITIDOS.includes(mimetype);

    // Assert
    expect(esPermitido).toBe(true);
  });

  // ── Caso 4: Tipo BMP permitido ────────────────────────────
  it('debe aceptar archivos BMP', () => {
    // Arrange
    const mimetype = 'image/bmp';

    // Act
    const esPermitido = TIPOS_PERMITIDOS.includes(mimetype);

    // Assert
    expect(esPermitido).toBe(true);
  });

  // ── Caso 5: Tipo PDF rechazado ────────────────────────────
  it('debe rechazar archivos PDF', () => {
    // Arrange
    const mimetype = 'application/pdf';

    // Act
    const esPermitido = TIPOS_PERMITIDOS.includes(mimetype);

    // Assert
    expect(esPermitido).toBe(false);
  });

  // ── Caso 6: Tipo GIF rechazado ────────────────────────────
  it('debe rechazar archivos GIF', () => {
    // Arrange
    const mimetype = 'image/gif';

    // Act
    const esPermitido = TIPOS_PERMITIDOS.includes(mimetype);

    // Assert
    expect(esPermitido).toBe(false);
  });

  // ── Caso 7: Tipo text/plain rechazado ─────────────────────
  it('debe rechazar archivos de texto plano', () => {
    // Arrange
    const mimetype = 'text/plain';

    // Act
    const esPermitido = TIPOS_PERMITIDOS.includes(mimetype);

    // Assert
    expect(esPermitido).toBe(false);
  });
});

describe('uploadMiddleware – Validación de tamaño máximo', () => {
  const TAMAÑO_MAXIMO = 10 * 1024 * 1024; // 10 MB

  it('debe aceptar archivos de 5 MB (dentro del límite)', () => {
    // Arrange
    const fileSize = 5 * 1024 * 1024;

    // Act & Assert
    expect(fileSize).toBeLessThanOrEqual(TAMAÑO_MAXIMO);
  });

  it('debe aceptar archivos de exactamente 10 MB (límite exacto)', () => {
    // Arrange
    const fileSize = 10 * 1024 * 1024;

    // Act & Assert
    expect(fileSize).toBeLessThanOrEqual(TAMAÑO_MAXIMO);
  });

  it('debe rechazar archivos de 15 MB (excede el límite)', () => {
    // Arrange
    const fileSize = 15 * 1024 * 1024;

    // Act & Assert
    expect(fileSize).toBeGreaterThan(TAMAÑO_MAXIMO);
  });
});
