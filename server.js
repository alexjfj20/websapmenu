require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

// Cargar dependencias con manejo de errores
let cors;
try {
  cors = require('cors');
} catch (e) {
  console.warn('⚠️ Módulo cors no encontrado. CORS no estará habilitado.');
  cors = function() {
    return (req, res, next) => next();
  };
}

const app = express();
const PORT = process.env.PORT || 3000;

// Verificar que el directorio dist existe
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.warn('⚠️ El directorio dist no existe. Creando una página temporal...');
  try {
    fs.mkdirSync(distPath, { recursive: true });
    fs.writeFileSync(path.join(distPath, 'index.html'), `
      <!DOCTYPE html>
      <html>
        <head>
          <title>WebSAP</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            h1 { color: #4a4a4a; }
          </style>
        </head>
        <body>
          <h1>Aplicación en preparación</h1>
          <p>La aplicación se está configurando. Por favor intenta más tarde.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error al crear página temporal:', err);
  }
}

// Habilitar CORS si está disponible
try {
  app.use(cors());
  console.log('✅ CORS habilitado');
} catch (e) {
  console.warn('⚠️ No se pudo habilitar CORS:', e.message);
}

// Middleware para servir archivos estáticos
app.use(express.static('public'));
app.use(express.static(distPath));

// Middleware para parsear JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Registrar middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Importa y usa las rutas
const syncRoutes = require('./src/server/routes/api');  
app.use('/api/sync', syncRoutes);  
console.log("🚀 Rutas de /api/sync registradas correctamente");

// Ruta de prueba para verificar que el servidor está activo
app.get('/api/ping', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send('pong');
});

// For any request that doesn't match an API route, send the Vue app
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  
  // Verificar que el index.html existe
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WebSAP</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            h1 { color: #4a4a4a; }
          </style>
        </head>
        <body>
          <h1>WebSAP</h1>
          <p>Aplicación en preparación. Por favor intenta más tarde.</p>
        </body>
      </html>
    `);
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV}`);
  console.log(`URL: http://localhost:${PORT}`);

  // Listar todas las rutas registradas con sus métodos
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      const methods = Object.keys(r.route.methods)
        .map((method) => method.toUpperCase())
        .join(', ');
      console.log(`📌 Ruta activa: ${methods} ${r.route.path}`);
    }
  });
});