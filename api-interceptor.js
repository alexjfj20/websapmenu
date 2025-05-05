/**
 * Interceptor de API para modo mantenimiento
 * 
 * Este script se insertará en la página HTML servida durante mantenimiento para
 * interceptar llamadas a la API y redirigirlas a nuestros endpoints simulados.
 */
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