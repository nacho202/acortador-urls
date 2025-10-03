/**
 * API de redirección - Edge runtime para redirecciones ultrarrápidas
 */

const store = require('../src/lib/store');

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return new Response('Slug requerido', { status: 400 });
  }

  try {
    // Obtener URL destino
    const url = await store.get(`link:${slug}`);
    
    if (!url) {
      return new Response('Link no encontrado', { status: 404 });
    }

    // Verificar si está habilitado
    const meta = await store.hgetall(`meta:${slug}`);
    if (meta.enabled === '0') {
      return new Response('Link deshabilitado', { status: 410 });
    }

    // Incrementar contadores rápidamente
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Incrementar contadores (fire-and-forget)
    store.incr(`clicks:${slug}:total`).catch(console.error);
    store.zincrby(`clicks:${slug}:byday`, 1, today).catch(console.error);

    // Fire-and-forget tracking detallado
    fetch(`${req.headers.get('origin') || 'https://' + req.headers.get('host')}/api/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || '',
        'User-Agent': req.headers.get('user-agent') || '',
        'Referer': req.headers.get('referer') || '',
        'X-Forwarded-For': req.headers.get('x-forwarded-for') || '',
        'X-Vercel-IP-Country': req.headers.get('x-vercel-ip-country') || '',
        'X-Vercel-IP-Country-Region': req.headers.get('x-vercel-ip-country-region') || ''
      },
      body: JSON.stringify({ slug }),
      keepalive: true
    }).catch(console.error);

    // Redirección 308 (Permanent Redirect)
    return Response.redirect(url, 308);

  } catch (error) {
    console.error('Error en redirección:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
}
