// tests/middlewares/uploadMiddleware.test.js

const mockMulterMiddleware = vi.fn((req, res, next) => {
  if (req.simularErrorMulterTamanio) {
    const err = new Error('File too large');
    err.code = 'LIMIT_FILE_SIZE';
    Object.setPrototypeOf(err, mockMulter.MulterError.prototype);
    return next(err);
  }
  if (req.simularErrorMulter) {
    const err = new Error('Unexpected field');
    Object.setPrototypeOf(err, mockMulter.MulterError.prototype);
    return next(err);
  }
  if (req.simularErrorNormal) {
    return next(new Error('Normal error'));
  }
  if (!req.file && !req.simularFaltaArchivo) {
    req.file = { originalname: 'test.jpg' };
  } else if (req.simularFaltaArchivo) {
    req.file = undefined;
  }
  return next();
});

const mockMulter = vi.fn(() => ({
  single: vi.fn(() => mockMulterMiddleware)
}));
mockMulter.memoryStorage = vi.fn();
mockMulter.MulterError = class MulterError extends Error {
  constructor(message) { super(message); }
};

require.cache[require.resolve('multer')] = { exports: mockMulter };

const uploadMiddleware = require('../../src/middlewares/uploadMiddleware');

describe('uploadMiddleware', () => {
  const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('debe devolver 400 si el archivo excede el tamaño', () => {
    const req = { simularErrorMulterTamanio: true };
    const res = mockRes();
    const next = vi.fn();
    req.multerNext = (err) => {
      // In uploadMiddleware, upload.single is called, and the callback handles errors.
      // But uploadMiddleware is just a wrapper around upload.single('imagen')(req, res, (err) => ...)
    };

    // uploadMiddleware actually calls upload.single directly and passes the callback
    uploadMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Archivo demasiado grande' }));
  });

  it('debe devolver 400 por otro MulterError', () => {
    const req = { simularErrorMulter: true };
    const res = mockRes();
    const next = vi.fn();
    uploadMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Error de carga' }));
  });

  it('debe devolver 400 por un error normal', () => {
    const req = { simularErrorNormal: true };
    const res = mockRes();
    const next = vi.fn();
    uploadMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Error de validación' }));
  });

  it('debe devolver 400 si no hay archivo (req.file undefined)', () => {
    const req = { simularFaltaArchivo: true };
    const res = mockRes();
    const next = vi.fn();
    uploadMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Imagen requerida' }));
  });

  it('debe llamar a next si todo esta correcto', () => {
    const req = {}; // por defecto pondrá req.file en el mock
    const res = mockRes();
    const next = vi.fn();
    uploadMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('uploadMiddleware - fileFilter', () => {
  it('fileFilter debe validar mimetypes correctos', () => {
    const multerCalls = mockMulter.mock.calls;
    const config = multerCalls[0][0]; // get the config passed to multer
    const fileFilter = config.fileFilter;

    const cbAllowed = vi.fn();
    fileFilter({}, { mimetype: 'image/jpeg' }, cbAllowed);
    expect(cbAllowed).toHaveBeenCalledWith(null, true);

    const cbRejected = vi.fn();
    fileFilter({}, { mimetype: 'application/pdf' }, cbRejected);
    expect(cbRejected).toHaveBeenCalledWith(expect.any(Error), false);
  });
});
