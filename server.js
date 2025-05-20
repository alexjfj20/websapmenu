const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Configurar CORS para producción/desarrollo
const corsOrigin = process.env.CORS_ORIGIN || 'https://allseo.xyz';
app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (como mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Permitir localhost en desarrollo y CORS_ORIGIN en producción
    if (origin.startsWith('http://localhost') || origin === corsOrigin) {
      return callback(null, true);
    } else {
      return callback(null, false);
    }
  },
  credentials: true
}));

// Middleware para procesar JSON y formularios
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos del frontend desde la carpeta dist
const frontendDistPath = path.join(__dirname, 'dist');
console.log(`[INFO] Serving static files from: ${frontendDistPath}`);
app.use(express.static(frontendDistPath));

// Si tienes rutas API, configúralas aquí
// Por ejemplo:
// const apiRoutes = require('./backend/routes/apiRoutes');
// app.use('/api', apiRoutes);

// Ruta de prueba para verificar que el servidor está activo
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Catch-all para servir index.html para rutas de SPA (Single Page Application)
app.get('*', (req, res) => {
  // Asegúrate que las solicitudes a la API no sean interceptadas por esto
  if (!req.path.startsWith('/api/')) {
    console.log(`[CATCH_ALL] Serving index.html for path: ${req.path}`);
    
    // Detectamos si esta petición viene de una URL pública como /menu/ID
    // La URL original estará en req.originalUrl
    const isPublicMenuUrl = req.originalUrl.includes('/menu/');
    if (isPublicMenuUrl) {
      console.log(`[PUBLIC_MENU] Detected access from public menu URL: ${req.originalUrl}`);
    }
    
    res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
      if (err) {
        console.error(`[ERROR] Error sending index.html: ${err}`);
        res.status(500).send(err);
      }
    });
  } else {
    // Si es una ruta API no encontrada
    res.status(404).send('API route not found');
  }
});

// Iniciar el servidor 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});