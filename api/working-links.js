/**
 * API de links que funciona
 */

import { set, get, zadd, hset, zrange, hgetall } from '../src/lib/store.js';

export const config = {
  runtime: 'nodejs',
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

export default async function handler(req, res) {
  const { method } = req;
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

      const finalSlug = customSlug || Math.random().toString(36).substring(2, 9);
      const now = Date.now();

      // Guardar URL en la base de datos
      await set(`url:${finalSlug}`, url);
      
      // Guardar metadatos del link
      await hset(`link:${finalSlug}`, 'url', url);
      await hset(`link:${finalSlug}`, 'created', now);
      await hset(`link:${finalSlug}`, 'enabled', enabled);
      await hset(`link:${finalSlug}`, 'clicks', 0);
      
      // Agregar a la lista de links del usuario
      await zadd(`user:${sid}:links`, now, finalSlug);
      
      console.log(`URL guardada: ${finalSlug} -> ${url}`);

      // Devolver resultado exitoso
      return res.status(201).json({
        slug: finalSlug,
        url: url,
        shortUrl: `${req.headers.host}/${finalSlug}`,
        message: 'Link creado exitosamente'
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

      // Obtener links del usuario desde la base de datos
      const userLinks = await zrange(`user:${sid}:links`, 0, -1);
      
      const links = [];
      for (const slug of userLinks) {
        const metadata = await hgetall(`link:${slug}`);
        if (metadata && metadata.url) {
          links.push({
            slug: slug,
            url: metadata.url,
            created: metadata.created,
            enabled: metadata.enabled === 'true',
            clicks: parseInt(metadata.clicks) || 0
          });
        }
      }
      
      return res.status(200).json({ 
        links: links,
        message: links.length > 0 ? 'Links obtenidos exitosamente' : 'No hay links guardados'
      });

    } catch (error) {
      console.error('Error listando links:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
