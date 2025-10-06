/**
 * API para acciones de links (editar, eliminar, estadísticas)
 */

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;
  const sid = req.cookies.sid;

  // Debug: ver qué está llegando
  console.log('Method:', method);
  console.log('Query:', req.query);
  console.log('URL:', req.url);

  if (!slug) {
    return res.status(400).json({ error: 'Slug requerido' });
  }

  try {
    if (method === 'PATCH') {
      // Editar link
      const { url, newSlug, enabled, ttl } = req.body;

      if (!sid) {
        return res.status(401).json({ error: 'Sesión requerida' });
      }

      // Por ahora, solo devolvemos éxito
      return res.status(200).json({
        slug: newSlug || slug,
        url: url || 'https://www.google.com',
        message: 'Link actualizado exitosamente'
      });
    }

    if (method === 'DELETE') {
      // Eliminar link
      if (!sid) {
        return res.status(401).json({ error: 'Sesión requerida' });
      }

      // Por ahora, solo devolvemos éxito
      return res.status(200).json({
        message: 'Link eliminado exitosamente'
      });
    }

    if (method === 'GET') {
      // Ver estadísticas
      if (!sid) {
        return res.status(401).json({ error: 'Sesión requerida' });
      }

      // Por ahora, devolvemos estadísticas de ejemplo
      return res.status(200).json({
        slug: slug,
        totalClicks: Math.floor(Math.random() * 100) + 10,
        byDay: Array.from({ length: 14 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          clicks: Math.floor(Math.random() * 20)
        })),
        topGeo: [
          { location: 'US', clicks: 25 },
          { location: 'ES', clicks: 15 },
          { location: 'MX', clicks: 10 }
        ],
        topReferrers: [
          { referrer: 'google.com', clicks: 30 },
          { referrer: 'direct', clicks: 20 },
          { referrer: 'facebook.com', clicks: 10 }
        ],
        devices: [
          { device: 'mobile', clicks: 40 },
          { device: 'desktop', clicks: 30 },
          { device: 'tablet', clicks: 10 }
        ],
        os: [
          { os: 'Windows', clicks: 35 },
          { os: 'Android', clicks: 25 },
          { os: 'iOS', clicks: 15 }
        ],
        browsers: [
          { browser: 'Chrome', clicks: 45 },
          { browser: 'Safari', clicks: 20 },
          { browser: 'Firefox', clicks: 15 }
        ],
        metadata: {
          createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
          enabled: true,
          ttl: null,
          lastUpdateAt: Date.now()
        }
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('Error en link-actions:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
