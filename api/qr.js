/**
 * API de generación de QR codes real usando API externa
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
    // Construir URL completa
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const fullUrl = `${protocol}://${host}/${slug}`;

    // Usar API externa para generar QR real
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}`;
    
    // Hacer fetch a la API externa
    const qrResponse = await fetch(qrApiUrl);
    
    if (!qrResponse.ok) {
      throw new Error('Error generando QR desde API externa');
    }

    // Obtener la imagen del QR
    const qrImageBuffer = await qrResponse.arrayBuffer();
    const qrImage = Buffer.from(qrImageBuffer);

    // Configurar headers para cache
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
    res.setHeader('Content-Disposition', `inline; filename="qr-${slug}.png"`);

    return res.status(200).send(qrImage);

  } catch (error) {
    console.error('Error generando QR:', error);
    
    // Fallback: crear un QR simple como SVG
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const fullUrl = `${protocol}://${host}/${slug}`;
    
    const fallbackSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white" stroke="black" stroke-width="2"/>
      <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="10" fill="black">
        ${fullUrl}
      </text>
      <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="8" fill="gray">
        QR Code
      </text>
    </svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache por 5 minutos
    return res.status(200).send(fallbackSvg);
  }
}
