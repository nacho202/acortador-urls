/**
 * API de links simplificada para pruebas
 */

const { nanoid } = require('nanoid');

export const config = {
  runtime: 'nodejs',
};

// Validar URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Normalizar URL
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch (_) {
    return url;
  }
}

export default async function handler(req, res) {
  const { method } = req;
  const sid = req.cookies.sid;

  if (method === 'POST') {
    // Crear nuevo link
    try {
      const { url, slug: customSlug, ttl, enabled = true } = req.body;

      // Validaciones
      if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'URL inválida' });
      }

      if (!sid) {
        return res.status(401).json({ error: 'Sesión requerida' });
      }

      const normalizedUrl = normalizeUrl(url);
      const finalSlug = customSlug || nanoid(7);
      const now = Date.now();

      // Por ahora, solo devolvemos el resultado sin guardar en Redis
      return res.status(201).json({
        slug: finalSlug,
        url: normalizedUrl,
        shortUrl: `${req.headers.host}/${finalSlug}`,
        message: 'Link creado (modo prueba - no guardado en Redis)'
      });

    } catch (error) {
      console.error('Error creando link:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (method === 'GET') {
    // Listar links del usuario (modo prueba)
    try {
      if (!sid) {
        return res.status(401).json({ error: 'Sesión requerida' });
      }

      const { mine = '0' } = req.query;

      if (mine !== '1') {
        return res.status(400).json({ error: 'Parámetro mine=1 requerido' });
      }

      // Por ahora, devolvemos una lista vacía
      return res.status(200).json({ 
        links: [],
        message: 'Modo prueba - no hay links guardados'
      });

    } catch (error) {
      console.error('Error listando links:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
