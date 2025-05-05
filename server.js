require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());
console.log('✅ CORS habilitado');

// Aplicar correcciones específicas como middleware
app.use(fixShareMenuRequest);
console.log('✅ Correcciones específicas aplicadas');

// Middleware para interceptar solicitudes a la API
app.use((req, res, next) => {
  // Detectar si la URL contiene ciertos patrones de API
  if (req.path.includes('/api/menu/') || 
      req.path.includes('/menu/') && req.get('Accept')?.includes('application/json')) {
    
    // Extraer ID del recurso
    const pathParts = req.path.split('/');
    const resourceId = pathParts[pathParts.length - 1];
    
    if (resourceId && resourceId !== 'menu') {
      console.log(`🔄 Middleware interceptando solicitud API: ${req.path}`);
      
      // Servir datos simulados
      const menuData = menuMock.generateMenu(resourceId);
      return res.json(menuData);
    }
  }
  
  // Interceptar solicitudes de sincronización
  if (req.path.includes('/api/sync/') || req.path.includes('/api/test/')) {
    console.log(`🔄 Middleware interceptando solicitud de sincronización: ${req.path}`);
    return res.json({
      status: 'maintenance',
      message: 'Servidor en mantenimiento. Sincronización no disponible.',
      timestamp: new Date().toISOString()
    });
  }
  
  // Si no se interceptó, continuar con el siguiente middleware
  next();
});

// Middleware para servir archivos estáticos desde 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

// Middleware para procesar JSON
app.use(express.json());

// API endpoints básicos para desarrollo/mantenimiento
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor en mantenimiento', 
    time: new Date().toISOString() 
  });
});

// Endpoint para pruebas de conectividad
app.get('/api/test/ping', (req, res) => {
  res.json({ status: 'OK', message: 'pong' });
});

// API endpoint para información del menú - responde a múltiples patrones de URL
app.get(['/api/menu/:id', '/menu/api/:id', '/api/shared-menu/:id'], (req, res) => {
  // Usar datos simulados del menú
  const menuData = menuMock.generateMenu(req.params.id);
  console.log(`Sirviendo menú simulado para ID: ${req.params.id}`);
  
  // Asegurar que la respuesta sea JSON
  res.setHeader('Content-Type', 'application/json');
  
  // Devolver los datos inmediatamente
  res.json(menuData);
});

// API endpoint para información del negocio
app.get('/api/business/:id', (req, res) => {
  // Usar datos simulados del negocio
  const businessData = businessInfoMock.generateBusinessInfo(req.params.id);
  console.log(`Sirviendo información de negocio simulada para ID: ${req.params.id}`);
  
  res.json(businessData);
});

// API endpoint para datos del menú compartido (para solicitudes directas de datos)
app.get('/api/shared-menu/:shareId', (req, res) => {
  console.log(`Solicitud API de menú compartido con ID: ${req.params.shareId}`);
  // Usar datos simulados del menú
  const menuData = menuMock.generateMenu(req.params.shareId);
  res.json(menuData);
});

// API endpoint para menú compartido (URL común en la aplicación)
app.get('/menu/:shareId', (req, res) => {
  const shareId = req.params.shareId;
  
  // Detectar si es una solicitud de API (Accept: application/json) o de página
  const acceptHeader = req.get('Accept') || '';
  const userAgent = req.get('User-Agent') || '';
  const isApiRequest = acceptHeader.includes('application/json') || 
                      req.xhr || 
                      req.query.format === 'json' ||
                      req.path.includes('/api/');
  
  if (isApiRequest) {
    // Si es una solicitud de API, devolver datos JSON
    console.log(`Solicitud de API para menú compartido con ID: ${shareId}`);
    const menuData = menuMock.generateMenu(shareId);
    res.json(menuData);
  } else {
    // Si es una solicitud de página, intentar servir la página específica del menú
    console.log(`Solicitud de página de menú compartido con ID: ${shareId}`);
    
    // Comprobar si existe una página específica para este menú
    const specificMenuPath = path.join(__dirname, 'dist', 'menu', shareId, 'index.html');
    
    if (fs.existsSync(specificMenuPath)) {
      console.log('✅ Sirviendo página específica del menú');
      res.sendFile(specificMenuPath);
    } else {
      // Si no existe, enviar datos JSON precargados en una página genérica
      console.log('⚠️ No se encontró página específica, usando fallback');
      const menuData = menuMock.generateMenu(shareId);
      
      res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Menú - ${menuData.businessInfo.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; }
          .category { margin-bottom: 20px; border-bottom: 1px solid #eee; }
          .item { margin-bottom: 10px; }
          .maintenance { background: #f8d7da; color: #721c24; padding: 10px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${menuData.businessInfo.name || 'Menú'}</h1>
          <p>${menuData.businessInfo.description || ''}</p>
        </div>
        <div class="maintenance">
          <p>Esta página está en modo de mantenimiento</p>
        </div>
        <div id="menu-content">
          ${menuData.categories.map(cat => `
            <div class="category">
              <h2>${cat.name}</h2>
              ${cat.platos.map(item => `
                <div class="item">
                  <strong>${item.name}</strong> - $${item.price}
                  <p>${item.description || ''}</p>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
        <script>
          window.menuData = ${JSON.stringify(menuData)};
        </script>
      </body>
      </html>
      `);
    }
  }
});

// API endpoint para sincronización
app.get('/api/sync/status', (req, res) => {
  res.json({ 
    status: 'maintenance',
    message: 'Servidor en mantenimiento. Sincronización no disponible.',
    timestamp: new Date().toISOString()
  });
});

// Para rutas de API no manejadas explícitamente
app.use('/api', (req, res) => {
  res.status(503).json({ 
    error: 'API en mantenimiento',
    message: 'Esta funcionalidad estará disponible pronto'
  });
});

// Ruta raw para pruebas de conectividad
app.get('/raw/ping', (req, res) => {
  res.send('pong');
});

// Para cualquier otra ruta, enviar el archivo index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  
  // Mostrar información del sistema
  console.log(`Node.js: ${process.version}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Verificar si dist existe
  const distPath = path.join(__dirname, 'dist');
  const hasDistFolder = fs.existsSync(distPath);
  const hasIndexHtml = hasDistFolder && fs.existsSync(path.join(distPath, 'index.html'));
  
  console.log(`Carpeta dist: ${hasDistFolder ? '✅ Existe' : '❌ No existe'}`);
  console.log(`index.html: ${hasIndexHtml ? '✅ Existe' : '❌ No existe'}`);
  
  if (!hasDistFolder || !hasIndexHtml) {
    console.log('⚠️ Creando página de mantenimiento predeterminada...');
    
    // Crear dist si no existe
    if (!hasDistFolder) {
      fs.mkdirSync(distPath, { recursive: true });
    }
    
    // Crear página de mantenimiento mínima
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>WebSAP - En mantenimiento</title>
  <style>
    body { font-family: Arial; text-align: center; padding: 50px; }
    .container { max-width: 600px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>WebSAP</h1>
    <p>En mantenimiento</p>
  </div>
</body>
</html>
    `;
    
    fs.writeFileSync(path.join(distPath, 'index.html'), htmlContent);
    console.log('✅ Página de mantenimiento creada');
  }
});