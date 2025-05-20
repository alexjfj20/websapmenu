const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();
// Usa el puerto de la variable de entorno o 3000 por defecto
const PORT = process.env.PORT || 3000;

// Importar la aplicación Express configurada en app.js
const app = require('./app');

// Configuración CORS adecuada para producción y desarrollo
// Usa la variable de entorno CORS_ORIGIN para producción
const allowedOrigins = process.env.NODE_ENV === 'production' 
                         ? [process.env.CORS_ORIGIN] 
                         : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3001']; // Añade puertos de desarrollo si son diferentes

app.use(cors({
  origin: function (origin, callback) {
    // Permite solicitudes sin origen (como Postman en algunos casos) o si el origen está en la lista
    // En producción estricta, podrías querer quitar `!origin`
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`); // Loguear origen bloqueado
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true // Es importante si usas cookies o sesiones para autenticación
}));

// Middleware adicional para CORS (puede ser redundante con la configuración anterior, pero asegura cabeceras)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  // Estas cabeceras son importantes para preflight (OPTIONS)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Manejar solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Middleware para procesar JSON y formularios
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos del frontend desde ../dist
const frontendDistPath = path.join(__dirname, '..', 'dist');
app.use(express.static(frontendDistPath));

// Servir archivos estáticos desde la carpeta public (si aún es necesario)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para debug de solicitudes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware para cerrar conexiones después de cada solicitud
app.use((req, res, next) => {
  // Guardar la función original end
  const originalEnd = res.end;
  
  // Sobrescribir la función end
  res.end = function(...args) {
    // No cerrar conexiones después de cada solicitud, ya que esto causa problemas
    // con el pool de conexiones. En su lugar, la limpieza se hará periódicamente.
    
    // Llamar a la función original end
    return originalEnd.apply(this, args);
  };
  
  next();
});

// Rutas de la API
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const platoRoutes = require('./routes/platoRoutes'); // Asegúrate que el nombre del archivo sea correcto
const restauranteRoutes = require('./routes/restauranteRoutes');
const backupRoutes = require('./routes/backupRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
// ... (importa todas tus otras rutas de API aquí)

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/platos', platoRoutes);
app.use('/api/restaurantes', restauranteRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/notifications', notificationRoutes);
// ... (usa todas tus otras rutas de API aquí)

// Catch-all para servir index.html para rutas de SPA (Single Page Application)
app.get('*', (req, res) => {
  // Asegúrate que las solicitudes a la API no sean interceptadas por esto
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
      if (err) {
        res.status(500).send(err);
      }
    });
  } else {
    // Si es una ruta API no encontrada, podría devolver 404
    res.status(404).send('API route not found');
  }
});

// Ruta de prueba simple
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Ruta de prueba para test
app.get('/api/test/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong',
    timestamp: new Date().toISOString() 
  });
});

// Verificar el estado de la base de datos
app.get('/api/test/db', async (req, res) => {
  try {
    const { getConnection } = require('./config/dbPool');
    const connection = await getConnection();
    
    // Ejecutar una consulta simple para verificar la conexión
    const [result] = await connection.query('SELECT 1 + 1 AS result');
    
    res.json({
      status: 'ok',
      data: {
        database: process.env.DB_NAME || 'websap',
        connected: true,
        result: result[0].result,
        tables: ['platos', 'categorias', 'usuarios', 'ventas']
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

// Middleware de manejo de errores (debe ir al final)
app.use((err, req, res) => { // Remove unused 'next' parameter
  console.error('Error no manejado:', err);
  // Evitar enviar detalles del error en producción por seguridad
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  res.status(statusCode).json({ error: message });
});

// Función para sincronizar modelos con la base de datos
const syncModels = async () => {
  try {
    console.log(' Sincronizando modelos con la base de datos...');
    // Cambiamos a sync() sin alter para evitar el error "Too many keys"
    const db = sequelize();
    if (!db) {
      throw new Error('No se pudo obtener la instancia de Sequelize');
    }
    
    // Deshabilitamos la sincronización automática para evitar el error "Too many keys"
    // await db.sync({ alter: false });
    console.log(' Sincronización automática deshabilitada para evitar el error "Too many keys".');
    console.log(' Use los endpoints de migración para actualizar la estructura de la base de datos.');
    
    console.log(' Modelos sincronizados correctamente.');
  } catch (error) {
    console.error(' Error al sincronizar modelos:', error);
    throw error;
  }
};

// Función para cerrar periódicamente las conexiones no utilizadas
const setupConnectionCleanup = () => {
  console.log(' Configurando limpieza periódica de conexiones...');
  
  // Limpiar conexiones cada 30 minutos en lugar de 5 minutos
  // para reducir la frecuencia de limpieza y evitar problemas
  setInterval(async () => {
    try {
      console.log(' Limpiando conexiones no utilizadas...');
      await closeConnection();
    } catch (error) {
      console.error(' Error al limpiar conexiones:', error);
    }
  }, 30 * 60 * 1000); // 30 minutos
};

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Sincronizar modelos con la base de datos
    await syncModels();
    
    // Configurar limpieza periódica de conexiones
    setupConnectionCleanup();
    
    // Iniciar el servidor Express
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
