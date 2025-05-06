/**
 * SERVIDOR WORKER PARA RENDER
 * Este archivo está diseñado exclusivamente para Render
 * Su única responsabilidad es vincular un puerto rápidamente para que Render lo detecte
 */

// Usar HTTP directo en lugar de Express para maximizar la velocidad
const http = require('http');
const PORT = process.env.PORT || 10000;

// Servidor extremadamente simple
const server = http.createServer((req, res) => {
  console.log(`Solicitud recibida: ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSAP Server Running');
});

// Vinculación inmediata del puerto
console.log(`[${new Date().toISOString()}] Vinculando puerto ${PORT}...`);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] PUERTO ${PORT} VINCULADO EXITOSAMENTE`);
});

// Manejar errores
server.on('error', (error) => {
  console.error(`[${new Date().toISOString()}] ERROR AL VINCULAR PUERTO: ${error.message}`);
  process.exit(1);
});

// Mantener el proceso activo
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Servidor activo en puerto ${PORT}`);
}, 10000);