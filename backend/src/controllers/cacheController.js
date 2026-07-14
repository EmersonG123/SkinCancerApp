// src/controllers/cacheController.js
const redisService = require('../services/redisService');

/**
 * Obtiene el valor asociado a una clave en la caché.
 */
const getCache = async (req, res, next) => {
  try {
    const { key } = req.params;
    if (!key) {
      return res.status(400).json({ error: 'La clave es requerida' });
    }
    const value = await redisService.get(key);
    if (value === null) {
      return res.status(404).json({ message: 'Clave no encontrada en el caché' });
    }
    return res.status(200).json({ key, value });
  } catch (err) {
    next(err);
  }
};

/**
 * Guarda un valor en la caché con una clave y un TTL opcional.
 */
const setCache = async (req, res, next) => {
  try {
    const { key, value, ttl } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Clave y valor son requeridos' });
    }
    const ttlSeconds = ttl ? parseInt(ttl, 10) : 3600;
    await redisService.set(key, value, ttlSeconds);
    return res.status(201).json({
      message: 'Clave almacenada exitosamente en el caché',
      key,
      value,
      ttl: ttlSeconds
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Elimina una clave de la caché.
 */
const deleteCache = async (req, res, next) => {
  try {
    const { key } = req.params;
    if (!key) {
      return res.status(400).json({ error: 'La clave es requerida' });
    }
    await redisService.del(key);
    return res.status(200).json({ message: 'Clave eliminada exitosamente del caché', key });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache
};
