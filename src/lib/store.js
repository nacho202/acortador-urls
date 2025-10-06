/**
 * Wrapper para Vercel KV y Upstash Redis
 * Auto-detecta el proveedor basado en variables de entorno
 */

// Función para cargar variables de entorno en desarrollo
async function loadEnvVars() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { config } = await import('dotenv');
      config({ path: '.env.local' });
    } catch (error) {
      // dotenv no está disponible o no hay archivo .env.local
    }
  }
}

let redis;

// Función para inicializar el almacenamiento
async function initializeRedis() {
  // Cargar variables de entorno si es necesario
  await loadEnvVars();
  
  // Debug: Mostrar información sobre variables de entorno
  console.log('🔍 Debug - Variables de entorno:');
  console.log('  USE_UPSTASH:', process.env.USE_UPSTASH);
  console.log('  UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? 'Configurada' : 'No configurada');
  console.log('  UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'Configurada' : 'No configurada');
  console.log('  KV_REST_API_URL:', process.env.KV_REST_API_URL ? 'Configurada' : 'No configurada');
  console.log('  KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? 'Configurada' : 'No configurada');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  
  if (process.env.USE_UPSTASH === '1') {
    // Usar Upstash Redis
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const { Redis } = await import('@upstash/redis');
        return Redis.fromEnv();
      } catch (error) {
        console.warn('Upstash Redis no disponible, usando almacenamiento en memoria');
        return await import('./store-memory.js');
      }
    } else {
      console.warn('Variables de entorno de Upstash no configuradas, usando almacenamiento en memoria');
      return await import('./store-memory.js');
    }
  } else {
    // Usar Vercel KV por defecto
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        return kv;
      } catch (error) {
        console.warn('Vercel KV no disponible, usando almacenamiento en memoria');
        return await import('./store-memory.js');
      }
    } else {
      console.warn('Variables de entorno de Vercel KV no configuradas, usando almacenamiento en memoria');
      return await import('./store-memory.js');
    }
  }
}

// Inicializar redis de forma lazy
async function getRedis() {
  if (!redis) {
    redis = await initializeRedis();
  }
  return redis;
}

/**
 * Obtener valor por clave
 */
async function get(key) {
  try {
    const client = await getRedis();
    return await client.get(key);
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
    const client = await getRedis();
    if (ttlSeconds) {
      return await client.setex(key, ttlSeconds, value);
    }
    return await client.set(key, value);
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
    const client = await getRedis();
    return await client.hset(key, field, value);
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
    const client = await getRedis();
    return await client.hgetall(key);
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
    const client = await getRedis();
    return await client.incr(key);
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
    const client = await getRedis();
    return await client.zadd(key, score, member);
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
    const client = await getRedis();
    return await client.zincrby(key, increment, member);
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
    const client = await getRedis();
    if (withScores) {
      return await client.zrange(key, start, stop, 'WITHSCORES');
    }
    return await client.zrange(key, start, stop);
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
    const client = await getRedis();
    return await client.zrem(key, member);
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
    const client = await getRedis();
    return await client.exists(key);
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
    const client = await getRedis();
    return await client.rename(oldKey, newKey);
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
    const client = await getRedis();
    return await client.del(key);
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
    const client = await getRedis();
    return await client.expire(key, seconds);
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
    const client = await getRedis();
    return await client.ttl(key);
  } catch (error) {
    console.error('Error ttl key:', key, error);
    return -1;
  }
}

export {
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
