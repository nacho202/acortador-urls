/**
 * API para ver estadísticas simples - solo clicks
 */

import { getClickCount } from './track.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;
  const sid = req.cookies.sid;

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!slug) {
    return res.status(400).json({ error: 'Slug requerido' });
  }

  try {
    if (!sid) {
      return res.status(401).json({ error: 'Sesión requerida' });
    }

    // Obtener solo el contador de clicks
    const totalClicks = getClickCount(slug);
    
    return res.status(200).json({
      slug: slug,
      totalClicks: totalClicks,
      byDay: Array.from({ length: 14 }, (_, i) => {
        return {
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          clicks: 0 // Simplificado - no trackeamos por día
        };
      }).reverse(),
      topGeo: [],
      topReferrers: [],
      devices: [],
      os: [],
      browsers: [],
      metadata: {
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        enabled: true,
        ttl: null,
        lastUpdateAt: Date.now()
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
