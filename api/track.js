/**
 * API de tracking real para estadísticas
 */

const { recordClick } = require('./storage');

export const config = {
  runtime: 'nodejs',
};

// Función para parsear User-Agent
function parseUserAgent(userAgent) {
  const ua = userAgent || '';
  
  // Detectar dispositivo
  let device = 'desktop';
  if (/mobile/i.test(ua)) device = 'mobile';
  else if (/tablet/i.test(ua)) device = 'tablet';
  
  // Detectar OS
  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
  
  // Detectar navegador
  let browser = 'Unknown';
  if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Edge/i.test(ua)) browser = 'Edge';
  else if (/Opera/i.test(ua)) browser = 'Opera';
  
  return { device, os, browser };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { slug } = req.body;
    
    if (!slug) {
      return res.status(400).json({ error: 'Slug requerido' });
    }

    // Obtener información del request
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers.referer || req.headers.referrer || 'direct';
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const country = req.headers['x-vercel-ip-country'] || 'unknown';
    const region = req.headers['x-vercel-ip-country-region'] || 'unknown';
    
    // Parsear User-Agent
    const { device, os, browser } = parseUserAgent(userAgent);
    
    // Timestamp
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timestamp = now.getTime();
    
    // Crear objeto de tracking
    const trackingData = {
      slug,
      timestamp,
      date: today,
      ip,
      country,
      region,
      device,
      os,
      browser,
      referer: referer === 'direct' ? 'direct' : new URL(referer).hostname,
      userAgent
    };
    
    // Guardar en el almacenamiento en memoria
    recordClick(slug, trackingData);
    
    // Log para debugging
    console.log('Tracking data:', JSON.stringify(trackingData, null, 2));
    
    return res.status(200).json({ 
      success: true, 
      message: 'Tracking registrado',
      data: trackingData
    });

  } catch (error) {
    console.error('Error en tracking:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
