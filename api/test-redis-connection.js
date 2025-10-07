/**
 * API de prueba para verificar conexión a Redis
 */

import { get, set, zadd, zrange, hset, hgetall } from '../src/lib/store.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  try {
    console.log('=== TEST DE REDIS ===');
    
    // Verificar variables de entorno
    console.log('Variables de entorno disponibles:');
    console.log('KV_REST_API_URL:', process.env.KV_REST_API_URL ? 'Configurada ✅' : 'No configurada ❌');
    console.log('KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? 'Configurada ✅' : 'No configurada ❌');
    console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? 'Configurada ✅' : 'No configurada ❌');
    console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'Configurada ✅' : 'No configurada ❌');
    
    // Test 1: Guardar un valor simple
    console.log('\n--- Test 1: SET/GET ---');
    await set('test:key', 'test-value');
    const value = await get('test:key');
    console.log('Set/Get test:', value === 'test-value' ? '✅ OK' : '❌ FAIL');
    
    // Test 2: Guardar en hash
    console.log('\n--- Test 2: HSET/HGETALL ---');
    await hset('test:hash', 'field1', 'value1');
    await hset('test:hash', 'field2', 'value2');
    const hash = await hgetall('test:hash');
    console.log('Hash test:', hash);
    
    // Test 3: Sorted set
    console.log('\n--- Test 3: ZADD/ZRANGE ---');
    await zadd('test:sorted', Date.now(), 'item1');
    await zadd('test:sorted', Date.now() + 1000, 'item2');
    const sorted = await zrange('test:sorted', 0, -1);
    console.log('Sorted set test:', sorted);
    
    // Test 4: Verificar all:links
    console.log('\n--- Test 4: Verificar all:links ---');
    const allLinks = await zrange('all:links', 0, -1);
    console.log('Enlaces en all:links:', allLinks.length);
    console.log('Slugs:', allLinks);
    
    // Obtener metadata de cada link
    for (const slug of allLinks) {
      const metadata = await hgetall(`link:${slug}`);
      console.log(`Link ${slug}:`, metadata);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Tests completados - revisa los logs',
      environment: {
        KV_REST_API_URL: !!process.env.KV_REST_API_URL,
        KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
        UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      },
      tests: {
        simpleSetGet: value === 'test-value',
        hash: hash,
        sortedSet: sorted,
        allLinksCount: allLinks.length,
        allLinks: allLinks
      }
    });
    
  } catch (error) {
    console.error('Error en test de Redis:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}

