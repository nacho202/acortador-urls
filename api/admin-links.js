/**
 * API para listar enlaces del admin
 */

import { getUrl } from './redirect.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { method } = req;
  const { cursor = '0', limit = '20' } = req.query;

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar si es admin
    const isAdmin = req.cookies.admin === '1';
    
    if (!isAdmin) {
      return res.status(401).json({ error: 'Acceso denegado' });
    }

    // Por ahora, devolver enlaces de ejemplo
    // En una versión completa, aquí consultarías Redis
    const links = [
      {
        slug: 'ejemplo1',
        url: 'https://www.google.com',
        totalClicks: 15,
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        enabled: true
      },
      {
        slug: 'ejemplo2',
        url: 'https://www.github.com',
        totalClicks: 8,
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        enabled: true
      }
    ];

    return res.status(200).json({
      links: links,
      total: links.length,
      cursor: '0',
      hasMore: false
    });

  } catch (error) {
    console.error('Error obteniendo enlaces:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
