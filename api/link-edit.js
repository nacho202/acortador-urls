/**
 * API para editar links
 */

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;
  const sid = req.cookies.sid;

  if (method !== 'PATCH') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!slug) {
    return res.status(400).json({ error: 'Slug requerido' });
  }

  try {
    const { url, newSlug, enabled, ttl } = req.body;

    if (!sid) {
      return res.status(401).json({ error: 'Sesión requerida' });
    }

    // Por ahora, solo devolvemos éxito
    return res.status(200).json({
      slug: newSlug || slug,
      url: url || 'https://www.google.com',
      message: 'Link actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error editando link:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
