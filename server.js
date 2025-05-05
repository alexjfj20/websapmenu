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
  
  // Establecer encabezados para evitar problemas CORS y caché
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Usar datos simulados del menú
  const menuData = menuMock.generateMenu(req.params.shareId);
  res.json(menuData);
});

// API endpoint alternativo con URL más corta
app.get('/api/menu-publico', (req, res) => {
  console.log('Solicitud API para menú público (URL corta)');
  
  // Usar el ID del menú principal
  const menuId = '8idq9bgbdwr7srcw';
  
  // Establecer encabezados
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Usar datos simulados del menú
  const menuData = menuMock.generateMenu(menuId);
  res.json(menuData);
});

// Endpoints para operaciones CRUD que disparan regeneración de menú

// Crear plato
app.post('/api/platos', (req, res) => {
  console.log('📝 Creando nuevo plato');
  
  // Aquí normalmente se guardaría en la base de datos
  // Por ahora solo simulamos una respuesta exitosa
  
  // Programar regeneración de menú
  if (menuRefresher) {
    menuRefresher.triggerRefresh();
  }
  
  res.status(201).json({ 
    success: true, 
    message: 'Plato creado exitosamente',
    refreshScheduled: true
  });
});

// Actualizar plato
app.put('/api/platos/:id', (req, res) => {
  console.log(`📝 Actualizando plato con ID: ${req.params.id}`);
  
  // Programar regeneración de menú
  if (menuRefresher) {
    menuRefresher.triggerRefresh();
  }
  
  res.json({ 
    success: true, 
    message: 'Plato actualizado exitosamente',
    refreshScheduled: true
  });
});

// Eliminar plato
app.delete('/api/platos/:id', (req, res) => {
  console.log(`🗑️ Eliminando plato con ID: ${req.params.id}`);
  
  // Programar regeneración de menú
  if (menuRefresher) {
    menuRefresher.triggerRefresh();
  }
  
  res.json({ 
    success: true, 
    message: 'Plato eliminado exitosamente',
    refreshScheduled: true
  });
});

// Endpoint para forzar regeneración de menú
app.post('/api/admin/refresh-menu', (req, res) => {
  console.log('🔄 Solicitud para regenerar menús');
  
  if (menuRefresher) {
    const success = menuRefresher.triggerRefresh();
    if (success) {
      res.json({ success: true, message: 'Regeneración de menú programada' });
    } else {
      res.status(500).json({ success: false, message: 'Error al programar regeneración' });
    }
  } else {
    res.status(501).json({ success: false, message: 'Servicio de regeneración no disponible' });
  }
});

