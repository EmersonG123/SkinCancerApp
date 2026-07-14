const mockRedisService = {
  initRedis: vi.fn(),
  getClient: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  disconnect: vi.fn(),
};

require.cache[require.resolve('../../src/services/redisService')] = { exports: mockRedisService };

const redisService = mockRedisService;
const cacheController = require('../../src/controllers/cacheController');

describe('cacheController', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { params: {}, body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  describe('getCache', () => {
    it('debe retornar 400 si no se envía la clave', async () => {
      req.params = {};
      await cacheController.getCache(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'La clave es requerida' });
    });

    it('debe retornar 404 si el valor no existe en la caché', async () => {
      req.params = { key: 'no-existe' };
      redisService.get.mockResolvedValue(null);
      await cacheController.getCache(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Clave no encontrada en el caché' });
    });

    it('debe retornar el valor si existe', async () => {
      req.params = { key: 'mi-clave' };
      redisService.get.mockResolvedValue('mi-valor');
      await cacheController.getCache(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ key: 'mi-clave', value: 'mi-valor' });
    });

    it('debe atrapar errores y llamar a next', async () => {
      req.params = { key: 'err' };
      redisService.get.mockRejectedValue(new Error('Redis Down'));
      await cacheController.getCache(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('setCache', () => {
    it('debe retornar 400 si falta clave o valor', async () => {
      req.body = { key: 'solo-clave' }; // falta value
      await cacheController.setCache(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Clave y valor son requeridos' });
    });

    it('debe guardar con TTL por defecto si no se especifica', async () => {
      req.body = { key: 'key1', value: 'val1' };
      redisService.set.mockResolvedValue();

      await cacheController.setCache(req, res, next);

      expect(redisService.set).toHaveBeenCalledWith('key1', 'val1', 3600);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Clave almacenada exitosamente en el caché',
        key: 'key1',
        value: 'val1',
        ttl: 3600
      });
    });

    it('debe guardar con TTL personalizado', async () => {
      req.body = { key: 'key2', value: 'val2', ttl: '600' };
      redisService.set.mockResolvedValue();

      await cacheController.setCache(req, res, next);

      expect(redisService.set).toHaveBeenCalledWith('key2', 'val2', 600);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('debe atrapar errores y llamar a next', async () => {
      req.body = { key: 'err', value: 'err' };
      redisService.set.mockRejectedValue(new Error('Redis Down'));
      await cacheController.setCache(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deleteCache', () => {
    it('debe retornar 400 si falta la clave', async () => {
      req.params = {};
      await cacheController.deleteCache(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debe borrar correctamente la clave', async () => {
      req.params = { key: 'borrar' };
      redisService.del.mockResolvedValue();
      await cacheController.deleteCache(req, res, next);
      expect(redisService.del).toHaveBeenCalledWith('borrar');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Clave eliminada exitosamente del caché',
        key: 'borrar'
      });
    });

    it('debe atrapar errores y llamar a next', async () => {
      req.params = { key: 'borrar' };
      redisService.del.mockRejectedValue(new Error('Redis Error'));
      await cacheController.deleteCache(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
