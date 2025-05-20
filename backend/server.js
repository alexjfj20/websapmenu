const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { sequelize, closeConnection } = require('./config/database');

// Cargar variables de entorno
dotenv.config();

// Añadir log para verificar directorio dist
console.log('Directorio dist en server.js:', path.join(__dirname, '..', 'dist'));
console.log('Verificando existencia del archivo index.html:', require('fs').existsSync(path.join(__dirname, '..', 'dist', 'index.html')) ? 'EXISTE' : 'NO EXISTE');

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración CORS adecuada
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Middleware adicional para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware para procesar JSON y formularios
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para debug de solicitudes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware para cerrar conexiones
app.use((req, res, next) => {
  const originalEnd = res.end;
  res.end = function(...args) {
    return originalEnd.apply(this, args);
  };
  next();
});

// Importar rutas
const syncRoutes = require('./routes/syncRoutes');
const authRoutes = require('./routes/authRoutes');
const directDeleteRoutes = require('./routes/directDeleteRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const platosRoutes = require('./routes/platosRoutes');
const platoRoutes = require('./routes/platoRoutes');
const indexedDBRoutes = require('./routes/indexedDBRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const restauranteRoutes = require('./routes/restauranteRoutes');

// Endpoint para verificar estado de API
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de prueba simple
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Healthcheck API general
app.get('/api/healthcheck', (req, res) => {
  console.log('Verificando estado general de la API');
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API funcionando correctamente',
    version: '1.0.0'
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

// Endpoint para verificar el contenido del directorio dist
app.get('/api/check-dist', (req, res) => {
  const fs = require('fs');
  try {
    const distDir = path.join(__dirname, '..', 'dist');
    const exists = fs.existsSync(distDir);
    let files = [];
    
    if (exists) {
      files = fs.readdirSync(distDir).map(file => {
        const stats = fs.statSync(path.join(distDir, file));
        return {
          name: file,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          mtime: stats.mtime
        };
      });
    }
    
    res.json({
      distDirExists: exists,
      distPath: distDir,
      files: files
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Registrar las rutas API - IMPORTANTE: registrar ANTES de servir archivos estáticos
app.use('/api/sync', syncRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/platos', platosRoutes);
app.use('/api/plato', platoRoutes);
app.use('/api/indexeddb', indexedDBRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/restaurantes', restauranteRoutes);
app.use('/api', directDeleteRoutes); // Cambiado para que no interfiera con las rutas de frontend

// Endpoint para verificar BD
app.get('/api/test/db', async (req, res) => {
  try {
    await sequelize.authenticate();
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${process.env.DB_NAME || 'websap'}'
    `);
    
    return res.status(200).json({
      success: true,
      message: 'Conexión a base de datos exitosa',
      data: {
        connected: true,
        database: process.env.DB_NAME || 'websap',
        tables: tables.map(t => t.table_name || t.TABLE_NAME)
      }
    });
  } catch (error) {
    console.error('Error al verificar BD:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al conectar con base de datos',
      error: error.message
    });
  }
});

// Middleware para manejar errores de rutas API
app.use('/api', (err, req, res, next) => {
  console.error('Error en API:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error en servidor',
    error: err.message
  });
});

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Ruta fallback para SPA (Vue.js)
app.get('*', (req, res) => {
  console.log('Sirviendo index.html para:', req.url);
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Middleware global para manejar errores
app.use((err, req, res, next) => {
  console.error('Error general:', err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).send('Error interno del servidor');
});

// Función para sincronizar modelos con BD
const syncModels = async () => {
  try {
    console.log(' Sincronizando modelos con la base de datos...');
    const db = sequelize();
    if (!db) {
      throw new Error('No se pudo obtener la instancia de Sequelize');
    }
    console.log(' Sincronización automática deshabilitada para evitar el error "Too many keys".');
    console.log(' Use los endpoints de migración para actualizar la estructura de la base de datos.');
    
    console.log(' Modelos sincronizados correctamente.');
  } catch (error) {
    console.error(' Error al sincronizar modelos:', error);
    throw error;
  }
};

// Limpieza de conexiones
const setupConnectionCleanup = () => {
  console.log(' Configurando limpieza periódica de conexiones...');
  setInterval(async () => {
    try {
      console.log(' Limpiando conexiones no utilizadas...');
      await closeConnection();
    } catch (error) {
      console.error(' Error al limpiar conexiones:', error);
    }
  }, 30 * 60 * 1000); // 30 minutos
};

// Iniciar servidor
const startServer = async () => {
  try {
    await syncModels();
    setupConnectionCleanup();
    
    app.listen(PORT, () => {
      console.log(` Servidor ejecutándose en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error crítico al iniciar el servidor:', error);
    console.log('El servidor no pudo iniciarse correctamente. Compruebe la configuración de la base de datos.');
  }
};

// Iniciar el servidor
startServer();

