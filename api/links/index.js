/**
 * API de links - Crear y listar links
 */

const { nanoid } = require('nanoid');
const store = require('../../src/lib/store');

export const config = {
  runtime: 'nodejs18.x',
};

// Validar URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Normalizar URL
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch (_) {
    return url;
  }
}

// Rate limiting
async function checkRateLimit(ip, sid) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 10; // 10 requests por minuto

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
  const { method } = req;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const sid = req.cookies.sid;

  if (method === 'POST') {
    // Crear nuevo link
    try {
      const { url, slug: customSlug, ttl, enabled = true } = req.body;

      // Validaciones
      if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'URL inválida' });
      }

      if (!sid) {
        return res.status(401).json({ error: 'Sesión requerida' });
      }

      // Rate limiting
      if (!(await checkRateLimit(ip, sid))) {
        return res.status(429).json({ error: 'Demasiadas solicitudes' });
      }

      const normalizedUrl = normalizeUrl(url);
      const finalSlug = customSlug || nanoid(7);
      const now = Date.now();

      // Verificar si el slug ya existe
      if (await store.exists(`link:${finalSlug}`)) {
        return res.status(409).json({ error: 'Slug ya existe' });
      }

      // Guardar link
      await store.set(`link:${finalSlug}`, normalizedUrl);
      
      // Guardar metadata
      const meta = {
        ownerSid: sid,
        createdAt: now,
        enabled: enabled ? '1' : '0',
        lastUpdateAt: now
      };

      if (ttl && ttl > 0) {
        meta.ttl = ttl.toString();
      }

      for (const [key, value] of Object.entries(meta)) {
        await store.hset(`meta:${finalSlug}`, key, value);
      }

      // Agregar a índice global
      await store.zadd('links:index', now, finalSlug);

      // Agregar a historial del usuario
      await store.zadd(`history:${sid}`, now, finalSlug);

      // Establecer TTL si se especifica
      if (ttl && ttl > 0) {
        await store.expire(`link:${finalSlug}`, ttl);
        await store.expire(`meta:${finalSlug}`, ttl);
      }

      return res.status(201).json({
        slug: finalSlug,
        url: normalizedUrl,
        shortUrl: `${req.headers.host}/${finalSlug}`
      });

    } catch (error) {
      console.error('Error creando link:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (method === 'GET') {
    // Listar links del usuario
    try {
      if (!sid) {
        return res.status(401).json({ error: 'Sesión requerida' });
      }

      const { mine = '0' } = req.query;

      if (mine !== '1') {
        return res.status(400).json({ error: 'Parámetro mine=1 requerido' });
      }

      // Obtener slugs del historial del usuario
      const slugs = await store.zrange(`history:${sid}`, 0, -1);
      const links = [];

      for (const slug of slugs) {
        const url = await store.get(`link:${slug}`);
        const meta = await store.hgetall(`meta:${slug}`);
        const totalClicks = await store.get(`clicks:${slug}:total`) || 0;

        if (url && meta.ownerSid === sid) {
          links.push({
            slug,
            url,
            enabled: meta.enabled === '1',
            createdAt: parseInt(meta.createdAt),
            totalClicks: parseInt(totalClicks),
            ttl: meta.ttl ? parseInt(meta.ttl) : null
          });
        }
      }

      // Ordenar por fecha de creación (más recientes primero)
      links.sort((a, b) => b.createdAt - a.createdAt);

      return res.status(200).json({ links });

    } catch (error) {
      console.error('Error listando links:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
