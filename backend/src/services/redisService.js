// src/services/redisService.js
const Redis = require('ioredis');

let redisClient = null;

/**
 * Inicializa el cliente Redis con los parámetros dados o variables de entorno.
 */
const initRedis = (host, port, options = {}) => {
  if (redisClient) {
    redisClient.disconnect();
  }

  const redisHost = host || process.env.REDIS_HOST || '127.0.0.1';
  const redisPort = port ? parseInt(port, 10) : (parseInt(process.env.REDIS_PORT, 10) || 6379);

  redisClient = new Redis({
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      // Intentar reconectar máximo 3 veces para no bloquear el inicio o pruebas
      if (times > 3) return null;
      return Math.min(times * 100, 2000);
    },
    ...options
  });

  redisClient.on('error', (err) => {
    console.error('Error de Redis:', err.message);
  });

  return redisClient;
};

/**
 * Obtiene la instancia activa de Redis o la inicializa por defecto.
 */
const getClient = () => {
  if (!redisClient) {
    initRedis();
  }
  return redisClient;
};

/**
 * Obtiene un valor de la caché.
 */
const get = async (key) => {
  const client = getClient();
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
};

/**
 * Almacena un valor en la caché con un tiempo de vida (TTL).
 */
const set = async (key, value, ttlSeconds = 3600) => {
  const client = getClient();
  const stringifiedValue = JSON.stringify(value);
  if (ttlSeconds) {
    await client.setex(key, ttlSeconds, stringifiedValue);
  } else {
    await client.set(key, stringifiedValue);
  }
};

/**
 * Elimina una clave de la caché.
 */
const del = async (key) => {
  const client = getClient();
  await client.del(key);
};

/**
 * Cierra la conexión de Redis.
 */
const disconnect = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

module.exports = {
  initRedis,
  getClient,
  get,
  set,
  del,
  disconnect
};
