/**
 * API de tracking - Registra clicks con información detallada
 */

const store = require('../src/lib/store');
const { parseUA } = require('../src/lib/ua');

export const config = {
  runtime: 'nodejs18.x',
};

// Rate limiting para tracking
async function checkTrackingRateLimit(ip, sid) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 100; // 100 requests por minuto para tracking

  // Rate limit por IP
  const ipKey = `rate:ip:${ip}`;
  const ipCount = await store.get(ipKey) || 0;
  
  if (ipCount >= maxRequests) {
    return false;
  }

  // Rate limit por SID
  const sidKey = `rate:sid:${sid}`;
  const sidCount = await store.get(sidKey) || 0;
  
  if (sidCount >= maxRequests) {
    return false;
  }

  // Incrementar contadores
  await store.incr(ipKey);
  await store.incr(sidKey);
  
  // Establecer TTL
  await store.expire(ipKey, 60);
  await store.expire(sidKey, 60);

  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { slug } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const sid = req.cookies.sid;

    if (!slug) {
      return res.status(400).json({ error: 'Slug requerido' });
    }

    // Verificar que el link existe
    if (!(await store.exists(`link:${slug}`))) {
      return res.status(404).json({ error: 'Link no encontrado' });
    }

    // Rate limiting
    if (!(await checkTrackingRateLimit(ip, sid))) {
      return res.status(429).json({ error: 'Demasiadas solicitudes de tracking' });
    }

    // Extraer información de headers
    const referer = req.headers.referer || req.headers.referrer || 'direct';
    const country = req.headers['x-vercel-ip-country'] || 'unknown';
    const region = req.headers['x-vercel-ip-country-region'] || 'unknown';
    const userAgent = req.headers['user-agent'] || '';

    // Parsear User Agent
    const uaInfo = parseUA(userAgent);

    // Crear location string
    const location = region !== 'unknown' ? `${country}-${region}` : country;

    // Extraer host del referer
    let referrerHost = 'direct';
    if (referer !== 'direct') {
      try {
        const refererUrl = new URL(referer);
        referrerHost = refererUrl.hostname;
      } catch (_) {
        referrerHost = 'invalid';
      }
    }

    // Registrar estadísticas
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Incrementar contadores
    await store.incr(`clicks:${slug}:total`);
    await store.zincrby(`clicks:${slug}:byday`, 1, today);
    
    // Estadísticas geográficas
    await store.zincrby(`geo:${slug}`, 1, location);
    
    // Estadísticas de User Agent
    await store.zincrby(`ua:${slug}:device`, 1, uaInfo.device);
    await store.zincrby(`ua:${slug}:os`, 1, uaInfo.os);
    await store.zincrby(`ua:${slug}:browser`, 1, uaInfo.browser);
    
    // Estadísticas de referrer
    await store.zincrby(`ref:${slug}`, 1, referrerHost);

    // Consolidación diaria (opcional, para optimizar)
    // Esto se puede hacer con un cron job en lugar de aquí
    const dailyKey = `clicks:${slug}:byday:${today}`;
    await store.incr(dailyKey);
    await store.expire(dailyKey, 30 * 24 * 60 * 60); // 30 días

    return res.status(204).end();

  } catch (error) {
    console.error('Error en tracking:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
