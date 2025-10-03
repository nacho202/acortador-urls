# 🔗 Acortador de URLs - Vercel + Redis

Un acortador de URLs completo y funcional construido para Vercel con soporte para Vercel KV y Upstash Redis, incluyendo panel de administración, tracking detallado y características profesionales.

## ✨ Características

### 🎯 Funcionalidades Principales
- **Sin login para usuarios**: Cada persona ve su propio historial (localStorage)
- **Panel Admin protegido**: Con ADMIN_TOKEN + captcha Turnstile
- **Slug personalizado o aleatorio**: Control total sobre los enlaces
- **Tracking completo**: Contador de clicks, geolocalización, dispositivo/OS/navegador
- **Estadísticas detalladas**: Gráficos y métricas en tiempo real
- **QR codes**: Generación automática de códigos QR
- **TTL opcional**: Enlaces con tiempo de vida configurable
- **Rate limiting**: Protección contra abuso
- **Renombrar slugs**: Cambio de slugs preservando estadísticas

### 🏗️ Arquitectura
- **Deploy**: Vercel
- **Base de datos**: Vercel KV (por defecto) + Upstash Redis (fallback)
- **Runtimes**: Edge para redirecciones, Node.js para APIs
- **UI**: HTML/CSS/JS vanilla (sin frameworks pesados)
- **Seguridad**: Cookies HttpOnly, rate limiting, validaciones

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <tu-repo>
cd acortador-personal
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno en Vercel

Ve a **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables** y agrega:

#### Variables Obligatorias
```env
ADMIN_TOKEN=tu_token_admin_super_seguro_aqui
TURNSTILE_SITE_KEY=tu_site_key_de_cloudflare
TURNSTILE_SECRET_KEY=tu_secret_key_de_cloudflare
```

#### Variables de Base de Datos (Vercel KV - Automáticas)
```env
KV_REST_API_URL=vercel_lo_agrega_automaticamente
KV_REST_API_TOKEN=vercel_lo_agrega_automaticamente
```

#### Variables Opcionales (Upstash Redis)
```env
USE_UPSTASH=1
UPSTASH_REDIS_REST_URL=tu_url_de_upstash
UPSTASH_REDIS_REST_TOKEN=tu_token_de_upstash
```

### 4. Configurar Cloudflare Turnstile

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navega a **Turnstile**
3. Crea un nuevo sitio
4. Copia las claves Site Key y Secret Key
5. Agrégalas a las variables de entorno

### 5. Deploy a Vercel

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login en Vercel
vercel login

