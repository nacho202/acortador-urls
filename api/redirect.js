/**
 * API de redirección con tracking
 */

import { get, incr, hgetall, hset } from '../src/lib/store.js';

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
    
    // Incrementar contador de clicks en el hash del link
    const metadata = await hgetall(`link:${slug}`);
    const currentClicks = parseInt(metadata?.clicks || 0);
    const newClicks = currentClicks + 1;
    await hset(`link:${slug}`, 'clicks', newClicks);
    
    // Log del click
    console.log(`Click en enlace: ${slug} -> ${destinationUrl} (clicks: ${newClicks})`);

    // Redirección inmediata
    return res.redirect(302, destinationUrl);

  } catch (error) {
    console.error('Error en redirección:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
