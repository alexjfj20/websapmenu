// Servidor extremadamente simple
var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var PORT = process.env.PORT || 3000;

// Crear directorio dist si no existe
var distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
  
  // Crear una página HTML básica
  var htmlContent = '<html><body><h1>WebSAP</h1><p>En mantenimiento</p></body></html>';
  fs.writeFileSync(path.join(distPath, 'index.html'), htmlContent);
}

// Servir archivos estáticos
app.use(express.static(distPath));

// Ruta principal
app.get('*', function(req, res) {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, function() {
  console.log('Servidor iniciado en puerto ' + PORT);
});