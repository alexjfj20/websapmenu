/**
 * SERVIDOR WORKER PARA RENDER
 * Este archivo está diseñado exclusivamente para Render
 * Su única responsabilidad es vincular un puerto rápidamente para que Render lo detecte
 */

// Usar HTTP directo en lugar de Express para maximizar la velocidad
const http = require('http');
const fs = require('fs');
const path = require('path');

// IMPORTANTE: Vincularse al puerto que Render proporciona, o usar el 10000 por defecto
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0'; // Crítico: Debe vincularse a 0.0.0.0 para que Render lo detecte

// Crear página HTML de estado
const statusHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>WebSAP Server Status</title>
  <meta charset="UTF-8">
</head>
<body>
  <h1>WebSAP Server Running</h1>
  <p>Port: ${PORT}</p>
  <p>Host: ${HOST}</p>
  <p>Time: ${new Date().toISOString()}</p>
</body>
</html>
`;

// Servidor extremadamente simple
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] Solicitud recibida: ${req.url}`);
  
  // Responder con HTML para solicitudes de navegador
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(statusHtml);
});

// Vinculación inmediata del puerto - MÁXIMA PRIORIDAD
console.log(`[${new Date().toISOString()}] INICIANDO SERVIDOR EN ${HOST}:${PORT}...`);

// Vincular explícitamente a 0.0.0.0
try {
  server.listen(PORT, HOST, () => {
    console.log(`[${new Date().toISOString()}] ✅ PUERTO ${PORT} VINCULADO EXITOSAMENTE A ${HOST}`);
    console.log(`[${new Date().toISOString()}] ✅ SERVIDOR LISTO PARA RECIBIR SOLICITUDES`);
  });
} catch (err) {
  console.error(`[${new Date().toISOString()}] ❌ ERROR CRÍTICO AL VINCULAR PUERTO: ${err.message}`);
  process.exit(1);
}

// Manejar errores de manera más robusta
server.on('error', (error) => {
  console.error(`[${new Date().toISOString()}] ❌ ERROR AL VINCULAR PUERTO: ${error.message}`);
  
  if (error.code === 'EADDRINUSE') {
    console.log(`[${new Date().toISOString()}] El puerto ${PORT} está en uso. Intentando con el puerto 3000...`);
    server.listen(3000, HOST);
  } else {
    process.exit(1);
  }
});

// Mantener el proceso activo y enviar señales frecuentes para que Render detecte actividad
let intervalCount = 0;
setInterval(() => {
  intervalCount++;
  console.log(`[${new Date().toISOString()}] ✓ Servidor activo en ${HOST}:${PORT} - Latido #${intervalCount}`);
  
  // Cada 5 intervalos, mostrar información más detallada para diagnóstico
  if (intervalCount % 5 === 0) {
    console.log(`[${new Date().toISOString()}] 📊 DIAGNÓSTICO:`);
    console.log(`[${new Date().toISOString()}] - Puerto: ${PORT}`);
    console.log(`[${new Date().toISOString()}] - Host: ${HOST}`);
    console.log(`[${new Date().toISOString()}] - Memoria: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`);
    console.log(`[${new Date().toISOString()}] - Tiempo de actividad: ${Math.round(process.uptime())} segundos`);
    
    // Verificar que el servidor sigue escuchando
    if (server.listening) {
      console.log(`[${new Date().toISOString()}] - Estado: ESCUCHANDO ✓`);
    } else {
      console.log(`[${new Date().toISOString()}] - Estado: NO ESCUCHANDO ❌`);
      console.log(`[${new Date().toISOString()}] Intentando reactivar el servidor...`);
      try {
        server.listen(PORT, HOST);
      } catch (e) {
        console.error(`[${new Date().toISOString()}] Error al reactivar: ${e.message}`);
      }
    }
  }
}, 5000); // Cada 5 segundos para mayor visibilidad

// Escribir un archivo de estado para verificar que el servidor está funcionando
setInterval(() => {
  try {
    fs.writeFileSync(path.join(__dirname, 'dist', 'server-status.txt'), 
      `Server running at ${HOST}:${PORT}\nLast update: ${new Date().toISOString()}`);
  } catch (err) {
    // Ignorar errores de escritura de archivo
  }
}, 30000); // Cada 30 segundos

/**
 * SERVIDOR WORKER MINIMALISTA
 * Respaldo para port-binder.js
 * Su única tarea es vincular un puerto HTTP
 */

// Usar HTTP directo en lugar de Express para maximizar la velocidad
const httpMinimalista = require('http');
const PORT_MINIMALISTA = process.env.PORT || 10000;

console.log(`[${new Date().toISOString()}] Iniciando servidor worker en puerto ${PORT_MINIMALISTA}`);
console.log(`Puerto explícito: ${PORT_MINIMALISTA}, Host: 0.0.0.0`);

// Servidor extremadamente simple
const serverMinimalista = httpMinimalista.createServer((req, res) => {
  console.log(`Solicitud recibida: ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSAP Server Running');
});

// Vinculación inmediata del puerto
try {
  serverMinimalista.listen(PORT_MINIMALISTA, '0.0.0.0', () => {
    console.log(`[${new Date().toISOString()}] PUERTO ${PORT_MINIMALISTA} VINCULADO EXITOSAMENTE`);
    console.log(`Dirección: ${JSON.stringify(serverMinimalista.address())}`);
  });

  // Mantener el proceso activo con logs periódicos
  setInterval(() => {
    console.log(`[${new Date().toISOString()}] Servidor activo en puerto ${PORT_MINIMALISTA}`);
  }, 10000);
} catch (error) {
  console.error(`ERROR AL VINCULAR PUERTO: ${error.message}`);
  process.exit(1);
}

// Evitar que el proceso termine por errores no capturados
process.on('uncaughtException', (error) => {
  console.error(`Error no capturado: ${error.message}`);
});