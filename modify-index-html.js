/**
 * Script para modificar index.html y agregar código de redirección
 */
const fs = require('fs');
const path = require('path');

console.log('Modificando index.html para agregar código de redirección...');

const indexHtmlPath = path.join(__dirname, 'dist', 'index.html');

try {
  // Leer el archivo index.html
  let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Buscar la posición para insertar el script
  const headEndPosition = htmlContent.indexOf('</head>');
  
  if (headEndPosition === -1) {
    throw new Error('No se encontró la etiqueta </head> en el HTML');
  }
  
  // Código de redirección para solicitudes de menú compartido
  const redirectCode = `
  <!-- Script de redirección para menú compartido -->
  <script>
    (function() {
      // Verificar si la URL corresponde a un menú compartido
      if (window.location.pathname.startsWith('/menu/')) {
        // Obtener el ID del menú de la URL
        const pathParts = window.location.pathname.split('/');
        const menuId = pathParts[pathParts.length - 1];
        
        // Verificar si es una solicitud desde un fetch o XHR
        const isAPIRequest = 
          window.fetch && 
          window.fetch.toString().includes('native code') && 
          !document.querySelector('body div');
        
        if (menuId && menuId.length > 5) {
          console.log('Menú compartido detectado: ' + menuId);
          
          // Aplicar parche para redirectionar solicitudes fetch a API para menús compartidos
          const originalFetch = window.fetch;
          window.fetch = function(resource, options) {
            const url = resource instanceof Request ? resource.url : resource;
            
            // Si es una solicitud para un menú compartido
            if (typeof url === 'string' && url.includes('/api/menu/')) {
              console.log('Interceptando fetch de menú: ' + url);
              
              // Convertir a URL
              const urlObj = new URL(url, window.location.origin);
              const pathParts = urlObj.pathname.split('/');
              const menuId = pathParts[pathParts.length - 1];
              
              // Modificar para usar la nueva API
              const newUrl = '/api/shared-menu/' + menuId;
              console.log('Redirigiendo a: ' + newUrl);
              return originalFetch(newUrl, options);
            }
            
            // De lo contrario, continuar normalmente
            return originalFetch.apply(this, arguments);
          };
        }
      }
    })();
  </script>
  `;
  
  // Insertar el código de redirección antes del cierre de la etiqueta head
  const modifiedHtml = 
    htmlContent.substring(0, headEndPosition) +
    redirectCode +
    htmlContent.substring(headEndPosition);
  
  // Guardar el archivo modificado
  fs.writeFileSync(indexHtmlPath, modifiedHtml);
  console.log('✅ index.html modificado exitosamente');
  
} catch (error) {
  console.error('❌ Error al modificar index.html:', error);
}