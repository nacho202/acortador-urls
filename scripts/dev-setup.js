/**
 * Script de configuración para desarrollo local
 * Ejecutar con: node scripts/dev-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando entorno de desarrollo...\n');

// Verificar si existe .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creando archivo .env.local...');
  
  const envContent = `# Variables de entorno para desarrollo local
# Copia los valores de env.example y configura tus claves

# Token de administrador (cambia por uno seguro)
ADMIN_TOKEN=dev_admin_token_123456789

# Cloudflare Turnstile (usa las claves de prueba)
TURNSTILE_SITE_KEY=0x4AAAAAAABkMYinukE8nz0
TURNSTILE_SECRET_KEY=0x4AAAAAAABkMYinukE8nz0_secret_key_aqui

# Para desarrollo local
NODE_ENV=development
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env.local creado');
} else {
  console.log('✅ Archivo .env.local ya existe');
}

// Verificar dependencias
console.log('\n📦 Verificando dependencias...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  '@vercel/kv',
  '@upstash/redis',
  'nanoid',
  'ua-parser-js',
  'qrcode',
  'zod'
];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
if (missingDeps.length > 0) {
  console.log('❌ Dependencias faltantes:', missingDeps.join(', '));
  console.log('💡 Ejecuta: npm install');
} else {
  console.log('✅ Todas las dependencias están instaladas');
}

// Verificar estructura de archivos
console.log('\n📁 Verificando estructura de archivos...');
const requiredFiles = [
  'package.json',
  'vercel.json',
  'src/lib/store.js',
  'src/lib/ua.js',
  'api/session.js',
  'api/links/index.js',
  'api/links/[slug].js',
  'api/links/[slug]/stats.js',
  'api/track.js',
  'api/redirect.js',
  'api/admin/login.js',
  'api/admin/links.js',
  'api/q/[slug].svg.js',
  'public/index.html',
  'public/admin/index.html',
  'public/styles.css'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
if (missingFiles.length > 0) {
  console.log('❌ Archivos faltantes:', missingFiles.join(', '));
} else {
  console.log('✅ Todos los archivos están presentes');
}

// Mostrar instrucciones
console.log('\n🎯 Próximos pasos:');
console.log('1. Configura las variables de entorno en .env.local');
console.log('2. Ejecuta: npm run dev');
console.log('3. Abre http://localhost:3000 en tu navegador');
console.log('4. Para el panel admin, ve a http://localhost:3000/admin');

console.log('\n🔧 Comandos útiles:');
console.log('- npm run dev          # Ejecutar en modo desarrollo');
console.log('- vercel dev           # Ejecutar con Vercel CLI');
console.log('- vercel --prod        # Deploy a producción');

console.log('\n📚 Documentación:');
console.log('- README.md            # Documentación completa');
console.log('- env.example          # Ejemplo de variables de entorno');

console.log('\n✨ ¡Configuración completada!');
