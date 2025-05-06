/**
 * Versión minimalista del servidor para casos de emergencia
 * Este archivo se copiará si el servidor principal falla
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

// Crear aplicación Express
const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());
console.log('✅ CORS habilitado');

// Middleware básico para gestionar menús compartidos
app.use((req, res, next) => {
  if (req.path && req.path.includes('/menu/')) {
    console.log('🔄 Procesando solicitud de menú compartido:', req.path);
  }
  next();
});

// Middleware para procesar datos JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Ruta para el menú compartido
app.get('/menu/:shareId', (req, res) => {
  console.log(`📱 Solicitud de menú compartido: ${req.params.shareId}`);
  
  // Verificar si existe una página específica para este menú
  const menuPath = path.join(__dirname, 'dist', 'menu', req.params.shareId, 'index.html');
  
  if (fs.existsSync(menuPath)) {
    console.log('✅ Sirviendo página específica del menú');
    res.sendFile(menuPath);
  } else {
    console.log('⚠️ Redirigiendo a página genérica');
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// Ruta para archivo de verificación
app.get('/ping', (req, res) => {
  res.status(200).send('¡Servidor OK!');
});

// Ruta para obtener el status del servidor
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Captura todas las demás rutas y sirve la aplicación SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar el servidor - FORZAR PUERTO PARA RENDER
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`
  =================================================
  🚀 Servidor minimalista activo en el puerto ${port}
  =================================================
  `);
  
  // Información explícita sobre el puerto usado
  const address = server.address();
  console.log(`📡 Servidor escuchando en: ${address.address}:${address.port}`);
  
  // Registro para debug en Render
  console.log(`🔌 Puerto explícitamente vinculado: ${port}`);
  console.log(`🔧 Variables de entorno: PORT=${process.env.PORT}, RENDER=${process.env.RENDER}`);
});