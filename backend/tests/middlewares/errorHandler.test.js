// tests/middlewares/errorHandler.test.js

import errorHandler from '../../src/middlewares/errorHandler';

// ── Helpers ──────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// ══════════════════════════════════════════════════════════════
// ERROR HANDLER MIDDLEWARE
// ══════════════════════════════════════════════════════════════
describe('errorHandler middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suprimir console.error en los tests
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  // ── Caso 1: Error genérico 500 ─────────────────────────────
  it('debe devolver 500 para un error sin statusCode', () => {
    // Arrange
    const err = new Error('Algo salió mal');
    const req = { method: 'GET', path: '/api/test' };
    const res = mockRes();
    const next = vi.fn();

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        mensaje: 'Algo salió mal',
      })
    );
  });

  // ── Caso 2: Error con statusCode personalizado ─────────────
  it('debe usar el statusCode proporcionado en el error', () => {
    // Arrange
    const err = new Error('No encontrado');
    err.statusCode = 404;
    err.name = 'NotFoundError';
    const req = { method: 'GET', path: '/api/nada' };
    const res = mockRes();
    const next = vi.fn();

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'NotFoundError',
        mensaje: 'No encontrado',
      })
    );
  });

  // ── Caso 3: Error con propiedad status ─────────────────────
  it('debe aceptar la propiedad status como alternativa a statusCode', () => {
    // Arrange
    const err = new Error('Acceso denegado');
    err.status = 403;
    const req = { method: 'POST', path: '/api/admin' };
    const res = mockRes();
    const next = vi.fn();

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
  });

  // ── Caso 4: Incluir stack trace en desarrollo ──────────────
  it('debe incluir stack trace cuando NODE_ENV es development', () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    const err = new Error('Error de desarrollo');
    const req = { method: 'GET', path: '/api/debug' };
    const res = mockRes();
    const next = vi.fn();

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      })
    );

    // Cleanup
    delete process.env.NODE_ENV;
  });

  // ── Caso 5: No incluir stack trace en producción ───────────
  it('no debe incluir stack trace cuando NODE_ENV es production', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    const err = new Error('Error en producción');
    const req = { method: 'GET', path: '/api/prod' };
    const res = mockRes();
    const next = vi.fn();

    // Act
    errorHandler(err, req, res, next);

    // Assert
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).not.toHaveProperty('stack');

    // Cleanup
    delete process.env.NODE_ENV;
  });
});
