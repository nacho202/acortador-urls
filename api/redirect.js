/**
 * API de redirección con tracking
 */

export const config = {
  runtime: 'nodejs',
};

// Almacenamiento simple en memoria para URLs
const urlStorage = new Map();

// Función para guardar URL
export function saveUrl(slug, url) {
  urlStorage.set(slug, url);
}

// Función para obtener URL
export function getUrl(slug) {
  return urlStorage.get(slug);
}

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug requerido' });
  }

  try {
    // Buscar URL en el almacenamiento
    const destinationUrl = getUrl(slug);
    
    if (!destinationUrl) {
      return res.status(404).json({ error: 'Enlace no encontrado' });
    }
    
    // Log del click (opcional)
    console.log(`Click en enlace: ${slug} -> ${destinationUrl}`);

    // Redirección inmediata
    return res.redirect(302, destinationUrl);

  } catch (error) {
    console.error('Error en redirección:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
