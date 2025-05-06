#!/bin/bash
# =============================================
# ¡NO USAR ESTE SCRIPT EN RENDER.COM!
# Render debe ejecutar directamente: node server-render.js
# =============================================

echo "⚠️ Este script start.sh NO debe usarse en Render. Usa npm start o node server-render.js directamente."
exit 0

// server-render.js
const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Servidor WebSAP activo');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
});

"scripts": {
  "start": "node server-render.js"
}