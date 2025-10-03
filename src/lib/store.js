/**
 * Wrapper para Vercel KV y Upstash Redis
 * Auto-detecta el proveedor basado en variables de entorno
 */

let redis;

// Auto-detección del proveedor
if (process.env.USE_UPSTASH === '1') {
  // Usar Upstash Redis
  const { Redis } = require('@upstash/redis');
  redis = Redis.fromEnv();
} else {
  // Usar Vercel KV por defecto
  const { kv } = require('@vercel/kv');
  redis = kv;
}

/**
 * Obtener valor por clave
 */
async function get(key) {
  try {
    return await redis.get(key);
  } catch (error) {
    console.error('Error getting key:', key, error);
    return null;
  }
}

/**
 * Establecer valor con TTL opcional
 */
async function set(key, value, ttlSeconds = null) {
  try {
    if (ttlSeconds) {
      return await redis.setex(key, ttlSeconds, value);
    }
    return await redis.set(key, value);
  } catch (error) {
    console.error('Error setting key:', key, error);
    return false;
  }
}

/**
 * Establecer campo en hash
 */
async function hset(key, field, value) {
  try {
    return await redis.hset(key, field, value);
  } catch (error) {
    console.error('Error hsetting key:', key, error);
    return false;
  }
}

/**
 * Obtener todos los campos de un hash
 */
async function hgetall(key) {
  try {
    return await redis.hgetall(key);
  } catch (error) {
    console.error('Error hgetall key:', key, error);
    return {};
  }
}

/**
 * Incrementar contador
 */
async function incr(key) {
  try {
    return await redis.incr(key);
  } catch (error) {
    console.error('Error incr key:', key, error);
    return 0;
  }
}

/**
 * Agregar a sorted set
 */
async function zadd(key, score, member) {
  try {
    return await redis.zadd(key, score, member);
  } catch (error) {
    console.error('Error zadd key:', key, error);
    return 0;
  }
}

/**
 * Incrementar score en sorted set
 */
async function zincrby(key, increment, member) {
  try {
    return await redis.zincrby(key, increment, member);
  } catch (error) {
    console.error('Error zincrby key:', key, error);
    return 0;
  }
}

/**
 * Obtener rango de sorted set
 */
async function zrange(key, start, stop, withScores = false) {
  try {
    if (withScores) {
      return await redis.zrange(key, start, stop, 'WITHSCORES');
    }
    return await redis.zrange(key, start, stop);
  } catch (error) {
    console.error('Error zrange key:', key, error);
    return [];
  }
}

/**
 * Remover de sorted set
 */
async function zrem(key, member) {
  try {
    return await redis.zrem(key, member);
  } catch (error) {
    console.error('Error zrem key:', key, error);
    return 0;
  }
}

/**
 * Verificar si existe clave
 */
async function exists(key) {
  try {
    return await redis.exists(key);
  } catch (error) {
    console.error('Error exists key:', key, error);
    return false;
  }
}

/**
 * Renombrar clave
 */
async function rename(oldKey, newKey) {
  try {
    return await redis.rename(oldKey, newKey);
  } catch (error) {
    console.error('Error rename key:', oldKey, error);
    return false;
  }
}

/**
 * Eliminar clave
 */
async function del(key) {
  try {
    return await redis.del(key);
  } catch (error) {
    console.error('Error del key:', key, error);
    return false;
  }
}

/**
 * Establecer expiración
 */
async function expire(key, seconds) {
  try {
    return await redis.expire(key, seconds);
  } catch (error) {
    console.error('Error expire key:', key, error);
    return false;
  }
}

/**
 * Obtener TTL de una clave
 */
async function ttl(key) {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error('Error ttl key:', key, error);
    return -1;
  }
}

module.exports = {
  get,
  set,
  hset,
  hgetall,
  incr,
  zadd,
  zincrby,
  zrange,
  zrem,
  exists,
  rename,
  del,
  expire,
  ttl
};
