/**
 * API de redirección simple
 */

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug requerido' });
  }

  try {
    // Por ahora, redirigir a Google como ejemplo
    // En una versión completa, aquí buscarías la URL en la base de datos
    return res.redirect(302, 'https://www.google.com');

  } catch (error) {
    console.error('Error en redirección:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