# Deploy
vercel --prod
```

## 📁 Estructura del Proyecto

```
/
├── public/
│   ├── index.html          # UI pública
│   ├── admin/index.html    # Panel de administración
│   └── styles.css          # Estilos globales
├── src/lib/
│   ├── store.js            # Wrapper Redis/KV
│   └── ua.js               # Parser User Agent
├── api/
│   ├── session.js          # API de sesión
│   ├── track.js            # API de tracking
│   ├── redirect.js         # Redirección (Edge)
│   ├── links/
│   │   ├── index.js        # Crear/listar links
│   │   ├── [slug].js       # Editar/eliminar links
│   │   └── [slug]/stats.js # Estadísticas
│   ├── admin/
│   │   ├── login.js        # Login admin
│   │   └── links.js        # Listar todos los links
│   └── q/
│       └── [slug].svg.js   # Generar QR codes
├── package.json
├── vercel.json
└── README.md
```

## 🔧 API Endpoints

### Públicos
- `GET /` - Interfaz principal
- `GET /admin` - Panel de administración
- `GET /{slug}` - Redirección a URL original

### APIs
- `GET /api/session` - Inicializar sesión de usuario
- `POST /api/links` - Crear nuevo enlace
- `GET /api/links?mine=1` - Listar enlaces del usuario
- `PATCH /api/links/{slug}` - Editar enlace
- `DELETE /api/links/{slug}` - Eliminar enlace (solo admin)
- `GET /api/links/{slug}/stats` - Estadísticas del enlace
- `POST /api/track` - Tracking de clicks
- `GET /api/q/{slug}.svg` - Código QR del enlace

### Admin
- `POST /api/admin/login` - Login de administrador
- `GET /api/admin/links` - Listar todos los enlaces

## 🗃️ Esquema de Base de Datos

### Claves Redis
```
link:{slug}                    → URL destino
meta:{slug}                    → Hash con metadata
clicks:{slug}:total           → Contador total
clicks:{slug}:byday           → ZSET con clicks por día
geo:{slug}                    → ZSET con países/regiones
ua:{slug}:device|os|browser   → ZSET con estadísticas de UA
ref:{slug}                    → ZSET con referrers
links:index                   → ZSET con índice global
history:{sid}                 → ZSET con historial del usuario
rate:ip:{ip}                  → Rate limiting por IP
rate:sid:{sid}                → Rate limiting por sesión
```

## 🎨 Características de la UI

### Interfaz Pública
- **Formulario intuitivo**: URL, slug personalizado, TTL
- **Historial local**: Almacenado en localStorage
- **Estadísticas visuales**: Gráficos y métricas
- **QR codes**: Generación automática
- **Responsive**: Optimizado para móviles

### Panel de Administración
- **Login seguro**: Token + captcha Turnstile
- **Gestión completa**: Ver, editar, eliminar todos los enlaces
- **Filtros y búsqueda**: Encontrar enlaces rápidamente
- **Estadísticas globales**: Métricas de todos los enlaces
- **Paginación**: Manejo eficiente de grandes volúmenes

## 🔒 Seguridad

- **Cookies HttpOnly**: Protección contra XSS
- **Rate limiting**: 10 requests/minuto para creación, 100 para tracking
- **Validación de URLs**: Solo HTTP/HTTPS permitidos
- **Captcha Turnstile**: Protección contra bots
- **Sanitización**: Limpieza de datos de entrada

## 📊 Tracking y Analytics

### Información Recopilada
- **Clicks totales**: Contador global
- **Clicks por día**: Serie temporal
- **Geolocalización**: País y región
- **Dispositivos**: Mobile, tablet, desktop
- **Sistemas operativos**: Windows, macOS, Linux, iOS, Android
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Referrers**: Sitios de origen

### Privacidad
- **Sin IPs almacenadas**: Solo categorías geográficas
- **User Agent parseado**: Solo categorías, no strings completos
- **Datos agregados**: Estadísticas anónimas

## 🚀 Uso

### Para Usuarios
1. Visita la página principal
2. Ingresa tu URL
3. Opcionalmente personaliza el slug
4. Configura TTL si deseas
5. Haz clic en "Acortar URL"
6. Copia el enlace acortado
7. Ve el historial en la misma página

### Para Administradores
1. Ve a `/admin`
2. Ingresa el token de administrador
3. Completa el captcha
4. Gestiona todos los enlaces
5. Ve estadísticas detalladas
6. Edita o elimina enlaces

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# O con Vercel CLI
vercel dev
```

## 📈 Monitoreo y Métricas

### Métricas Disponibles
- **Clicks totales**: Por enlace
- **Clicks por día**: Últimos 14 días
- **Top países**: Distribución geográfica
- **Top referrers**: Sitios de origen
- **Dispositivos**: Mobile vs desktop
- **Navegadores**: Distribución de browsers

### Dashboard de Admin
- **Vista global**: Todos los enlaces
- **Filtros**: Por estado, fecha, propietario
- **Búsqueda**: Por slug o URL
- **Acciones masivas**: Editar múltiples enlaces

## 🔧 Configuración Avanzada

### Rate Limiting
```javascript
// Configuración en el código
const maxRequests = 10; // requests por minuto
const windowMs = 60 * 1000; // ventana de tiempo
```

### TTL de Enlaces
```javascript
// TTL en segundos
const ttl = 3600; // 1 hora
const ttl = 86400; // 1 día
const ttl = 604800; // 1 semana
```

### Personalización de QR
```javascript
// Configuración en api/q/[slug].svg.js
const qrOptions = {
  width: 200,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
};
```

## 🐛 Solución de Problemas

### Error: "KV_REST_API_URL not found"
- Verifica que Vercel KV esté conectado al proyecto
- Ve a Vercel Dashboard → Storage → KV

### Error: "Turnstile verification failed"
- Verifica las claves de Turnstile
- Asegúrate de que el dominio esté configurado correctamente

### Error: "Rate limit exceeded"
- Espera 1 minuto antes de hacer más requests
- Verifica la configuración de rate limiting

### Error: "Link not found"
- El enlace puede haber expirado
- Verifica que el slug sea correcto

## 📝 Changelog

### v1.0.0
- ✅ Acortador de URLs básico
- ✅ Panel de administración
- ✅ Tracking completo
- ✅ QR codes
- ✅ Rate limiting
- ✅ TTL de enlaces
- ✅ Renombrar slugs
- ✅ Estadísticas detalladas

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Verifica las variables de entorno
3. Revisa los logs de Vercel
4. Abre un issue en GitHub

---

**¡Disfruta acortando URLs! 🚀**
