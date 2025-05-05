// Servidor simple para modo mantenimiento
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

// Ruta principal que devuelve una página de mantenimiento
app.get('*', function(req, res) {
  res.send(
    '<!DOCTYPE html>' +
    '<html>' +
      '<head>' +
        '<title>WebSAP - Mantenimiento</title>' +
        '<meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<style>' +
          'body {' +
            'font-family: Arial, sans-serif;' +
            'text-align: center;' +
            'padding: 50px;' +
            'background-color: #f5f5f5;' +
          '}' +
          '.container {' +
            'max-width: 600px;' +
            'margin: 0 auto;' +
            'background-color: white;' +
            'border-radius: 10px;' +
            'padding: 30px;' +
            'box-shadow: 0 2px 10px rgba(0,0,0,0.1);' +
          '}' +
          'h1 {' +
            'color: #2c3e50;' +
          '}' +
        '</style>' +
      '</head>' +
      '<body>' +
        '<div class="container">' +
          '<h1>WebSAP</h1>' +
          '<p>La aplicación está en mantenimiento. Por favor, intente más tarde.</p>' +
        '</div>' +
      '</body>' +
    '</html>'
  );
});

// Iniciar el servidor
app.listen(PORT, function() {
  console.log("Servidor de mantenimiento ejecutándose en puerto " + PORT);
});