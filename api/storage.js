/**
 * Sistema de almacenamiento simple en memoria para estadísticas
 * En una versión completa, esto sería Redis
 */

// Almacenamiento en memoria (se resetea en cada deploy)
const storage = {
  clicks: new Map(), // slug -> array de clicks
  links: new Map()   // slug -> datos del link
};

// Función para generar un hash simple del slug para consistencia
function generateConsistentHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32bit integer
  }
  return Math.abs(hash);
}

// Función para obtener datos consistentes basados en el slug
function getConsistentData(slug) {
  const hash = generateConsistentHash(slug);
  const seed = hash % 1000; // Usar como semilla
  
  // Empezar con 0 clicks para enlaces nuevos
  const totalClicks = 0;
  
  return {
    totalClicks,
    seed,
    byDay: Array.from({ length: 14 }, (_, i) => {
      return {
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clicks: 0
      };
    }).reverse(),
    topGeo: [],
    topReferrers: [],
    devices: [],
    os: [],
    browsers: []
  };
}

// Función para registrar un click
function recordClick(slug, trackingData) {
  if (!storage.clicks.has(slug)) {
    storage.clicks.set(slug, []);
  }
  
  const clicks = storage.clicks.get(slug);
  clicks.push({
    ...trackingData,
    timestamp: Date.now()
  });
  
  // Mantener solo los últimos 100 clicks para no sobrecargar memoria
  if (clicks.length > 100) {
    clicks.splice(0, clicks.length - 100);
  }
}

// Función para obtener estadísticas reales
function getRealStats(slug) {
  const clicks = storage.clicks.get(slug) || [];
  const now = Date.now();
  
  if (clicks.length === 0) {
    // Si no hay clicks reales, devolver datos vacíos
    return {
      totalClicks: 0,
      byDay: Array.from({ length: 14 }, (_, i) => {
        return {
          date: new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          clicks: 0
        };
      }).reverse(),
      topGeo: [],
      topReferrers: [],
      devices: [],
      os: [],
      browsers: []
    };
  }
  
  // Procesar clicks reales
  const totalClicks = clicks.length;
  const byDay = {};
  const geo = {};
  const referrers = {};
  const devices = {};
  const os = {};
  const browsers = {};
  
  clicks.forEach(click => {
    const date = new Date(click.timestamp).toISOString().split('T')[0];
    byDay[date] = (byDay[date] || 0) + 1;
    
    geo[click.country] = (geo[click.country] || 0) + 1;
    referrers[click.referer] = (referrers[click.referer] || 0) + 1;
    devices[click.device] = (devices[click.device] || 0) + 1;
    os[click.os] = (os[click.os] || 0) + 1;
    browsers[click.browser] = (browsers[click.browser] || 0) + 1;
  });
  
  // Convertir a arrays ordenados
  const topGeo = Object.entries(geo)
    .map(([location, clicks]) => ({ location, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);
    
  const topReferrers = Object.entries(referrers)
    .map(([referrer, clicks]) => ({ referrer, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);
    
  const deviceStats = Object.entries(devices)
    .map(([device, clicks]) => ({ device, clicks }))
    .sort((a, b) => b.clicks - a.clicks);
    
  const osStats = Object.entries(os)
    .map(([os, clicks]) => ({ os, clicks }))
    .sort((a, b) => b.clicks - a.clicks);
    
  const browserStats = Object.entries(browsers)
    .map(([browser, clicks]) => ({ browser, clicks }))
    .sort((a, b) => b.clicks - a.clicks);
  
  // Generar datos por día de los últimos 14 días
  const byDayArray = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      date,
      clicks: byDay[date] || 0
    };
  }).reverse();
  
  return {
    totalClicks,
    byDay: byDayArray,
    topGeo,
    topReferrers,
    devices: deviceStats,
    os: osStats,
    browsers: browserStats
  };
}

module.exports = {
  recordClick,
  getRealStats,
  getConsistentData,
  storage
};
