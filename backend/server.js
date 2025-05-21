const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { sequelize, closeConnection } = require('./config/database');
const fs = require('fs');

// Cargar variables de entorno
dotenv.config();

// Verificar posibles ubicaciones de archivos estáticos
console.log('=== VERIFICANDO UBICACIONES DE ARCHIVOS ESTÁTICOS ===');
const possibleStaticPaths = [
  { path: path.join(__dirname, '..', 'dist'), name: 'Carpeta dist en raíz del proyecto' },
  { path: path.join(__dirname, '..'), name: 'Directorio raíz del proyecto' },
  { path: path.join(__dirname, '..', '..', 'websapmenu'), name: 'Carpeta websapmenu en hosting' },
  { path: path.join(__dirname, 'public'), name: 'Carpeta public en backend' }
];

// Verificar cada ubicación
let staticDir = null;
for (const location of possibleStaticPaths) {
  const exists = fs.existsSync(location.path);
  const hasIndexHtml = exists && fs.existsSync(path.join(location.path, 'index.html'));
  console.log(`${location.name} (${location.path}): ${exists ? 'EXISTE' : 'NO EXISTE'} ${hasIndexHtml ? '- TIENE index.html' : ''}`);
  
  if (hasIndexHtml && !staticDir) {
    staticDir = location.path;
    console.log(`✅ Usando ${location.name} para archivos estáticos`);
  }
}

// Si no se encontró ninguna ubicación válida, usar ubicación por defecto
if (!staticDir) {
  staticDir = path.join(__dirname, '..', 'dist');
  console.log(`⚠️ No se encontró ninguna carpeta con index.html, usando ubicación por defecto: ${staticDir}`);
}

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
    version: '1.0.0',
    staticPath: staticDir
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

// Endpoint para verificar el contenido de los directorios estáticos
app.get('/api/check-static', (req, res) => {
  try {
    const results = {};
    
    for (const location of possibleStaticPaths) {
      const exists = fs.existsSync(location.path);
      let files = [];
      
      if (exists) {
        files = fs.readdirSync(location.path).map(file => {
          try {
            const stats = fs.statSync(path.join(location.path, file));
            return {
              name: file,
              isDirectory: stats.isDirectory(),
              size: stats.size,
              mtime: stats.mtime
            };
          } catch (err) {
            return {
              name: file,
              error: err.message
            };
          }
        });
      }
      
      results[location.name] = {
        path: location.path,
        exists: exists,
        files: files,
        isCurrentlyUsed: location.path === staticDir
      };
    }
    
    res.json({
      staticDirInUse: staticDir,
      locations: results
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

// Servir archivos estáticos desde la carpeta determinada
app.use(express.static(staticDir));

// Ruta fallback para SPA (Vue.js)
app.get('*', (req, res) => {
  console.log('Sirviendo index.html para:', req.url);
  
  // Verificar si el archivo index.html existe
  const indexPath = path.join(staticDir, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`Error: No se encontró el archivo index.html en ${staticDir}`);
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Error al cargar la aplicación</h1>
          <p>No se encontró el archivo index.html en la ubicación esperada.</p>
          <p>Por favor contacte al administrador.</p>
          <hr>
          <p>Ruta buscada: ${indexPath}</p>
          <p>Tiempo: ${new Date().toISOString()}</p>
        </body>
      </html>
    `);
  }
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
      console.log(`====================================================`);
      console.log(` Servidor ejecutándose en puerto ${PORT}`);
      console.log(` Archivos estáticos servidos desde: ${staticDir}`);
      console.log(` Modo: ${process.env.NODE_ENV || 'desarrollo'}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Error crítico al iniciar el servidor:', error);
    console.log('El servidor no pudo iniciarse correctamente. Compruebe la configuración de la base de datos.');
  }
};

// Iniciar el servidor
startServer();
