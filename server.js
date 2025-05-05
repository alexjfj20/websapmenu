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

// API endpoint para información del menú
app.get('/api/menu/:id', (req, res) => {
  // Usar datos simulados del menú
  const menuData = menuMock.generateMenu(req.params.id);
  console.log(`Sirviendo menú simulado para ID: ${req.params.id}`);
  
  // Devolver con un pequeño retraso para simular latencia de red
  setTimeout(() => {
    res.json(menuData);
  }, 300);
});

// API endpoint para información del negocio
app.get('/api/business/:id', (req, res) => {
  // Usar datos simulados del negocio
  const businessData = businessInfoMock.generateBusinessInfo(req.params.id);
  console.log(`Sirviendo información de negocio simulada para ID: ${req.params.id}`);
  
  res.json(businessData);
});

// API endpoint para menú compartido (URL común en la aplicación)
app.get('/menu/:shareId', (req, res) => {
  // Esta ruta envía el index.html pero registra la solicitud para debugging
  console.log(`Solicitud de menú compartido con ID: ${req.params.shareId}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
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