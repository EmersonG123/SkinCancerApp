// tests/controllers/authController.test.js

const mockDb = {
  query: vi.fn(),
  connect: vi.fn(),
};
const mockUsuario = {
  findByEmail: vi.fn(),
  crear: vi.fn(),
};
const mockBcrypt = {
  hash: vi.fn(),
  compare: vi.fn(),
};
const mockJwt = {
  sign: vi.fn(),
};

// Register in require.cache
require.cache[require.resolve('../../src/config/db')] = { exports: mockDb };
require.cache[require.resolve('../../src/models/Usuario')] = { exports: mockUsuario };
require.cache[require.resolve('bcrypt')] = { exports: mockBcrypt };
require.cache[require.resolve('jsonwebtoken')] = { exports: mockJwt };

const Usuario = mockUsuario;
const bcrypt = mockBcrypt;
const jwt = mockJwt;
const { register, login } = require('../../src/controllers/authController');

// ── Helper: req/res simulados ────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

// ══════════════════════════════════════════════════════════════
// REGISTER
// ══════════════════════════════════════════════════════════════
describe('authController – register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  // ── Caso 1: Registro exitoso ───────────────────────────────
  it('debe registrar un usuario nuevo y devolver 201', async () => {
    // Arrange
    const req = {
      body: {
        email: 'nuevo@test.com',
        nombre: 'Dr. Test',
        password: 'password123',
        license: 'CO-12345-A',
        specialty: 'dermatology',
      },
    };
    const res = mockRes();

    Usuario.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed_password');
    Usuario.crear.mockResolvedValue({
      id_usuario: 1,
      email: 'nuevo@test.com',
      nombre: 'Dr. Test',
      license: 'CO-12345-A',
      specialty: 'Dermatología Clínica',
      analyses: 0,
      precision: 95,
      rol: 'usuario',
      created_at: new Date(),
    });

    // Act
    await register(req, res, mockNext);

    // Assert
    expect(Usuario.findByEmail).toHaveBeenCalledWith('nuevo@test.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(Usuario.crear).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        mensaje: 'Cuenta creada exitosamente.',
        usuario: expect.objectContaining({
          id_usuario: 1,
          email: 'nuevo@test.com',
        }),
      })
    );
  });

  // ── Caso 2: Campos requeridos faltantes ────────────────────
  it('debe devolver 400 si faltan campos obligatorios', async () => {
    // Arrange
    const req = { body: { email: '', nombre: '', password: '' } };
    const res = mockRes();

    // Act
    await register(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Campos requeridos',
      })
    );
  });

  // ── Caso 3: Contraseña menor a 6 caracteres ───────────────
  it('debe devolver 400 si la contraseña tiene menos de 6 caracteres', async () => {
    // Arrange
    const req = {
      body: { email: 'test@test.com', nombre: 'Test', password: '123' },
    };
    const res = mockRes();

    // Act
    await register(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Contraseña débil' })
    );
  });

  // ── Caso 4: Email duplicado ────────────────────────────────
  it('debe devolver 409 si el email ya está registrado', async () => {
    // Arrange
    const req = {
      body: {
        email: 'existente@test.com',
        nombre: 'Dr. Existe',
        password: 'password123',
      },
    };
    const res = mockRes();

    Usuario.findByEmail.mockResolvedValue({ id_usuario: 5, email: 'existente@test.com' });

    // Act
    await register(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Email ya registrado' })
    );
  });
});

// ══════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════
describe('authController – login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  // ── Caso 1: Login exitoso ──────────────────────────────────
  it('debe iniciar sesión correctamente y devolver token + usuario', async () => {
    // Arrange
    const req = {
      body: { email: 'emerson@gmail.com', password: 'eng947750' },
    };
    const res = mockRes();

    Usuario.findByEmail.mockResolvedValue({
      id_usuario: 1,
      email: 'emerson@gmail.com',
      nombre: 'Ing. Emerson',
      password_hash: 'hashed_eng947750',
      license: 'ADM-947750-X',
      specialty: 'Administrador de Sistema',
      analyses: 0,
      precision: 100,
      rol: 'admin',
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('jwt_token_mock');

    // Act
    await login(req, res, mockNext);

    // Assert
    expect(Usuario.findByEmail).toHaveBeenCalledWith('emerson@gmail.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('eng947750', 'hashed_eng947750');
    expect(jwt.sign).toHaveBeenCalledWith(
      { id_usuario: 1, rol: 'admin' },
      'test_secret',
      { expiresIn: '24h' }
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'jwt_token_mock',
        usuario: expect.objectContaining({
          id_usuario: 1,
          email: 'emerson@gmail.com',
          name: 'Ing. Emerson',
        }),
      })
    );
  });

  // ── Caso 2: Campos requeridos vacíos ───────────────────────
  it('debe devolver 400 si faltan email o password', async () => {
    // Arrange
    const req = { body: { email: '', password: '' } };
    const res = mockRes();

    // Act
    await login(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Campos requeridos' })
    );
  });

  // ── Caso 3: Usuario no encontrado ─────────────────────────
  it('debe devolver 401 si el email no existe en la BD', async () => {
    // Arrange
    const req = {
      body: { email: 'noexiste@test.com', password: 'password123' },
    };
    const res = mockRes();

    Usuario.findByEmail.mockResolvedValue(null);

    // Act
    await login(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Credenciales inválidas' })
    );
  });

  // ── Caso 4: Contraseña incorrecta ─────────────────────────
  it('debe devolver 401 si la contraseña es incorrecta', async () => {
    // Arrange
    const req = {
      body: { email: 'emerson@gmail.com', password: 'wrongpassword' },
    };
    const res = mockRes();

    Usuario.findByEmail.mockResolvedValue({
      id_usuario: 1,
      email: 'emerson@gmail.com',
      password_hash: 'hashed_real',
      rol: 'admin',
    });
    bcrypt.compare.mockResolvedValue(false);

    // Act
    await login(req, res, mockNext);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed_real');
  });
});
