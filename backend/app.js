const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { closePool } = require('./config/dbPool');

// Crear la aplicación Express
const app = express();

// Configurar middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Importar rutas
const syncRoutes = require('./routes/syncRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');

// Definir rutas API
app.use('/api/sync', syncRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Ruta simple para test de API
app.get('/api/test/ping', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

// Endpoint para probar la base de datos
app.get('/api/test/db', async (req, res) => {
  try {
    const { getConnection } = require('./config/dbPool');
    const connection = await getConnection();
    
    // Ejecutar una consulta simple para verificar la conexión
    const [result] = await connection.query('SELECT 1 + 1 AS result');
    const [tables] = await connection.query('SHOW TABLES');
    
    res.json({
      status: 'ok',
      data: {
        database: process.env.DB_NAME || 'websap',
        connected: true,
        result: result[0].result,
        tables: tables.map(table => Object.values(table)[0])
      }
    });
  } catch (error) {
    console.error('Error al verificar la base de datos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al conectar con la base de datos',
      error: error.message
    });
  }
});

// Endpoint para sincronización de platos (como respaldo)
app.post('/api/platos', async (req, res) => {
  try {
    // Redirigir a la ruta de sincronización de platos
    req.url = '/api/sync/platos';
    app._router.handle(req, res);
  } catch (error) {
    console.error('Error en endpoint de respaldo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Manejar errores - Express requiere los 4 parámetros para reconocer un middleware de error
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
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

// Exportar la aplicación para ser usada en server.js
module.exports = app;

// Para cerrar las conexiones cuando se detiene el servidor
process.on('SIGINT', async () => {
  console.log('Cerrando servidor y conexiones...');
  await closePool();
  process.exit(0);
});
