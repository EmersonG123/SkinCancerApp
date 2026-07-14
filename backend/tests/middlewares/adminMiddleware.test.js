const adminMiddleware = require('../../src/middlewares/adminMiddleware');

describe('adminMiddleware', () => {
  const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };
  const mockNext = vi.fn();

  it('debe devolver 403 si no hay usuario', () => {
    const req = {};
    const res = mockRes();
    adminMiddleware(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Acceso prohibido' }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debe devolver 403 si el usuario no es admin', () => {
    const req = { usuario: { rol: 'usuario' } };
    const res = mockRes();
    adminMiddleware(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Acceso prohibido' }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debe llamar a next() si el usuario es admin', () => {
    const req = { usuario: { rol: 'admin' } };
    const res = mockRes();
    adminMiddleware(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
