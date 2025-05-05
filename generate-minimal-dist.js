/**
 * Script para generar una versión mínima de la distribución cuando fallan todos los métodos de construcción
 */
const fs = require('fs');
const path = require('path');

console.log('🛠️ Generando distribución mínima...');

// Crear directorio dist si no existe
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Crear HTML básico
const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebSAP - Versión Mínima</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      text-align: center;
      padding: 50px 20px;
      background-color: #f9f9f9;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .status {
      display: inline-block;
      background-color: #f8d7da;
      color: #721c24;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      margin: 10px 0;
    }
    .info {
      font-size: 16px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>WebSAP</h1>
    <div class="status">Sitio en mantenimiento</div>
    <p class="info">
      Estamos trabajando para mejorar tu experiencia.<br>
      Por favor, intenta nuevamente más tarde.
    </p>
    <div class="footer">
      WebSAP &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
`;

// Guardar archivo HTML
fs.writeFileSync(path.join(distDir, 'index.html'), html);

// Crear archivo CSS vacío
fs.writeFileSync(path.join(distDir, 'style.css'), '/* Placeholder CSS */');

// Crear archivo JS con información básica
const js = `
// Archivo JS mínimo
console.log('WebSAP - Versión de mantenimiento');
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.status').textContent = 'Sitio en mantenimiento - ' + new Date().toLocaleDateString();
});
`;

fs.writeFileSync(path.join(distDir, 'app.js'), js);

// Crear archivo de manifest
const manifest = {
  name: 'WebSAP',
  short_name: 'WebSAP',
  description: 'WebSAP - Sistema de Administración',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#2c3e50'
};

fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('✅ Distribución mínima generada con éxito.');
console.log(`📂 Archivos generados en: ${distDir}`);
console.log('📄 - index.html');
console.log('📄 - style.css');
console.log('📄 - app.js');
console.log('📄 - manifest.json');