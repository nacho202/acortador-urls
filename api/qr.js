/**
 * API de generación de QR codes real
 */

const QRCode = require('qrcode');

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!slug) {
    return res.status(400).json({ error: 'Slug requerido' });
  }

  try {
    // Construir URL completa
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const fullUrl = `${protocol}://${host}/${slug}`;

    // Generar QR code como SVG
    const qrSvg = await QRCode.toString(fullUrl, {
      type: 'svg',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Configurar headers para cache
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
    res.setHeader('Content-Disposition', `inline; filename="qr-${slug}.svg"`);

    return res.status(200).send(qrSvg);

  } catch (error) {
    console.error('Error generando QR:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