// API endpoint para menú compartido (URL común en la aplicación)
app.get('/menu/:shareId', (req, res) => {
  const shareId = req.params.shareId;
  
  console.log(`📩 Solicitud recibida para menú compartido ID: ${shareId}`);
  
  // Detectar si es una solicitud de API (Accept: application/json) o de página
  const acceptHeader = req.get('Accept') || '';
  const userAgent = req.get('User-Agent') || '';
  const isApiRequest = acceptHeader.includes('application/json') || 
                      req.xhr || 
                      req.query.format === 'json' ||
                      req.query.api === 'true';
  
  if (isApiRequest) {
    // Si es una solicitud de API, devolver datos JSON
    console.log(`🔄 Sirviendo datos JSON para menú: ${shareId}`);
    const menuData = menuMock.generateMenu(shareId);
    return res.json(menuData);
  }
  
  // Para solicitudes normales, intentar servir la página estática
  console.log(`🌐 Sirviendo página HTML para menú: ${shareId}`);
  
  // CASO ESPECIAL - Menú principal
  if (shareId === '8idq9bgbdwr7srcw') {
    console.log('🔑 Detectado menú principal, usando enfoque especial');
    
    // Intentar cargar la página estática específica
    const specialMenuPath = path.join(__dirname, 'dist', 'menu', shareId, 'index.html');
    const backupPath = path.join(__dirname, 'dist', 'menu', shareId, 'backup.html');
    const minimalPath = path.join(__dirname, 'dist', 'menu', shareId, 'minimal.html');
    const fallbackPath = path.join(__dirname, 'menu-backup.html');
    
    // Probar múltiples ubicaciones para el archivo
    if (fs.existsSync(specialMenuPath)) {
      console.log('✅ Enviando página estática específica');
      return res.sendFile(specialMenuPath);
    } else if (fs.existsSync(backupPath)) {
      console.log('✅ Enviando página de backup');
      return res.sendFile(backupPath);
    } else if (fs.existsSync(minimalPath)) {
      console.log('✅ Enviando página minimal');
      return res.sendFile(minimalPath);
    } else if (fs.existsSync(fallbackPath)) {
      console.log('✅ Enviando página fallback');
      return res.sendFile(fallbackPath);
    }
    
    // Si no existe, intentar generarla
    try {
      console.log('🔄 Generando página estática para menú principal...');
      require('./static-menu-page');
      
      // Verificar si se creó correctamente
      if (fs.existsSync(specialMenuPath)) {
        console.log('✅ Página estática generada correctamente');
        return res.sendFile(specialMenuPath);
      }
    } catch (error) {
      console.error('❌ Error generando página estática:', error);
    }
    
    // Si todo falla, verificar si existe el archivo de "menú no encontrado"
    const notFoundPath = path.join(__dirname, 'menu-not-found.html');
    
    if (fs.existsSync(notFoundPath)) {
      console.log('⚠️ Enviando página de "menú no encontrado"');
      return res.sendFile(notFoundPath);
    }
    
    // Si ni siquiera existe el archivo de "menú no encontrado", generar HTML directamente
    console.log('⚠️ Generando HTML directamente como último recurso');
    const menuData = menuMock.generateMenu(shareId);
    
    return res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Menú - ${menuData.businessInfo.name}</title>
      <style>body{font-family:Arial,sans-serif;line-height:1.6;max-width:800px;margin:0 auto;padding:15px}.header{background:#2c3e50;color:#fff;padding:20px;text-align:center;margin-bottom:20px;border-radius:5px}.item{margin-bottom:15px;border-bottom:1px solid #eee;padding-bottom:15px}.item-name{font-weight:700}.item-price{color:#e74c3c;font-weight:700}</style>
    </head>
    <body>
      <div class="header">
        <h1>${menuData.businessInfo.name || 'Menú'}</h1>
        <p>${menuData.businessInfo.description || ''}</p>
      </div>
      
      ${menuData.categories.map(cat => `
        <div class="category">
          <h2>${cat.name}</h2>
          ${cat.platos.map(item => `
            <div class="item">
              <div class="item-name">${item.name}</div>
              <div class="item-description">${item.description || ''}</div>
              <div class="item-price">$${item.price.toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
      
      <div class="footer" style="margin-top:30px;text-align:center;color:#777">
        <p>Dirección: ${menuData.businessInfo.address || 'No disponible'}</p>
        <p>WebSAP © ${new Date().getFullYear()}</p>
      </div>
    </body>
    </html>
    `);
  }
  
  // Si llegamos aquí, usar el enfoque normal
  const specificMenuPath = path.join(__dirname, 'dist', 'menu', shareId, 'index.html');
  
  if (fs.existsSync(specificMenuPath)) {
    // Enviar la página específica si existe
    console.log('✅ Sirviendo página existente del menú');
    return res.sendFile(specificMenuPath);
  }
  
  // Si no existe, generar una página específica para este menú
  console.log('⚠️ No se encontró página específica, generando una nueva');
  
  // Crear la estructura de directorios si no existe
  const menuDir = path.join(__dirname, 'dist', 'menu');
  if (!fs.existsSync(menuDir)) {
    fs.mkdirSync(menuDir, { recursive: true });
  }
  
  const shareIdDir = path.join(menuDir, shareId);
  if (!fs.existsSync(shareIdDir)) {
    fs.mkdirSync(shareIdDir, { recursive: true });
  }
  
  // Generar los datos del menú
  const menuData = menuMock.generateMenu(shareId);
  
  // Generar HTML simple sin dependencias
  const simpleHtml = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menú - ${menuData.businessInfo.name}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; max-width: 800px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 20px; padding: 20px; background-color: #2c3e50; color: white; }
      .category { margin-bottom: 20px; background-color: white; padding: 15px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .item { margin-bottom: 15px; border-bottom: 1px dashed #eee; padding-bottom: 15px; }
      .item:last-child { border-bottom: none; }
      .item-name { font-weight: bold; }
      .item-price { color: #e74c3c; font-weight: bold; }
      .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${menuData.businessInfo.name || 'Menú'}</h1>
      <p>${menuData.businessInfo.description || ''}</p>
    </div>
    
    <div id="menu-content">
      ${menuData.categories.map(cat => `
        <div class="category">
          <h2>${cat.name}</h2>
          ${cat.platos.map(item => `
            <div class="item">
              <div class="item-name">${item.name}</div>
              <div class="item-description">${item.description || ''}</div>
              <div class="item-price">$${item.price.toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
    
    <div class="footer">
      <p>Dirección: ${menuData.businessInfo.address || 'No disponible'}</p>
      <p>Teléfono: ${menuData.businessInfo.phone || 'No disponible'}</p>
      <p>WebSAP © ${new Date().getFullYear()}</p>
    </div>
  </body>
  </html>
  `;
  
  // Guardar la página generada para futuros accesos
  fs.writeFileSync(path.join(shareIdDir, 'index.html'), simpleHtml);
  console.log('✅ Página generada y guardada para este menú');
  
  // Enviar al cliente
  return res.send(simpleHtml);
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

// Rutas raw para pruebas de conectividad
app.get('/raw/ping', (req, res) => {
  res.send('pong');
});

// Rutas adicionales para pruebas de conectividad en diferentes puertos
[3000, 5000, 8000, 8080].forEach(port => {
  app.get(`/raw/ping/${port}`, (req, res) => {
    res.send(`pong:${port}`);
  });
});

// Ruta directa para el menú principal (acceso más fácil)
app.get('/menu-publico', (req, res) => {
  console.log('🌟 Solicitud recibida para menú público (URL simplificada)');
  
  // Redirigir a la página del menú principal
  const menuId = '8idq9bgbdwr7srcw';
  const specificMenuPath = path.join(__dirname, 'dist', 'menu', menuId, 'index.html');
  
  if (fs.existsSync(specificMenuPath)) {
    console.log('✅ Enviando página estática del menú principal');
    return res.sendFile(specificMenuPath);
  } else {
    // Si no existe, intentar generarla
    try {
      console.log('🔄 Intentando generar página de menú principal...');
      require('./static-menu-page');
      
      if (fs.existsSync(specificMenuPath)) {
        console.log('✅ Página generada correctamente');
        return res.sendFile(specificMenuPath);
      }
    } catch (error) {
      console.error('❌ Error generando página de menú:', error);
    }
    
    // Si todo falla, redirigir a la URL normal del menú
    return res.redirect(`/menu/${menuId}`);
  }
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