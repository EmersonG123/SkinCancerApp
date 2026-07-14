// tests/services/redisService.test.js

const mockRedisInstance = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  quit: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
};

const mockRedisClass = vi.fn(() => mockRedisInstance);
require.cache[require.resolve('ioredis')] = { exports: mockRedisClass };

const redisService = require('../../src/services/redisService');

describe('redisService', () => {
  let redisClientMock;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REDIS_HOST = '127.0.0.1';
    process.env.REDIS_PORT = '6379';

    // Reset singleton before each test
    if (redisService.getClient() && redisService.getClient().disconnect) {
      redisService.disconnect();
    }
    // initRedis manually
    redisService.initRedis();
    redisClientMock = redisService.getClient();
  });

  afterEach(async () => {
    await redisService.disconnect();
  });

  it('debe inicializar Redis correctamente (initRedis)', () => {
    // Already init inside beforeEach, let's call it again with params
    const client = redisService.initRedis('192.168.1.1', 6380, { maxRetriesPerRequest: 2 });
    expect(mockRedisClass).toHaveBeenCalledWith(expect.objectContaining({
      host: '192.168.1.1',
      port: 6380,
      maxRetriesPerRequest: 2,
    }));

    // Testing retryStrategy
    const callArgs = mockRedisClass.mock.calls[mockRedisClass.mock.calls.length - 1][0];
    expect(callArgs.retryStrategy(4)).toBe(null);
    expect(callArgs.retryStrategy(2)).toBe(200);

    // Call error handler
    const onCall = client.on.mock.calls.find(c => c[0] === 'error');
    if (onCall) {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      onCall[1](new Error('Test Error'));
      expect(consoleSpy).toHaveBeenCalledWith('Error de Redis:', 'Test Error');
      consoleSpy.mockRestore();
    }
  });

  it('debe obtener cliente existente o crear uno nuevo (getClient)', async () => {
    await redisService.disconnect();
    const client = redisService.getClient();
    expect(client).toBeDefined();

    const client2 = redisService.getClient();
    expect(client).toBe(client2); // Should be the exact same instance
  });

  it('debe obtener un valor y parsearlo (get)', async () => {
    redisClientMock.get.mockResolvedValueOnce('{"hola":"mundo"}');
    const value = await redisService.get('test_key');
    expect(redisClientMock.get).toHaveBeenCalledWith('test_key');
    expect(value).toEqual({ hola: 'mundo' });
  });

  it('debe obtener null si la clave no existe (get)', async () => {
    redisClientMock.get.mockResolvedValueOnce(null);
    const value = await redisService.get('no_existe');
    expect(value).toBeNull();
  });

  it('debe guardar un valor con TTL por defecto (set)', async () => {
    await redisService.set('key1', { foo: 'bar' });
    expect(redisClientMock.setex).toHaveBeenCalledWith('key1', 3600, '{"foo":"bar"}');
  });

  it('debe guardar un valor sin TTL (set)', async () => {
    await redisService.set('key2', { foo: 'bar' }, null);
    expect(redisClientMock.set).toHaveBeenCalledWith('key2', '{"foo":"bar"}');
  });

  it('debe eliminar una clave (del)', async () => {
    await redisService.del('key3');
    expect(redisClientMock.del).toHaveBeenCalledWith('key3');
  });

  it('debe desconectar si hay un cliente activo (disconnect)', async () => {
    const client = redisService.getClient();
    await redisService.disconnect();
    expect(client.quit).toHaveBeenCalled();
  });

  it('no debe romper si se llama a disconnect sin cliente activo', async () => {
    await redisService.disconnect(); // First disconnect closes and nullifies
    await redisService.disconnect(); // Second disconnect should do nothing and not throw
    // Just expect not to throw
    expect(true).toBe(true);
  });
});
