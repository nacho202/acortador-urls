/**
 * API de redirección con tracking
 */

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug requerido' });
  }

  try {
    // URL de destino (por ahora Google, en una versión completa buscarías en Redis)
    const destinationUrl = 'https://www.google.com';
    
    // Fire-and-forget tracking (no esperamos respuesta)
    const trackingUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/track`;
    
    fetch(trackingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers['user-agent'] || '',
        'Referer': req.headers.referer || req.headers.referrer || '',
        'X-Forwarded-For': req.headers['x-forwarded-for'] || '',
        'X-Vercel-IP-Country': req.headers['x-vercel-ip-country'] || '',
        'X-Vercel-IP-Country-Region': req.headers['x-vercel-ip-country-region'] || ''
      },
      body: JSON.stringify({ slug }),
      keepalive: true
    }).catch(error => {
      console.error('Error enviando tracking:', error);
    });

    // Redirección inmediata
    return res.redirect(302, destinationUrl);

  } catch (error) {
    console.error('Error en redirección:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
