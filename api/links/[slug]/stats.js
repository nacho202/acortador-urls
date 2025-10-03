/**
 * API de estadísticas de links
 */

const store = require('../../../src/lib/store');

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;
  const sid = req.cookies.sid;
  const isAdmin = req.cookies.admin === '1';

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!slug) {
    return res.status(400).json({ error: 'Slug requerido' });
  }

  try {
    // Verificar que el link existe
    if (!(await store.exists(`link:${slug}`))) {
      return res.status(404).json({ error: 'Link no encontrado' });
    }

    // Verificar permisos
    if (!isAdmin) {
      const meta = await store.hgetall(`meta:${slug}`);
      if (meta.ownerSid !== sid) {
        return res.status(403).json({ error: 'Sin permisos para ver estadísticas de este link' });
      }
    }

    // Obtener estadísticas básicas
    const totalClicks = await store.get(`clicks:${slug}:total`) || 0;
    
    // Obtener clicks por día (últimos 14 días)
    const now = new Date();
    const byDay = [];
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayClicks = await store.get(`clicks:${slug}:byday:${dateStr}`) || 0;
      byDay.push({
        date: dateStr,
        clicks: parseInt(dayClicks)
      });
    }

    // Obtener top países/regiones
    const topGeo = await store.zrange(`geo:${slug}`, 0, 9, true);
    const geoStats = [];
    for (let i = 0; i < topGeo.length; i += 2) {
      geoStats.push({
        location: topGeo[i],
        clicks: parseInt(topGeo[i + 1])
      });
    }

    // Obtener top referrers
    const topReferrers = await store.zrange(`ref:${slug}`, 0, 9, true);
    const refStats = [];
    for (let i = 0; i < topReferrers.length; i += 2) {
      refStats.push({
        referrer: topReferrers[i],
        clicks: parseInt(topReferrers[i + 1])
      });
    }

    // Obtener estadísticas de dispositivos
    const deviceStats = await store.zrange(`ua:${slug}:device`, 0, 9, true);
    const devices = [];
    for (let i = 0; i < deviceStats.length; i += 2) {
      devices.push({
        device: deviceStats[i],
        clicks: parseInt(deviceStats[i + 1])
      });
    }

    // Obtener estadísticas de OS
    const osStats = await store.zrange(`ua:${slug}:os`, 0, 9, true);
    const os = [];
    for (let i = 0; i < osStats.length; i += 2) {
      os.push({
        os: osStats[i],
        clicks: parseInt(osStats[i + 1])
      });
    }

    // Obtener estadísticas de navegadores
    const browserStats = await store.zrange(`ua:${slug}:browser`, 0, 9, true);
    const browsers = [];
    for (let i = 0; i < browserStats.length; i += 2) {
      browsers.push({
        browser: browserStats[i],
        clicks: parseInt(browserStats[i + 1])
      });
    }

    // Obtener metadata del link
    const meta = await store.hgetall(`meta:${slug}`);

    return res.status(200).json({
      slug,
      totalClicks: parseInt(totalClicks),
      byDay,
      topGeo: geoStats,
      topReferrers: refStats,
      devices,
      os,
      browsers,
      metadata: {
        createdAt: parseInt(meta.createdAt),
        enabled: meta.enabled === '1',
        ttl: meta.ttl ? parseInt(meta.ttl) : null,
        lastUpdateAt: parseInt(meta.lastUpdateAt)
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
