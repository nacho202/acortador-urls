/**
 * API de links individuales - Editar y eliminar
 */

const store = require('../../src/lib/store');

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

// Mover todas las claves relacionadas con un slug
async function moveSlugKeys(oldSlug, newSlug) {
  const keys = [
    `link:${oldSlug}`,
    `meta:${oldSlug}`,
    `clicks:${oldSlug}:total`,
    `clicks:${oldSlug}:byday`,
    `geo:${oldSlug}`,
    `ua:${oldSlug}:device`,
    `ua:${oldSlug}:os`,
    `ua:${oldSlug}:browser`,
    `ref:${oldSlug}`
  ];

  const newKeys = [
    `link:${newSlug}`,
    `meta:${newSlug}`,
    `clicks:${newSlug}:total`,
    `clicks:${newSlug}:byday`,
    `geo:${newSlug}`,
    `ua:${newSlug}:device`,
    `ua:${newSlug}:os`,
    `ua:${newSlug}:browser`,
    `ref:${newSlug}`
  ];

  // Mover cada clave
  for (let i = 0; i < keys.length; i++) {
    if (await store.exists(keys[i])) {
      await store.rename(keys[i], newKeys[i]);
    }
  }

  // Actualizar índice global
  await store.zrem('links:index', oldSlug);
  await store.zadd('links:index', Date.now(), newSlug);
}

// Eliminar todas las claves relacionadas con un slug
async function deleteSlugKeys(slug) {
  const keys = [
    `link:${slug}`,
    `meta:${slug}`,
    `clicks:${slug}:total`,
    `clicks:${slug}:byday`,
    `geo:${slug}`,
    `ua:${slug}:device`,
    `ua:${slug}:os`,
    `ua:${slug}:browser`,
    `ref:${slug}`
  ];

  // Eliminar cada clave
  for (const key of keys) {
    await store.del(key);
  }

  // Remover del índice global
  await store.zrem('links:index', slug);
}

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;
  const sid = req.cookies.sid;
  const isAdmin = req.cookies.admin === '1';

  if (!slug) {
    return res.status(400).json({ error: 'Slug requerido' });
  }

  if (method === 'PATCH') {
    // Editar link
    try {
      const { url, newSlug, enabled, ttl } = req.body;

      // Verificar que el link existe
      if (!(await store.exists(`link:${slug}`))) {
        return res.status(404).json({ error: 'Link no encontrado' });
      }

      // Verificar permisos
      if (!isAdmin) {
        const meta = await store.hgetall(`meta:${slug}`);
        if (meta.ownerSid !== sid) {
          return res.status(403).json({ error: 'Sin permisos para editar este link' });
        }
      }

      const now = Date.now();

      // Actualizar URL si se proporciona
      if (url) {
        if (!isValidUrl(url)) {
          return res.status(400).json({ error: 'URL inválida' });
        }
        const normalizedUrl = normalizeUrl(url);
        await store.set(`link:${slug}`, normalizedUrl);
      }

      // Renombrar slug si se proporciona
      if (newSlug && newSlug !== slug) {
        // Verificar que el nuevo slug no existe
        if (await store.exists(`link:${newSlug}`)) {
          return res.status(409).json({ error: 'El nuevo slug ya existe' });
        }

        // Mover todas las claves
        await moveSlugKeys(slug, newSlug);
        
        // Actualizar historial del usuario si es el owner
        if (!isAdmin) {
          await store.zrem(`history:${sid}`, slug);
          await store.zadd(`history:${sid}`, now, newSlug);
        }

        return res.status(200).json({
          slug: newSlug,
          url: await store.get(`link:${newSlug}`),
          message: 'Slug renombrado exitosamente'
        });
      }

      // Actualizar metadata
      if (enabled !== undefined) {
        await store.hset(`meta:${slug}`, 'enabled', enabled ? '1' : '0');
      }

      if (ttl !== undefined) {
        if (ttl > 0) {
          await store.hset(`meta:${slug}`, 'ttl', ttl.toString());
          await store.expire(`link:${slug}`, ttl);
          await store.expire(`meta:${slug}`, ttl);
        } else {
          await store.hset(`meta:${slug}`, 'ttl', '');
        }
      }

      await store.hset(`meta:${slug}`, 'lastUpdateAt', now.toString());

      return res.status(200).json({
        slug,
        url: await store.get(`link:${slug}`),
        message: 'Link actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error editando link:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (method === 'DELETE') {
    // Eliminar link (solo admin)
    try {
      if (!isAdmin) {
        return res.status(403).json({ error: 'Solo administradores pueden eliminar links' });
      }

      // Verificar que el link existe
      if (!(await store.exists(`link:${slug}`))) {
        return res.status(404).json({ error: 'Link no encontrado' });
      }

      // Obtener metadata para actualizar historial del owner
      const meta = await store.hgetall(`meta:${slug}`);
      if (meta.ownerSid) {
        await store.zrem(`history:${meta.ownerSid}`, slug);
      }

      // Eliminar todas las claves relacionadas
      await deleteSlugKeys(slug);

      return res.status(200).json({ message: 'Link eliminado exitosamente' });

    } catch (error) {
      console.error('Error eliminando link:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
