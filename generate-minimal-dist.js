/**
 * Script para generar una versión mínima de la distribución cuando fallan todos los métodos de construcción
 */
const fs = require('fs');
const path = require('path');

console.log('🛠️ Generando distribución mínima...');

// Crear directorio dist si no existe
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Crear directorio de assets
const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Crear HTML básico
const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebSAP - Mantenimiento</title>
  <!-- Todos los estilos están inline para evitar dependencias externas -->
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      text-align: center;
      padding: 50px 20px;
      background-color: #f8f9fa;
      color: #333;
      line-height: 1.6;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .status {
      display: inline-block;
      background-color: #f8d7da;
      color: #721c24;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      margin: 10px 0;
    }
    .info {
      font-size: 16px;
      margin: 20px 0;
      color: #495057;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #6c757d;
    }
    .spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #2c3e50;
      animation: spin 1s ease-in-out infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    #countdown {
      font-weight: bold;
    }
    .btn {
      display: inline-block;
      background-color: #2c3e50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
      text-decoration: none;
    }
    .btn:hover {
      background-color: #1a252f;
    }
    /* Favicon como data URI para evitar 404 */
    link[rel="icon"] {
      content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%232c3e50' rx='10'/%3E%3Cpath d='M30,30 L70,30 L70,70 L30,70 Z' fill='white'/%3E%3C/svg%3E");
    }
  </style>
  <!-- Favicon como data-URI para evitar error 404 -->
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%232c3e50' rx='10'/%3E%3Cpath d='M30,30 L70,30 L70,70 L30,70 Z' fill='white'/%3E%3C/svg%3E">
</head>
<body>
  <div class="container">
    <div class="logo">WebSAP</div>
    <div class="status">Sitio en mantenimiento</div>
    <div class="spinner"></div>
    <p class="info">
      Estamos realizando tareas de mantenimiento para mejorar su experiencia.<br>
      Por favor, intente nuevamente en unos minutos.
    </p>
    <p>La página se actualizará en <span id="countdown">30</span> segundos.</p>
    <button class="btn" onclick="window.location.reload()">Actualizar ahora</button>
    <div class="footer">
      WebSAP &copy; ${new Date().getFullYear()}
    </div>
  </div>
  <!-- Script inline para evitar dependencias externas -->
  <script>
    // Contador regresivo para actualización automática
    let seconds = 30;
    const countdownElement = document.getElementById('countdown');
    
    setInterval(function() {
      seconds--;
      countdownElement.textContent = seconds;
      
      if (seconds <= 0) {
        window.location.reload();
      }
    }, 1000);
    
    // Evitar mensajes de error por favicon y otros recursos
    window.addEventListener('error', function(e) {
      if (e.target.tagName === 'LINK' || e.target.tagName === 'IMG') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true);
    
    // Interceptor de API para modo mantenimiento
    (function() {
      console.log('🔧 Inicializando interceptor de API para modo mantenimiento...');
      
      // Guardar la implementación original de fetch
      const originalFetch = window.fetch;
      
      // Sobrescribir fetch para interceptar solicitudes
      window.fetch = async function(resource, options) {
        const url = resource instanceof Request ? resource.url : resource;
        
        try {
          // Interceptar solicitudes específicas
          if (url.includes('/api/menu/') || url.includes('/api/business/')) {
            console.log(`🔄 Interceptando solicitud a: ${url}`);
            
            // Extraer el ID del recurso
            const urlParts = url.split('/');
            const resourceId = urlParts[urlParts.length - 1];
            
            // Redirigir a nuestro endpoint simulado
            const redirectUrl = `/api/shared-menu/${resourceId}`;
            console.log(`🔀 Redirigiendo a: ${redirectUrl}`);
            
            // Realizar la solicitud al endpoint simulado
            return originalFetch(redirectUrl, options);
          }
          
          // Para solicitudes de sincronización, devolver respuesta simulada
          if (url.includes('/api/sync/') || url.includes('/api/test/')) {
            console.log(`🛑 Interceptando solicitud de sincronización: ${url}`);
            
            // Simular respuesta
            return new Response(JSON.stringify({
              status: 'maintenance',
              message: 'Servidor en mantenimiento. Sincronización no disponible.',
              timestamp: new Date().toISOString()
            }), {
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              }
            });
          }
          
          // Para solicitudes a localhost que fallarían, devolver respuesta simulada
          if (url.includes('localhost')) {
            console.log(`🛑 Bloqueando solicitud a localhost: ${url}`);
            
            // Simular respuesta fallida con código 503
            return new Response(JSON.stringify({
              error: 'maintenance',
              message: 'Servidor local no disponible durante mantenimiento',
              timestamp: new Date().toISOString()
            }), {
              status: 503,
              headers: {
                'Content-Type': 'application/json'
              }
            });
          }
        } catch (error) {
          console.error('Error en interceptor:', error);
        }
        
        // Si no se interceptó, realizar la solicitud original
        return originalFetch.apply(this, arguments);
      };
      
      // También sobrescribir XMLHttpRequest para manejar llamadas que no usan fetch
      const originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function() {
        const method = arguments[0];
        const url = arguments[1];
        
        // Reescribir URL para solicitudes específicas
        if (typeof url === 'string') {
          if (url.includes('/api/menu/') || url.includes('/api/business/')) {
            const urlParts = url.split('/');
            const resourceId = urlParts[urlParts.length - 1];
            arguments[1] = `/api/shared-menu/${resourceId}`;
            console.log(`🔀 Redirigiendo XHR a: ${arguments[1]}`);
          }
          
          // Bloquear solicitudes a localhost
          if (url.includes('localhost')) {
            console.log(`🛑 Bloqueando solicitud XHR a localhost: ${url}`);
            // Reescribir a una URL que siempre estará disponible en el servidor
            arguments[1] = '/api/status';
          }
        }
        
        return originalXHROpen.apply(this, arguments);
      };
      
      console.log('✅ Interceptor de API inicializado');
    })();
  </script>
</body>
</html>
`;

// Guardar archivo HTML principal
fs.writeFileSync(path.join(distDir, 'index.html'), html);

// Crear favicon.ico como página HTML que redirige al SVG en data URI
const faviconHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%232c3e50' rx='10'/%3E%3Cpath d='M30,30 L70,30 L70,70 L30,70 Z' fill='white'/%3E%3C/svg%3E">
</head>
<body></body>
</html>
`;
fs.writeFileSync(path.join(distDir, 'favicon.ico'), faviconHtml);

// Crear robots.txt
const robots = `
User-agent: *
Disallow: /
`;
fs.writeFileSync(path.join(distDir, 'robots.txt'), robots);

// Crear manifest.json para evitar errores en PWA
const manifest = {
  name: 'WebSAP',
  short_name: 'WebSAP',
  description: 'WebSAP - Sistema de Administración',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#2c3e50',
  icons: [
    {
      src: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%232c3e50\' rx=\'10\'/%3E%3Cpath d=\'M30,30 L70,30 L70,70 L30,70 Z\' fill=\'white\'/%3E%3C/svg%3E',
      sizes: '192x192',
      type: 'image/svg+xml'
    }
  ]
};

fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

// Crear un .htaccess para gestionar errores 404
const htaccess = `
ErrorDocument 404 /index.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
fs.writeFileSync(path.join(distDir, '.htaccess'), htaccess);

console.log('✅ Distribución mínima generada con éxito.');
console.log(`📂 Archivos generados en: ${distDir}`);
console.log('📄 - index.html');
console.log('📄 - style.css');
console.log('📄 - app.js');
console.log('📄 - manifest.json');