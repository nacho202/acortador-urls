/**
 * API de prueba para ver el tracking en acción
 */

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Simular datos de tracking para el slug
    const trackingData = {
      slug: slug || 'test-slug',
      totalClicks: Math.floor(Math.random() * 100) + 10,
      recentClicks: [
        {
          timestamp: Date.now() - 1000,
          country: 'US',
          device: 'mobile',
          browser: 'Chrome',
          referer: 'google.com'
        },
        {
          timestamp: Date.now() - 5000,
          country: 'ES',
          device: 'desktop',
          browser: 'Firefox',
          referer: 'direct'
        },
        {
          timestamp: Date.now() - 10000,
          country: 'MX',
          device: 'mobile',
          browser: 'Safari',
          referer: 'facebook.com'
        }
      ]
    };

    return res.status(200).json({
      message: 'Datos de tracking simulados',
      data: trackingData,
      note: 'Estos son datos de ejemplo. En una versión completa, estos datos vendrían de Redis.'
    });

  } catch (error) {
    console.error('Error en test-tracking:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
