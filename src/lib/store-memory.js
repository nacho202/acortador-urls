/**
 * Almacenamiento en memoria para desarrollo local
 * Solo usar cuando no hay acceso a Redis/KV
 */

// Almacenamiento simple en memoria
const memoryStore = new Map();
const hashStore = new Map();
const sortedSets = new Map();

/**
 * Obtener valor por clave
 */
export async function get(key) {
  try {
    return memoryStore.get(key) || null;
  } catch (error) {
    console.error('Error getting key:', key, error);
    return null;
  }
}

/**
 * Establecer valor con TTL opcional
 */
export async function set(key, value, ttlSeconds = null) {
  try {
    memoryStore.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => {
        memoryStore.delete(key);
      }, ttlSeconds * 1000);
    }
    return true;
  } catch (error) {
    console.error('Error setting key:', key, error);
    return false;
  }
}

/**
 * Establecer campo en hash
 */
export async function hset(key, field, value) {
  try {
    if (!hashStore.has(key)) {
      hashStore.set(key, new Map());
    }
    hashStore.get(key).set(field, value);
    return true;
  } catch (error) {
    console.error('Error hsetting key:', key, error);
    return false;
  }
}

/**
 * Obtener todos los campos de un hash
 */
export async function hgetall(key) {
  try {
    const hash = hashStore.get(key);
    if (!hash) return {};
    
    const result = {};
    for (const [field, value] of hash) {
      result[field] = value;
    }
    return result;
  } catch (error) {
    console.error('Error hgetall key:', key, error);
    return {};
  }
}

/**
 * Incrementar contador
 */
export async function incr(key) {
  try {
    const current = parseInt(memoryStore.get(key) || '0');
    const newValue = current + 1;
    memoryStore.set(key, newValue.toString());
    return newValue;
  } catch (error) {
    console.error('Error incr key:', key, error);
    return 0;
  }
}

/**
 * Agregar a sorted set
 */
export async function zadd(key, score, member) {
  try {
    if (!sortedSets.has(key)) {
      sortedSets.set(key, new Map());
    }
    sortedSets.get(key).set(member, score);
    return 1;
  } catch (error) {
    console.error('Error zadd key:', key, error);
    return 0;
  }
}

/**
 * Incrementar score en sorted set
 */
export async function zincrby(key, increment, member) {
  try {
    if (!sortedSets.has(key)) {
      sortedSets.set(key, new Map());
    }
    const current = sortedSets.get(key).get(member) || 0;
    const newScore = current + increment;
    sortedSets.get(key).set(member, newScore);
    return newScore;
  } catch (error) {
    console.error('Error zincrby key:', key, error);
    return 0;
  }
}

/**
 * Obtener rango de sorted set
 */
export async function zrange(key, start, stop, withScores = false) {
  try {
    const set = sortedSets.get(key);
    if (!set) return [];
    
    const entries = Array.from(set.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(start, stop + 1);
    
    if (withScores) {
      return entries.flat();
    }
    return entries.map(([member]) => member);
  } catch (error) {
    console.error('Error zrange key:', key, error);
    return [];
  }
}

/**
 * Remover de sorted set
 */
export async function zrem(key, member) {
  try {
    const set = sortedSets.get(key);
    if (!set) return 0;
    
    const existed = set.has(member);
    set.delete(member);
    return existed ? 1 : 0;
  } catch (error) {
    console.error('Error zrem key:', key, error);
    return 0;
  }
}

/**
 * Verificar si existe clave
 */
export async function exists(key) {
  try {
    return memoryStore.has(key) || hashStore.has(key) || sortedSets.has(key);
  } catch (error) {
    console.error('Error exists key:', key, error);
    return false;
  }
}

/**
 * Renombrar clave
 */
export async function rename(oldKey, newKey) {
  try {
    const value = memoryStore.get(oldKey);
    if (value !== undefined) {
      memoryStore.set(newKey, value);
      memoryStore.delete(oldKey);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error rename key:', oldKey, error);
    return false;
  }
}

/**
 * Eliminar clave
 */
export async function del(key) {
  try {
    const memoryDeleted = memoryStore.delete(key);
    const hashDeleted = hashStore.delete(key);
    const setDeleted = sortedSets.delete(key);
    return memoryDeleted || hashDeleted || setDeleted;
  } catch (error) {
    console.error('Error del key:', key, error);
    return false;
  }
}

/**
 * Establecer expiración
 */
export async function expire(key, seconds) {
  try {
    if (memoryStore.has(key)) {
      setTimeout(() => {
        memoryStore.delete(key);
      }, seconds * 1000);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error expire key:', key, error);
    return false;
  }
}

/**
 * Obtener TTL de una clave
 */
export async function ttl(key) {
  try {
    // En memoria no podemos obtener TTL real
    return memoryStore.has(key) ? -1 : -2;
  } catch (error) {
    console.error('Error ttl key:', key, error);
    return -1;
  }
}
