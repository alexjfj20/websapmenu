/**
 * Script para generar múltiples páginas de menú de ejemplo
 * para asegurar que los menús compartidos siempre estén disponibles
 */
const fs = require('fs');
const path = require('path');
const { menuMock } = require('./api-mocks');

console.log('🍽️ Generando múltiples páginas de menú compartido...');

// Lista de IDs de menú para generar
const menuIds = [
  '8idq9bgbdwr7srcw', // Menú principal
  'menu1',
  'menu2',
  'demo'
];

// Directorio base para los menús
const menuBaseDir = path.join(__dirname, 'dist', 'menu');

// Asegurar que existe el directorio base
if (!fs.existsSync(menuBaseDir)) {
  fs.mkdirSync(menuBaseDir, { recursive: true });
  console.log('✅ Directorio base para menús creado');
}

// Función para generar una página de menú
function generateMenuPage(menuId) {
  console.log(`⏳ Generando página para menú: ${menuId}`);
  
  // Crear directorio específico para este menú
  const menuDir = path.join(menuBaseDir, menuId);
  if (!fs.existsSync(menuDir)) {
    fs.mkdirSync(menuDir, { recursive: true });
  }
  
  // Generar datos de menú
  const menuData = menuMock.generateMenu(menuId);
  const menuDataJSON = JSON.stringify(menuData);
  
  // Guardar archivo JSON con los datos
  fs.writeFileSync(path.join(menuDir, 'data.json'), menuDataJSON, 'utf8');
  
  // HTML para la página de menú
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
      padding: 20px;
      background-color: #2c3e50;
      color: white;
      border-radius: 8px;
    }
    h1 {
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
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
    }
    .business-info p {
      margin: 5px 0;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #7f8c8d;
    }
    .btn {
      display: inline-block;
      background-color: #2c3e50;
      color: white;
      padding: 8px 15px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 10px;
    }
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      .category {
        padding: 15px;
      }
      .item-name {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${menuData.businessInfo.name}</h1>
    <p>${menuData.businessInfo.description || 'Bienvenidos a nuestro menú'}</p>
  </div>

  <div id="menu-content">
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
  </div>

  <div class="business-info">
    <p><strong>Negocio:</strong> ${menuData.businessInfo.name}</p>
    <p><strong>Dirección:</strong> ${menuData.businessInfo.address || 'No disponible'}</p>
    <p><strong>Teléfono:</strong> ${menuData.businessInfo.phone || 'No disponible'}</p>
    <p><strong>Email:</strong> ${menuData.businessInfo.email || 'No disponible'}</p>
  </div>

  <div class="footer">
    <p>WebSAP © ${new Date().getFullYear()}</p>
    <p><a class="btn" href="/">Volver al inicio</a></p>
  </div>

  <!-- Datos del menú incrustados para acceso sin conexión -->
  <script>
    // Almacenar datos del menú para que estén disponibles
    window.menuData = ${menuDataJSON};
  </script>
</body>
</html>
  `;
  
  // Guardar el archivo HTML
  fs.writeFileSync(path.join(menuDir, 'index.html'), htmlContent, 'utf8');
  console.log(`✅ Página para menú ${menuId} generada correctamente`);
}

// Generar páginas para todos los IDs de menú
menuIds.forEach(menuId => {
  try {
    generateMenuPage(menuId);
  } catch (error) {
    console.error(`❌ Error al generar página para menú ${menuId}:`, error);
  }
});

// Crear un archivo index.html para el directorio /menu/
const indexHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menús disponibles</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      color: #2c3e50;
    }
    .menu-list {
      list-style: none;
      padding: 0;
    }
    .menu-item {
      margin-bottom: 15px;
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
    }
    .menu-link {
      display: block;
      color: #2c3e50;
      font-weight: bold;
      text-decoration: none;
      font-size: 18px;
    }
    .menu-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>Menús disponibles</h1>
  <ul class="menu-list">
    ${menuIds.map(id => `
      <li class="menu-item">
        <a class="menu-link" href="/menu/${id}">Menú ${id}</a>
      </li>
    `).join('')}
  </ul>
</body>
</html>
`;

fs.writeFileSync(path.join(menuBaseDir, 'index.html'), indexHtml, 'utf8');
console.log('✅ Página de índice para menús generada correctamente');

console.log('✅ Generación de páginas de menú completada');