/**
 * Extensión para el servidor que permite servir menús directamente desde archivos de caché
 * Este archivo complementa server.js con funcionalidades específicas para caché
 */
const fs = require('fs');
const path = require('path');

// Función que extiende un servidor Express existente
function extendServerWithCache(app) {
  console.log('🔄 Extendiendo servidor con funcionalidades de caché...');
  
  // Directorio para archivos de caché
  const cacheDir = path.join(__dirname, 'dist', 'cache');
  
  // Asegurar que existe el directorio de caché
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log('✅ Directorio de caché creado');
  }

  // Endpoint para servir un menú desde caché
  app.get('/api/cache/menu/:id', (req, res) => {
    const menuId = req.params.id;
    console.log(`📋 Solicitud de menú desde caché: ${menuId}`);
    
    // Ruta al archivo de caché
    const cacheFile = path.join(cacheDir, `menu-${menuId}.json`);
    
    // Verificar si existe el archivo
    if (fs.existsSync(cacheFile)) {
      try {
        // Leer archivo de caché
        const menuData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        
        // Establecer encabezados
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Caché por 1 hora
        res.setHeader('X-Source', 'cache-server');
        
        console.log('✅ Menú servido desde caché');
        return res.json(menuData);
      } catch (error) {
        console.error('❌ Error al leer archivo de caché:', error);
      }
    }
    
    // Si no se encontró en caché o hubo un error, usar el enfoque normal
    console.log('⚠️ Menú no encontrado en caché, redirigiendo a API normal');
    res.redirect(`/api/shared-menu/${menuId}`);
  });

  // Endpoint para guardar un menú en caché
  app.post('/api/cache/menu/:id', (req, res) => {
    const menuId = req.params.id;
    console.log(`💾 Guardando menú en caché: ${menuId}`);
    
    try {
      // Datos del menú desde el cuerpo de la solicitud
      const menuData = req.body;
      
      if (!menuData || typeof menuData !== 'object') {
        return res.status(400).json({ error: 'Datos de menú inválidos' });
      }
      
      // Guardar en archivo
      const cacheFile = path.join(cacheDir, `menu-${menuId}.json`);
      fs.writeFileSync(cacheFile, JSON.stringify(menuData));
      
      console.log('✅ Menú guardado en caché');
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Error al guardar menú en caché:', error);
      res.status(500).json({ error: 'Error al guardar en caché', message: error.message });
    }
  });
  
  // Middleware para intentar servir desde caché antes de continuar
  app.use((req, res, next) => {
    // Solo interceptar solicitudes GET a la API de menú
    if (req.method === 'GET' && 
        (req.path.startsWith('/api/menu/') || req.path.startsWith('/api/shared-menu/'))) {
      
      // Extraer ID del menú
      const parts = req.path.split('/');
      const menuId = parts[parts.length - 1];
      
      if (menuId && menuId.length > 5) {
        // Verificar si existe en caché
        const cacheFile = path.join(cacheDir, `menu-${menuId}.json`);
        
        if (fs.existsSync(cacheFile)) {
          try {
            // Leer desde caché
            const menuData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
            
            // Establecer encabezados
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('X-Source', 'cache-middleware');
            
            console.log(`✅ Menú ${menuId} servido desde middleware de caché`);
            return res.json(menuData);
          } catch (error) {
            console.error('❌ Error en middleware de caché:', error);
          }
        }
      }
    }
    
    // Si no se pudo servir desde caché, continuar con el siguiente middleware
    next();
  });
  
  console.log('✅ Servidor extendido con funcionalidades de caché');
  return app;
}

// Exportar la función para usar en server.js
module.exports = { extendServerWithCache };

// Si este archivo es ejecutado directamente, mostrar mensaje informativo
if (require.main === module) {
  console.log('Este archivo está diseñado para extender server.js con funcionalidades de caché.');
  console.log('Por favor, importa este módulo en server.js para usarlo.');
}