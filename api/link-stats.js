/**
 * API para ver estadísticas de links
 */

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

    // Por ahora, devolvemos estadísticas de ejemplo con datos más realistas
    // En una versión completa, aquí consultarías Redis para obtener datos reales
    const now = Date.now();
    const totalClicks = Math.floor(Math.random() * 50) + 5;
    
    return res.status(200).json({
      slug: slug,
      totalClicks: totalClicks,
      byDay: Array.from({ length: 14 }, (_, i) => {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          clicks: Math.floor(Math.random() * Math.min(10, totalClicks / 7))
        };
      }).reverse(),
      topGeo: [
        { location: 'US', clicks: Math.floor(totalClicks * 0.4) },
        { location: 'ES', clicks: Math.floor(totalClicks * 0.25) },
        { location: 'MX', clicks: Math.floor(totalClicks * 0.15) },
        { location: 'AR', clicks: Math.floor(totalClicks * 0.1) },
        { location: 'CO', clicks: Math.floor(totalClicks * 0.1) }
      ],
      topReferrers: [
        { referrer: 'direct', clicks: Math.floor(totalClicks * 0.4) },
        { referrer: 'google.com', clicks: Math.floor(totalClicks * 0.3) },
        { referrer: 'facebook.com', clicks: Math.floor(totalClicks * 0.15) },
        { referrer: 'twitter.com', clicks: Math.floor(totalClicks * 0.1) },
        { referrer: 'instagram.com', clicks: Math.floor(totalClicks * 0.05) }
      ],
      devices: [
        { device: 'mobile', clicks: Math.floor(totalClicks * 0.6) },
        { device: 'desktop', clicks: Math.floor(totalClicks * 0.35) },
        { device: 'tablet', clicks: Math.floor(totalClicks * 0.05) }
      ],
      os: [
        { os: 'Android', clicks: Math.floor(totalClicks * 0.4) },
        { os: 'Windows', clicks: Math.floor(totalClicks * 0.3) },
        { os: 'iOS', clicks: Math.floor(totalClicks * 0.2) },
        { os: 'macOS', clicks: Math.floor(totalClicks * 0.1) }
      ],
      browsers: [
        { browser: 'Chrome', clicks: Math.floor(totalClicks * 0.5) },
        { browser: 'Safari', clicks: Math.floor(totalClicks * 0.25) },
        { browser: 'Firefox', clicks: Math.floor(totalClicks * 0.15) },
        { browser: 'Edge', clicks: Math.floor(totalClicks * 0.1) }
      ],
      metadata: {
        createdAt: now - 7 * 24 * 60 * 60 * 1000,
        enabled: true,
        ttl: null,
        lastUpdateAt: now
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
