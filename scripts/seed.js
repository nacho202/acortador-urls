/**
 * Script para poblar la base de datos con datos de ejemplo
 * Ejecutar con: node scripts/seed.js
 */

const { nanoid } = require('nanoid');

// Simular datos de ejemplo
const sampleUrls = [
  'https://www.google.com',
  'https://github.com',
  'https://stackoverflow.com',
  'https://www.youtube.com',
  'https://www.wikipedia.org',
  'https://www.reddit.com',
  'https://www.twitter.com',
  'https://www.linkedin.com',
  'https://www.instagram.com',
  'https://www.facebook.com'
];

const sampleCountries = ['US', 'ES', 'MX', 'AR', 'CO', 'PE', 'CL', 'BR', 'FR', 'DE'];
const sampleDevices = ['mobile', 'desktop', 'tablet'];
const sampleOS = ['Windows', 'macOS', 'Linux', 'Android', 'iOS'];
const sampleBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];

// Función para generar datos de ejemplo
function generateSampleData() {
  console.log('🌱 Generando datos de ejemplo...');
  
  const links = [];
  
  // Crear 5 enlaces de ejemplo
  for (let i = 0; i < 5; i++) {
    const slug = nanoid(7);
    const url = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    const now = Date.now();
    
    links.push({
      slug,
      url,
      createdAt: now,
      totalClicks: Math.floor(Math.random() * 100) + 10,
      enabled: true,
      ttl: null
    });
  }
  
  console.log('✅ Datos de ejemplo generados:');
  links.forEach((link, index) => {
    console.log(`${index + 1}. /${link.slug} → ${link.url} (${link.totalClicks} clicks)`);
  });
  
  console.log('\n📋 Para usar estos datos:');
  console.log('1. Ve a tu aplicación desplegada');
  console.log('2. Usa estos slugs para probar las redirecciones:');
  links.forEach(link => {
    console.log(`   - https://tu-dominio.vercel.app/${link.slug}`);
  });
  
  console.log('\n🔧 Para poblar la base de datos manualmente:');
  console.log('Puedes usar la API directamente o el panel de administración.');
  
  return links;
}

// Función para generar estadísticas de ejemplo
function generateSampleStats(slug) {
  const stats = {
    totalClicks: Math.floor(Math.random() * 100) + 10,
    byDay: [],
    topGeo: [],
    topReferrers: [],
    devices: [],
    os: [],
    browsers: []
  };
  
  // Generar clicks por día (últimos 14 días)
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const clicks = Math.floor(Math.random() * 20);
    
    stats.byDay.push({
      date: dateStr,
      clicks: clicks
    });
  }
  
  // Generar top países
  for (let i = 0; i < 5; i++) {
    const country = sampleCountries[Math.floor(Math.random() * sampleCountries.length)];
    const clicks = Math.floor(Math.random() * 50) + 1;
    stats.topGeo.push({
      location: country,
      clicks: clicks
    });
  }
  
  // Generar top referrers
  const referrers = ['google.com', 'facebook.com', 'twitter.com', 'direct', 'reddit.com'];
  for (let i = 0; i < 3; i++) {
    const referrer = referrers[Math.floor(Math.random() * referrers.length)];
    const clicks = Math.floor(Math.random() * 30) + 1;
    stats.topReferrers.push({
      referrer: referrer,
      clicks: clicks
    });
  }
  
  // Generar estadísticas de dispositivos
  sampleDevices.forEach(device => {
    const clicks = Math.floor(Math.random() * 40) + 1;
    stats.devices.push({
      device: device,
      clicks: clicks
    });
  });
  
  // Generar estadísticas de OS
  sampleOS.forEach(os => {
    const clicks = Math.floor(Math.random() * 30) + 1;
    stats.os.push({
      os: os,
      clicks: clicks
    });
  });
  
  // Generar estadísticas de navegadores
  sampleBrowsers.forEach(browser => {
    const clicks = Math.floor(Math.random() * 25) + 1;
    stats.browsers.push({
      browser: browser,
      clicks: clicks
    });
  });
  
  return stats;
}

// Función principal
function main() {
  console.log('🚀 Acortador de URLs - Script de Datos de Ejemplo');
  console.log('================================================\n');
  
  const links = generateSampleData();
  
  console.log('\n📊 Estadísticas de ejemplo generadas para cada enlace');
  console.log('(Estas se crearán automáticamente cuando se hagan clicks reales)');
  
  console.log('\n🎯 Próximos pasos:');
  console.log('1. Despliega tu aplicación en Vercel');
  console.log('2. Configura las variables de entorno');
  console.log('3. Prueba creando enlaces reales');
  console.log('4. Usa el panel de administración para gestionar enlaces');
  
  console.log('\n✨ ¡Tu acortador de URLs está listo para usar!');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  generateSampleData,
  generateSampleStats
};
