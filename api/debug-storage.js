/**
 * API de debug para ver el estado del almacenamiento
 */

const { storage } = require('./storage');

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
    if (slug) {
      // Mostrar datos para un slug específico
      const clicks = storage.clicks.get(slug) || [];
      return res.status(200).json({
        slug: slug,
        totalClicks: clicks.length,
        clicks: clicks,
        message: `Datos para slug: ${slug}`
      });
    } else {
      // Mostrar todos los datos
      const allData = {};
      for (const [slug, clicks] of storage.clicks.entries()) {
        allData[slug] = {
          totalClicks: clicks.length,
          lastClick: clicks.length > 0 ? clicks[clicks.length - 1] : null
        };
      }
      
      return res.status(200).json({
        message: 'Estado del almacenamiento',
        totalSlugs: storage.clicks.size,
        data: allData
      });
    }

  } catch (error) {
    console.error('Error en debug-storage:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
