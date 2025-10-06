/**
 * API de tracking simple - solo cuenta clicks
 */

export const config = {
  runtime: 'nodejs',
};

// Almacenamiento simple en memoria
const clickCounts = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { slug } = req.body;
    
    if (!slug) {
      return res.status(400).json({ error: 'Slug requerido' });
    }

    // Incrementar contador de clicks
    const currentCount = clickCounts.get(slug) || 0;
    clickCounts.set(slug, currentCount + 1);
    
    console.log(`Click registrado para ${slug}. Total: ${currentCount + 1}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Click registrado',
      totalClicks: currentCount + 1
    });

  } catch (error) {
    console.error('Error en tracking:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Exportar función para obtener clicks
export function getClickCount(slug) {
  return clickCounts.get(slug) || 0;
}
