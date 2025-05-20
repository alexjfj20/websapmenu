const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { closePool } = require('./config/dbPool'); // Importamos la función para cerrar el pool

// Configurar bodyParser para manejar JSON
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Configuración CORS más permisiva para desarrollo
app.use(cors({
  origin: '*', // Permitir todas las solicitudes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Configuración para manejar errores CORS y de headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar preflight requests
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
const adminRoutes = require('./routes/adminRoutes'); // Añadido: importar rutas de admin

// Registrar rutas
app.use('/api/sync', syncRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/admin', adminRoutes); // Añadido: montar rutas de admin en /api/admin

// Ruta principal que devuelve JSON válido
app.get('/', (req, res) => {
  res.json({ message: 'It works!' }); // Cambiado: devolver JSON en lugar de texto
});

// Puerto para el servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

// Manejar el cierre adecuado del servidor y las conexiones
process.on('SIGINT', async () => {
  console.log('Cerrando servidor...');
  
  try {
    // Cerrar el pool de conexiones
    await closePool();
    console.log('Pool de conexiones cerrado correctamente');
    
    // Cerrar el servidor
    server.close(() => {
      console.log('Servidor cerrado correctamente');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error al cerrar el servidor:', error);
    process.exit(1);
  }
});

// Añadido: rutas de debug para verificar disponibilidad
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if(middleware.route) { // rutas directas
      routes.push(middleware.route.path);
    } else if(middleware.name === 'router') { // rutas de router
      middleware.handle.stack.forEach(handler => {
        const route = handler.route;
        if (route) {
          routes.push(route.path);
        }
      });
    }
  });
  res.json(routes);
});

module.exports = app;

