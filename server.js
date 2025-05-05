require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'dist')));

// Middleware para CORS
app.use(cors());

// Middleware para parsear JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

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
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);

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