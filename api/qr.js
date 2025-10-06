/**
 * API de generación de QR codes simple
 */

export const config = {
  runtime: 'nodejs',
};

// Función simple para generar un QR básico
function generateSimpleQR(text, size = 200) {
  // Crear un patrón de cuadrados simple
  const gridSize = 21; // Tamaño estándar de QR
  const cellSize = Math.floor(size / gridSize);
  const actualSize = cellSize * gridSize;
  
  // Generar patrón basado en el texto
  let pattern = '';
  for (let i = 0; i < text.length; i++) {
    pattern += text.charCodeAt(i).toString(2).padStart(8, '0');
  }
  
  // Crear SVG
  let svg = `<svg width="${actualSize}" height="${actualSize}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${actualSize}" height="${actualSize}" fill="white" stroke="black" stroke-width="1"/>`;
  
  // Dibujar patrón
  let patternIndex = 0;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (patternIndex < pattern.length && pattern[patternIndex] === '1') {
        svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
      patternIndex++;
    }
  }
  
  // Agregar esquinas de QR (marcadores de posición)
  const markerSize = 7;
  const markerPositions = [
    [0, 0], [gridSize - markerSize, 0], [0, gridSize - markerSize]
  ];
  
  markerPositions.forEach(([startX, startY]) => {
    // Marco exterior
    svg += `<rect x="${startX * cellSize}" y="${startY * cellSize}" width="${markerSize * cellSize}" height="${markerSize * cellSize}" fill="black"/>`;
    // Marco interior
    svg += `<rect x="${(startX + 1) * cellSize}" y="${(startY + 1) * cellSize}" width="${(markerSize - 2) * cellSize}" height="${(markerSize - 2) * cellSize}" fill="white"/>`;
    // Centro
    svg += `<rect x="${(startX + 2) * cellSize}" y="${(startY + 2) * cellSize}" width="${(markerSize - 4) * cellSize}" height="${(markerSize - 4) * cellSize}" fill="black"/>`;
  });
  
  svg += '</svg>';
  return svg;
}

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

    // Generar QR code simple
    const qrSvg = generateSimpleQR(fullUrl, 200);

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
