/**
 * Almacenamiento en memoria como fallback
 */

// Almacenamiento simple en memoria
const memoryStore = new Map();
const hashStore = new Map();
const sortedSetStore = new Map();

/**
 * Obtener valor por clave
 */
async function get(key) {
  return memoryStore.get(key) || null;
}

/**
 * Establecer valor con TTL opcional
 */
async function set(key, value, ttlSeconds = null) {
  memoryStore.set(key, value);
  if (ttlSeconds) {
    setTimeout(() => memoryStore.delete(key), ttlSeconds * 1000);
  }
  return true;
}

/**
 * Establecer campo en hash
 */
async function hset(key, field, value) {
  if (!hashStore.has(key)) {
    hashStore.set(key, new Map());
  }
  hashStore.get(key).set(field, value);
  return 1;
}

/**
 * Obtener todos los campos de un hash
 */
async function hgetall(key) {
  const hash = hashStore.get(key);
  if (!hash) return {};
  
  const result = {};
  for (const [field, value] of hash) {
    result[field] = value;
  }
  return result;
}

/**
 * Incrementar contador
 */
async function incr(key) {
  const current = parseInt(memoryStore.get(key) || '0');
  const newValue = current + 1;
  memoryStore.set(key, newValue.toString());
  return newValue;
}

/**
 * Agregar a sorted set
 */
async function zadd(key, score, member) {
  if (!sortedSetStore.has(key)) {
    sortedSetStore.set(key, new Map());
  }
  sortedSetStore.get(key).set(member, score);
  return 1;
}

/**
 * Incrementar score en sorted set
 */
async function zincrby(key, increment, member) {
  if (!sortedSetStore.has(key)) {
    sortedSetStore.set(key, new Map());
  }
  const current = sortedSetStore.get(key).get(member) || 0;
  const newScore = current + increment;
  sortedSetStore.get(key).set(member, newScore);
  return newScore;
}

/**
 * Obtener rango de sorted set
 */
async function zrange(key, start, stop, withScores = false) {
  const sortedSet = sortedSetStore.get(key);
  if (!sortedSet) return [];
  
  const entries = Array.from(sortedSet.entries())
    .sort((a, b) => a[1] - b[1]);
  
  const result = entries.slice(start, stop + 1);
  
  if (withScores) {
    return result.flat();
  }
  return result.map(([member]) => member);
}

/**
 * Remover de sorted set
 */
async function zrem(key, member) {
  const sortedSet = sortedSetStore.get(key);
  if (!sortedSet) return 0;
  
  if (sortedSet.has(member)) {
    sortedSet.delete(member);
    return 1;
  }
  return 0;
}

/**
 * Verificar si existe clave
 */
async function exists(key) {
  return memoryStore.has(key) ? 1 : 0;
}

/**
 * Renombrar clave
 */
async function rename(oldKey, newKey) {
  const value = memoryStore.get(oldKey);
  if (value === undefined) return false;
  
  memoryStore.set(newKey, value);
  memoryStore.delete(oldKey);
  return true;
}

/**
 * Eliminar clave
 */
async function del(key) {
  return memoryStore.delete(key) ? 1 : 0;
}

/**
 * Establecer expiración
 */
async function expire(key, seconds) {
  if (!memoryStore.has(key)) return 0;
  
  setTimeout(() => memoryStore.delete(key), seconds * 1000);
  return 1;
}

/**
 * Obtener TTL de una clave
 */
async function ttl(key) {
  // En memoria no podemos saber el TTL exacto
  return memoryStore.has(key) ? -1 : -2;
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