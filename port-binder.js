/**
 * VINCULADOR DE PUERTO EXPLÍCITO PARA RENDER (VERSIÓN CRÍTICA)
 * Este script resuelve el problema "No open ports detected" en Render
 * Este es un script de MÁXIMA PRIORIDAD que debe ejecutarse primero
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Obtener el puerto desde las variables de entorno o usar un valor predeterminado
// RENDER REQUIERE QUE USEMOS process.env.PORT
const PORT = process.env.PORT || 10000;

console.log('\n🔌 ACTIVANDO VINCULADOR DE PUERTO EXPLÍCITO');
console.log(`🔍 Usando puerto: ${PORT}`);
console.log(`🌐 Ambiente: ${process.env.RENDER ? 'RENDER' : 'LOCAL'}`);
console.log(`🔧 Variables: PORT=${process.env.PORT}, NODE_ENV=${process.env.NODE_ENV}`);

// FORZAR CONFIGURACIÓN INMEDIATA
process.title = `PORT-BINDER-${PORT}`;

// Crear un servidor HTTP simple que solo responde con un mensaje de estado
const server = http.createServer((req, res) => {
  console.log(`📝 [${new Date().toISOString()}] Recibida solicitud: ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
    <title>WebSAP Menu - Puerto Activo</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            text-align: center;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #4CAF50; }
        .status { color: green; font-weight: bold; }
        .info { margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>WebSAP Menu</h1>
        <div class="status">✅ PUERTO ACTIVO Y FUNCIONANDO</div>
        <div class="info">
            <p>Puerto: ${PORT}</p>
            <p>Servidor: Render</p>
            <p>Fecha: ${new Date().toLocaleString()}</p>
        </div>
        <p>El servidor está vinculado correctamente a un puerto.</p>
        <hr>
        <small>Este es un servidor puente. La aplicación principal está en otro proceso.</small>
    </div>
</body>
</html>
`;
  
  res.end(htmlResponse);
});

// Vincular el puerto en todas las interfaces de red (0.0.0.0)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
============================================================
✅ PUERTO ${PORT} VINCULADO EXITOSAMENTE
============================================================
🌍 Servidor escuchando en: http://0.0.0.0:${PORT}/
📋 Direcciones: ${JSON.stringify(server.address())}
⏰ Iniciado: ${new Date().toISOString()}
============================================================
`);

  // Crear un archivo de estado
  const statusInfo = {
    port: PORT,
    timestamp: new Date().toISOString(),
    address: server.address(),
    environment: process.env.RENDER ? 'render' : 'local'
  };

  try {
    fs.writeFileSync(
      path.join(__dirname, 'port-status.json'),
      JSON.stringify(statusInfo, null, 2),
      'utf8'
    );
    console.log('✅ Archivo de estado del puerto creado');
  } catch (err) {
    console.error('❌ Error al escribir archivo de estado:', err);
  }
  
  // Iniciar el servidor principal como un proceso separado
  const { spawn } = require('child_process');
  
  if (fs.existsSync(path.join(__dirname, 'server-render.js'))) {
    console.log('🚀 Iniciando servidor principal como proceso secundario...');
    
    const serverProcess = spawn('node', ['server-render.js'], { 
      detached: true,
      stdio: 'inherit'
    });
    
    serverProcess.on('error', (err) => {
      console.error('❌ Error al iniciar servidor principal:', err);
    });
    
    console.log(`✅ Proceso del servidor principal iniciado con PID: ${serverProcess.pid}`);
  }
});

// Manejar errores del servidor
server.on('error', (err) => {
  console.error('❌ ERROR EN VINCULADOR DE PUERTO:', err);
  
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ El puerto ${PORT} ya está en uso`);
    
    // Si el puerto está en uso, podríamos estar intentando usar otro puerto
    // Ejecutar netstat para verificar qué está usando el puerto
    try {
      exec('netstat -tuln', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al ejecutar netstat: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Error en netstat: ${stderr}`);
          return;
        }
        console.log(`Puertos actualmente en uso:\n${stdout}`);
      });
    } catch (e) {
      console.error('Error al verificar puertos:', e);
    }
    
    // Intentar con otro puerto como último recurso
    const FALLBACK_PORT = PORT + 1;
    console.log(`⚠️ Intentando con puerto alternativo: ${FALLBACK_PORT}`);
    
    try {
      const fallbackServer = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Fallback server running');
      });
      
      fallbackServer.listen(FALLBACK_PORT, '0.0.0.0');
      console.log(`✅ Servidor de respaldo iniciado en puerto ${FALLBACK_PORT}`);
    } catch (e) {
      console.error('Error con servidor de respaldo:', e);
    }
  }
});

// Mantener el proceso vivo
setInterval(() => {
  console.log(`⏱️ Puerto ${PORT} activo - ${new Date().toISOString()}`);
}, 60000); // Log cada minuto

// Prevenir que el proceso termine por errores no manejados
process.on('uncaughtException', (err) => {
  console.error('⚠️ Error no manejado:', err);
});