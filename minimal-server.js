// Servidor mínimo sin dependencias externas
var http = require('http');
var fs = require('fs');
var path = require('path');

// Crear directorio dist si no existe
var distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
  
  // Crear página HTML simple
  var html = 
    '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '  <title>WebSAP</title>' +
    '  <style>' +
    '    body { font-family: sans-serif; text-align: center; margin-top: 50px; }' +
    '    h1 { color: #333; }' +
    '  </style>' +
    '</head>' +
    '<body>' +
    '  <h1>WebSAP</h1>' +
    '  <p>Aplicación en mantenimiento. Por favor, intente más tarde.</p>' +
    '</body>' +
    '</html>';
  
  fs.writeFileSync(path.join(distPath, 'index.html'), html);
}

// Crear servidor HTTP simple
var server = http.createServer(function(req, res) {
  // Servir index.html para cualquier ruta
  var filePath = path.join(distPath, 'index.html');
  
  fs.readFile(filePath, function(err, content) {
    if (err) {
      // Si hay error al leer el archivo, enviar mensaje de error
      res.writeHead(500);
      res.end('Error: No se pudo cargar la página');
      return;
    }
    
    // Enviar el contenido HTML
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content, 'utf-8');
  });
});

// Puerto para el servidor
var PORT = process.env.PORT || 3000;

// Iniciar servidor
server.listen(PORT, function() {
  console.log('Servidor ejecutándose en puerto ' + PORT);
});