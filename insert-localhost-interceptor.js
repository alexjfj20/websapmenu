/**
 * Script para insertar un interceptor de solicitudes a localhost en index.html
 * Este script se ejecutará en el navegador y evitará errores de conexión rechazada
 */
const fs = require('fs');
const path = require('path');

console.log('🛠️ Insertando interceptor de localhost en index.html...');

// Ruta al archivo index.html en dist
const indexHtmlPath = path.join(__dirname, 'dist', 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.log('❌ No se encontró el archivo index.html');
  process.exit(1);
}

try {
  // Leer el contenido del archivo
  let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Verificar si el interceptor ya está insertado
  if (htmlContent.includes('localhost-interceptor')) {
    console.log('⚠️ El interceptor ya está insertado en index.html');
    process.exit(0);
  }
  
  // Código del interceptor
  const interceptorCode = `
  <!-- localhost-interceptor -->
  <script>
  (function() {
    // Detectar si estamos en producción
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
      console.log("🌐 Entorno de producción detectado, instalando interceptor de localhost");
      
      // Sobrescribir fetch para interceptar solicitudes a localhost
      const originalFetch = window.fetch;
      window.fetch = function(resource, options) {
        const url = resource instanceof Request ? resource.url : resource;
        
        // Si es una URL a localhost, modificarla para usar la URL actual
        if (typeof url === 'string' && url.includes('localhost')) {
          console.log("🔄 Interceptando solicitud a localhost:", url);
          
          // Determinar tipo de solicitud (API o raw)
          const isApiRequest = url.includes('/api/');
          const isRawRequest = url.includes('/raw/');
          
          let newUrl;
          if (isApiRequest) {
            // Extraer la ruta de la API
            const apiPath = url.split('/api/')[1] || '';
            newUrl = window.location.origin + '/api/' + apiPath;
          } else if (isRawRequest) {
            // Extraer la ruta raw
            const rawPath = url.split('/raw/')[1] || '';
            newUrl = window.location.origin + '/raw/' + rawPath;
          } else {
            // Usar la URL actual para cualquier otra solicitud
            newUrl = window.location.origin + '/api/status';
          }
          
          console.log("✅ Redirigiendo a:", newUrl);
          return originalFetch(newUrl, options);
        }
        
        // Continuar normalmente para otras URLs
        return originalFetch.apply(this, arguments);
      };
      
      // Sobrescribir XMLHttpRequest para interceptar solicitudes a localhost
      const originalXhrOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function() {
        if (arguments.length > 1 && typeof arguments[1] === 'string' && arguments[1].includes('localhost')) {
          console.log("🔄 Interceptando XHR a localhost:", arguments[1]);
          
          // Determinar tipo de solicitud (API o raw)
          const url = arguments[1];
          const isApiRequest = url.includes('/api/');
          const isRawRequest = url.includes('/raw/');
          
          if (isApiRequest) {
            // Extraer la ruta de la API
            const apiPath = url.split('/api/')[1] || '';
            arguments[1] = window.location.origin + '/api/' + apiPath;
          } else if (isRawRequest) {
            // Extraer la ruta raw
            const rawPath = url.split('/raw/')[1] || '';
            arguments[1] = window.location.origin + '/raw/' + rawPath;
          } else {
            // Usar la URL actual para cualquier otra solicitud
            arguments[1] = window.location.origin + '/api/status';
          }
          
          console.log("✅ Redirigiendo XHR a:", arguments[1]);
        }
        
        return originalXhrOpen.apply(this, arguments);
      };
      
      console.log("✅ Interceptor de localhost instalado");
    }
  })();
  </script>
  `;
  
  // Insertar el código antes de cerrar el </head>
  const headCloseIndex = htmlContent.indexOf('</head>');
  if (headCloseIndex === -1) {
    throw new Error('No se encontró la etiqueta </head> en index.html');
  }
  
  htmlContent = htmlContent.slice(0, headCloseIndex) + interceptorCode + htmlContent.slice(headCloseIndex);
  
  // Guardar el archivo modificado
  fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
  console.log('✅ Interceptor de localhost insertado correctamente en index.html');
  
} catch (error) {
  console.error('❌ Error al insertar interceptor de localhost:', error);
  process.exit(1);
}