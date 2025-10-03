/**
 * API de administración - Listar todos los links
 */

const store = require('../../src/lib/store');

export const config = {
  runtime: 'nodejs18.x',
};

export default async function handler(req, res) {
  const { method } = req;
  const isAdmin = req.cookies.admin === '1';

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!isAdmin) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere autenticación de administrador.' });
  }

  try {
    const { cursor = '0', limit = 50 } = req.query;
    const limitNum = Math.min(parseInt(limit), 100); // Máximo 100 por página

    // Obtener slugs del índice global con paginación
    const slugs = await store.zrange('links:index', parseInt(cursor), parseInt(cursor) + limitNum - 1);
    
    if (slugs.length === 0) {
      return res.status(200).json({
        links: [],
        nextCursor: null,
        hasMore: false
      });
    }

    const links = [];

    // Obtener información detallada de cada link
    for (const slug of slugs) {
      const url = await store.get(`link:${slug}`);
      const meta = await store.hgetall(`meta:${slug}`);
      const totalClicks = await store.get(`clicks:${slug}:total`) || 0;

      if (url) {
        links.push({
          slug,
          url,
          enabled: meta.enabled === '1',
          createdAt: parseInt(meta.createdAt),
          lastUpdateAt: parseInt(meta.lastUpdateAt),
          totalClicks: parseInt(totalClicks),
          ttl: meta.ttl ? parseInt(meta.ttl) : null,
          ownerSid: meta.ownerSid
        });
      }
    }

    // Verificar si hay más resultados
    const nextCursor = parseInt(cursor) + limitNum;
    const hasMore = slugs.length === limitNum;

    return res.status(200).json({
      links,
      nextCursor: hasMore ? nextCursor.toString() : null,
      hasMore
    });

  } catch (error) {
    console.error('Error obteniendo links de admin:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
