// tests/middlewares/authMiddleware.test.js

const mockJwt = {
  verify: vi.fn(),
};

const jwtPath = require.resolve('jsonwebtoken');
require.cache[jwtPath] = { exports: mockJwt };

const jwt = mockJwt;
const authMiddleware = require('../../src/middlewares/authMiddleware');

// ── Helpers ──────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

// ══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// ══════════════════════════════════════════════════════════════
describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  // ── Caso 1: Token JWT válido ───────────────────────────────
  it('debe llamar a next() si el token es válido', () => {
    // Arrange
    const req = {
      headers: { authorization: 'Bearer valid_token_123' },
    };
    const res = mockRes();

    jwt.verify.mockReturnValue({ id_usuario: 1, rol: 'admin' });

    // Act
    authMiddleware(req, res, mockNext);

    // Assert
    expect(jwt.verify).toHaveBeenCalledWith('valid_token_123', 'test_secret');
    expect(req.usuario).toEqual({ id_usuario: 1, rol: 'admin' });
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  // ── Caso 2: Sin header Authorization ───────────────────────
  it('debe devolver 401 si no hay header Authorization', () => {
    // Arrange
    const req = { headers: {} };
    const res = mockRes();

    // Act
    authMiddleware(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'No autorizado' })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  // ── Caso 3: Header Authorization sin Bearer prefix ────────
  it('debe devolver 401 si el header no tiene prefijo Bearer', () => {
    // Arrange
    const req = {
      headers: { authorization: 'Basic some_token' },
    };
    const res = mockRes();

    // Act
    authMiddleware(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  // ── Caso 4: Token inválido ─────────────────────────────────
  it('debe devolver 401 si el token es inválido', () => {
    // Arrange
    const req = {
      headers: { authorization: 'Bearer invalid_token' },
    };
    const res = mockRes();

    jwt.verify.mockImplementation(() => {
      const err = new Error('jwt malformed');
      err.name = 'JsonWebTokenError';
      throw err;
    });

    // Act
    authMiddleware(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Token inválido' })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  // ── Caso 5: Token expirado ────────────────────────────────
  it('debe devolver 401 con mensaje de token expirado', () => {
    // Arrange
    const req = {
      headers: { authorization: 'Bearer expired_token' },
    };
    const res = mockRes();

    jwt.verify.mockImplementation(() => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      throw err;
    });

    // Act
    authMiddleware(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Token expirado' })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });
});
