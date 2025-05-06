/**
 * PUNTO DE ENTRADA SIMPLIFICADO PARA RENDER
 * Este archivo es el punto de entrada principal para Render
 * Su única función es vincular un puerto HTTP para que Render lo detecte
 */
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Obtener el puerto directamente de las variables de entorno
const PORT = process.env.PORT || 3000;

console.log('==============================================');
console.log(`🚀 INICIANDO WEBSAP EN PUERTO ${PORT}`);
console.log('==============================================');
console.log(`📋 Variables de entorno: PORT=${process.env.PORT}, NODE_ENV=${process.env.NODE_ENV}`);

// Crear un servidor HTTP simple
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>WebSAP Server</title>
        <meta charset="utf-8">
        <meta http-equiv="refresh" content="5;url=/">
      </head>
      <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h1>WebSAP Server</h1>
        <p>El servidor está funcionando en el puerto ${PORT}</p>
        <p>Redirigiendo a la aplicación principal...</p>
      </body>
    </html>
  `);
});

// Vincular al puerto explícitamente
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor vinculado correctamente al puerto ${PORT}`);
  
  // Iniciar el servidor principal en segundo plano
  try {
    console.log('🔄 Iniciando proceso del servidor principal...');
    const serverProcess = spawn('node', ['server.js'], {
      detached: true,
      stdio: 'inherit'
    });
    
    serverProcess.on('error', (err) => {
      console.error('❌ Error al iniciar servidor principal:', err);
    });
    
    console.log(`✅ Proceso del servidor principal iniciado con PID: ${serverProcess.pid || 'desconocido'}`);
  } catch (err) {
    console.error('❌ Error al iniciar el servidor principal:', err);
  }
  
  // Registrar la dirección y puerto
  const address = server.address();
  console.log(`📡 Servidor escuchando en: ${address ? JSON.stringify(address) : 'desconocido'}`);
});

// Manejar errores del servidor
server.on('error', (err) => {
  console.error('❌ ERROR AL VINCULAR PUERTO:', err);
});

// Mantener el proceso vivo
setInterval(() => {
  console.log(`⏱️ Servidor activo - ${new Date().toISOString()}`);
}, 30000);

// Manejar errores no capturados
process.on('uncaughtException', (err) => {
  console.error('⚠️ Error no manejado:', err);
});