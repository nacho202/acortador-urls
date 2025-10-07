/**
 * API para listar enlaces del admin
 */

import { zrange, hgetall } from '../src/lib/store.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { method } = req;
  const { cursor = '0', limit = '20' } = req.query;

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar si es admin
    const isAdmin = req.cookies.admin === '1';
    
    if (!isAdmin) {
      return res.status(401).json({ error: 'Acceso denegado' });
    }

    // Obtener todos los enlaces desde Redis
    const allLinks = await zrange('all:links', 0, -1);
    const links = [];
    
    for (const slug of allLinks) {
      const metadata = await hgetall(`link:${slug}`);
      if (metadata && metadata.url) {
        links.push({
          slug: slug,
          url: metadata.url,
          totalClicks: parseInt(metadata.clicks) || 0,
          createdAt: parseInt(metadata.created) || Date.now(),
          enabled: metadata.enabled === 'true' || metadata.enabled === true,
          ownerSid: metadata.ownerSid || 'unknown'
        });
      }
    }
    
    // Si no hay links, devolver array vacío
    if (links.length === 0) {
      console.log('No hay links creados todavía');
    } else {
      console.log(`Admin: ${links.length} links encontrados`);
    }

    return res.status(200).json({
      links: links,
      total: links.length,
      cursor: '0',
      hasMore: false
    });

  } catch (error) {
    console.error('Error obteniendo enlaces:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
