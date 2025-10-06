/**
 * API para ver estadísticas de links
 */

const { getRealStats, getConsistentData } = require('./storage');

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

    // Obtener estadísticas reales o consistentes
    const stats = getRealStats(slug);
    
    // Debug: ver qué datos estamos devolviendo
    console.log(`Stats for ${slug}:`, {
      totalClicks: stats.totalClicks,
      hasRealClicks: stats.totalClicks > 0
    });
    
    return res.status(200).json({
      slug: slug,
      ...stats,
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
