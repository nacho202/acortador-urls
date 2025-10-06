/**
 * API de generación de QR codes simple
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

  if (!slug) {
    return res.status(400).json({ error: 'Slug requerido' });
  }

  try {
    // Por ahora, devolvemos un SVG simple
    const qrSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white" stroke="black" stroke-width="2"/>
      <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
        QR: ${slug}
      </text>
    </svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    return res.status(200).send(qrSvg);

  } catch (error) {
    console.error('Error generando QR:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
