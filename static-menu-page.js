/**
 * Este script crea una página HTML completamente estática para el menú compartido
 * que no depende de ningún JavaScript ni de Vue para funcionar.
 */
const fs = require('fs');
const path = require('path');
const { menuMock } = require('./api-mocks');

console.log('📄 Creando página HTML estática para menú compartido...');

// ID del menú que queremos crear (el menú principal)
const menuId = '8idq9bgbdwr7srcw';

// Directorios
const distDir = path.join(__dirname, 'dist');
const menuDir = path.join(distDir, 'menu');
const specificMenuDir = path.join(menuDir, menuId);

// Asegurar que los directorios existen
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
if (!fs.existsSync(menuDir)) {
  fs.mkdirSync(menuDir, { recursive: true });
}
if (!fs.existsSync(specificMenuDir)) {
  fs.mkdirSync(specificMenuDir, { recursive: true });
}

// Generar datos del menú
const menuData = menuMock.generateMenu(menuId);

// Crear HTML completamente estático (sin JavaScript)
const staticHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Menú - ${menuData.businessInfo.name}</title>
  <style>
    /* Estilos básicos y reset */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    /* Variables CSS */
    :root {
      --primary-color: #2c3e50;
      --accent-color: #e74c3c;
      --bg-color: #f8f9fa;
      --text-color: #333;
      --border-color: #dee2e6;
      --shadow: 0 2px 4px rgba(0,0,0,0.1);
      --radius: 8px;
    }
    
    /* Estilos generales */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--bg-color);
      padding: 0;
      margin: 0;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    /* Encabezado */
    header {
      background-color: var(--primary-color);
      color: white;
      padding: 30px 0;
      text-align: center;
      margin-bottom: 30px;
    }
    
    header h1 {
      margin-bottom: 10px;
      font-size: 2.5rem;
    }
    
    header p {
      max-width: 600px;
      margin: 0 auto;
      opacity: 0.9;
    }
    
    /* Categorías */
    .category {
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      margin-bottom: 30px;
      overflow: hidden;
    }
    
    .category-header {
      background-color: var(--primary-color);
      color: white;
      padding: 15px 20px;
      font-size: 1.3rem;
    }
    
    .category-content {
      padding: 20px;
    }
    
    /* Platos */
    .item {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    
    .item-name {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 5px;
      color: var(--primary-color);
    }
    
    .item-description {
      color: #666;
      margin-bottom: 8px;
      font-size: 0.95rem;
    }
    
    .item-price {
      font-weight: bold;
      color: var(--accent-color);
      font-size: 1.1rem;
    }
    
    /* Información del negocio */
    .business-info {
      background-color: white;
      padding: 20px;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      margin-bottom: 30px;
    }
    
    .business-info h2 {
      color: var(--primary-color);
      margin-bottom: 15px;
      font-size: 1.3rem;
    }
    
    .business-info p {
      margin-bottom: 10px;
    }
    
    .business-info strong {
      color: var(--primary-color);
    }
    
    /* Footer */
    footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 0.9rem;
      margin-top: 30px;
      border-top: 1px solid var(--border-color);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      header {
        padding: 20px 0;
      }
      
      header h1 {
        font-size: 2rem;
      }
      
      .category-header {
        font-size: 1.2rem;
      }
      
      .item-name {
        font-size: 1.1rem;
      }
    }
    
    @media (max-width: 480px) {
      .container {
        padding: 0 15px;
      }
      
      header h1 {
        font-size: 1.8rem;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>${menuData.businessInfo.name}</h1>
      <p>${menuData.businessInfo.description || 'Bienvenidos a nuestro menú'}</p>
    </div>
  </header>

  <div class="container">
    <div class="business-info">
      <h2>Información del negocio</h2>
      <p><strong>Dirección:</strong> ${menuData.businessInfo.address || 'No disponible'}</p>
      <p><strong>Teléfono:</strong> ${menuData.businessInfo.phone || 'No disponible'}</p>
      <p><strong>Email:</strong> ${menuData.businessInfo.email || 'No disponible'}</p>
    </div>

    ${menuData.categories.map(category => `
      <section class="category">
        <div class="category-header">
          ${category.name}
        </div>
        <div class="category-content">
          ${category.platos.map(item => `
            <div class="item">
              <div class="item-name">${item.name}</div>
              <div class="item-description">${item.description || ''}</div>
              <div class="item-price">$${item.price.toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
      </section>
    `).join('')}
  </div>

  <footer>
    <div class="container">
      <p>Este menú es proporcionado por WebSAP</p>
      <p>&copy; ${new Date().getFullYear()} - Todos los derechos reservados</p>
    </div>
  </footer>
</body>
</html>
`;

// Guardar la página HTML estática
fs.writeFileSync(path.join(specificMenuDir, 'index.html'), staticHtml, 'utf8');
console.log(`✅ Página estática creada para el menú ${menuId}`);

// También guardar en un archivo alternativo para asegurar disponibilidad
fs.writeFileSync(path.join(specificMenuDir, 'static-menu.html'), staticHtml, 'utf8');
console.log(`✅ Página estática alternativa creada`);

// También guardar en un archivo copy-menu.html
fs.writeFileSync(path.join(specificMenuDir, 'copy-menu.html'), staticHtml, 'utf8');

// Crear una versión mínima del HTML por si acaso
const minimalHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menú - ${menuData.businessInfo.name}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { text-align: center; color: #2c3e50; }
    h2 { color: #2c3e50; margin-top: 20px; }
    .item { margin-bottom: 15px; }
    .item-name { font-weight: bold; }
    .item-price { color: #e74c3c; }
  </style>
</head>
<body>
  <h1>${menuData.businessInfo.name}</h1>
  <p><strong>Dirección:</strong> ${menuData.businessInfo.address || 'No disponible'}</p>

  ${menuData.categories.map(category => `
    <h2>${category.name}</h2>
    ${category.platos.map(item => `
      <div class="item">
        <div class="item-name">${item.name} - <span class="item-price">$${item.price.toFixed(2)}</span></div>
        <div>${item.description || ''}</div>
      </div>
    `).join('')}
  `).join('')}
</body>
</html>
`;

// Guardar versión mínima
fs.writeFileSync(path.join(specificMenuDir, 'minimal.html'), minimalHtml, 'utf8');
console.log(`✅ Página mínima creada`);

console.log('✅ Creación de páginas estáticas completada');