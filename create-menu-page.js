/**
 * Script para crear una página HTML específica para el menú compartido
 */
const fs = require('fs');
const path = require('path');

// Importar mocks para generar datos del menú
const { menuMock } = require('./api-mocks');

console.log('🍽️ Creando página HTML para menú compartido...');

// Directorio de destino
const distDir = path.join(__dirname, 'dist');

// Asegurarse de que el directorio dist existe
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
  console.log('✅ Directorio dist creado');
}

// Crear directorio específico para menú
const menuDir = path.join(distDir, 'menu');
if (!fs.existsSync(menuDir)) {
  fs.mkdirSync(menuDir);
  console.log('✅ Directorio menu creado');
}

// ID para el menú compartido
const menuId = '8idq9bgbdwr7srcw';

// Directorio específico para este menú
const specificMenuDir = path.join(menuDir, menuId);
if (!fs.existsSync(specificMenuDir)) {
  fs.mkdirSync(specificMenuDir);
  console.log(`✅ Directorio para menú específico ${menuId} creado`);
}

// Obtener los datos del menú simulado
const menuData = menuMock.generateMenu(menuId);
const menuDataJSON = JSON.stringify(menuData);

// Crear archivo de datos JSON
fs.writeFileSync(
  path.join(specificMenuDir, 'data.json'), 
  menuDataJSON, 
  'utf8'
);
console.log('✅ Archivo de datos JSON creado');

// Crear HTML específico para este menú
const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menú - ${menuData.businessInfo.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    h2 {
      color: #2c3e50;
      margin-top: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .category {
      margin-bottom: 30px;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .item {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px dashed #eee;
    }
    .item:last-child {
      border-bottom: none;
    }
    .item-name {
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 5px;
    }
    .item-description {
      color: #666;
      margin-bottom: 8px;
    }
    .item-price {
      font-weight: bold;
      color: #e74c3c;
    }
    .business-info {
      font-style: italic;
      margin-top: 15px;
      color: #7f8c8d;
    }
    .maintenance {
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 5px;
      margin: 20px 0;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${menuData.businessInfo.name}</h1>
    <p>${menuData.businessInfo.description || 'Bienvenidos a nuestro menú'}</p>
  </div>

  <div class="maintenance">
    <p>Esta página está en modo de mantenimiento y muestra datos de ejemplo.</p>
  </div>

  ${menuData.categories.map(category => `
    <div class="category">
      <h2>${category.name}</h2>
      ${category.platos.map(item => `
        <div class="item">
          <div class="item-name">${item.name}</div>
          <div class="item-description">${item.description || ''}</div>
          <div class="item-price">$${item.price.toFixed(2)}</div>
        </div>
      `).join('')}
    </div>
  `).join('')}

  <div class="business-info">
    <p>Dirección: ${menuData.businessInfo.address || 'No disponible'}</p>
    <p>Teléfono: ${menuData.businessInfo.phone || 'No disponible'}</p>
  </div>

  <!-- Incluir los datos JSON para la aplicación -->
  <script>
    window.menuData = ${menuDataJSON};
  </script>
</body>
</html>
`;

// Guardar el archivo HTML
fs.writeFileSync(path.join(specificMenuDir, 'index.html'), htmlContent, 'utf8');
console.log(`✅ Archivo HTML para menú ${menuId} creado`);

// Crear archivo index.html en el directorio /menu que redireccione
const redirectHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/">
  <title>Redirección</title>
</head>
<body>
  <p>Redireccionando...</p>
</body>
</html>
`;

fs.writeFileSync(path.join(menuDir, 'index.html'), redirectHtml, 'utf8');
console.log('✅ Archivo de redirección creado');

console.log('✅ Creación de página de menú compartido completada');