/**
 * API de redirección con tracking
 */

const { get, incr, hgetall } = require('../src/lib/store');

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug requerido' });
  }

  try {
    // Buscar URL en la base de datos
    const destinationUrl = await get(`url:${slug}`);
    console.log(`Buscando URL para slug: ${slug}, encontrada: ${destinationUrl}`);
    
    if (!destinationUrl) {
      console.log(`URL no encontrada para slug: ${slug}`);
      return res.status(404).json({ error: 'Enlace no encontrado' });
    }
    
    // Incrementar contador de clicks
    await incr(`clicks:${slug}`);
    
    // Log del click
    console.log(`Click en enlace: ${slug} -> ${destinationUrl}`);

    // Redirección inmediata
    return res.redirect(302, destinationUrl);

  } catch (error) {
    console.error('Error en redirección:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
