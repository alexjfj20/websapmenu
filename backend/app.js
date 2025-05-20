const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Añadido: para manejar rutas de archivos
const app = express();
const { closePool } = require('./config/dbPool');

// Añadir log para verificar directorio public
console.log('Directorio public:', path.join(__dirname, 'public'));

// Configurar bodyParser para manejar JSON
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Configuración CORS más permisiva para desarrollo
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Configuración para manejar errores CORS y de headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Manejador de errores para cualquier error relacionado con headers
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    console.error('Payload demasiado grande');
    return res.status(413).send('Payload demasiado grande');
  }
  
  if (err.name === 'SyntaxError') {
    console.error('Error de sintaxis en la solicitud:', err.message);
    return res.status(400).send('Solicitud malformada');
  }
  
  next(err);
});

// Importar rutas
const syncRoutes = require('./routes/syncRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Importar rutas de admin
const authRoutes = require('./routes/authRoutes'); // Añadido: importar rutas de autenticación

// Registrar rutas API
app.use('/api/sync', syncRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes); // Añadido: montar rutas de auth

// Endpoint para verificar estado de API
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint para listar rutas
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if(middleware.route) {
      routes.push(middleware.route.path);
    } else if(middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        const route = handler.route;
        if (route) {
          const basePath = middleware.regexp.toString()
            .replace('\\^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/');
          routes.push(basePath.replace(/\\/g, '') + route.path);
        }
      });
    }
  });
  res.json(routes);
});

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// IMPORTANTE: Esta ruta debe ir DESPUÉS de todas las rutas API y ANTES del fallback
// Ruta para servir el archivo index.html para rutas no API (SPA routing)
app.get(/^(?!\/api).*/, (req, res) => {
  console.log('Sirviendo index.html para:', req.url);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Puerto para el servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

// Manejar el cierre adecuado del servidor
process.on('SIGINT', async () => {
  console.log('Cerrando servidor...');
  
  try {
    await closePool();
    console.log('Pool de conexiones cerrado correctamente');
    
    server.close(() => {
      console.log('Servidor cerrado correctamente');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error al cerrar el servidor:', error);
    process.exit(1);
  }
});

module.exports = app;

