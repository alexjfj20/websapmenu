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

// Crear HTML específico para este menú - versión completamente autónoma
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
    .badge {
      display: inline-block;
      background-color: #2c3e50;
      color: white;
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 12px;
      margin-left: 10px;
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
    .search-container {
      margin: 20px 0;
    }
    #search-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 16px;
    }
    .category-toggle {
      cursor: pointer;
      user-select: none;
    }
    .category-toggle::after {
      content: "▼";
      margin-left: 10px;
      font-size: 12px;
    }
    .category.collapsed .category-content {
      display: none;
    }
    .category.collapsed .category-toggle::after {
      content: "►";
    }
    .no-results {
      padding: 20px;
      text-align: center;
      background-color: #f8f9fa;
      border-radius: 8px;
      color: #6c757d;
      display: none;
    }
    .highlight {
      background-color: #ffff99;
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

  <div class="search-container">
    <input type="text" id="search-input" placeholder="Buscar platos...">
  </div>
  
  <div class="no-results">No se encontraron platos que coincidan con la búsqueda.</div>

  <div id="categories-container">
    ${menuData.categories.map(category => `
      <div class="category" data-category-id="${category.id}">
        <h2 class="category-toggle">${category.name}</h2>
        <div class="category-content">
          ${category.platos.map(item => `
            <div class="item" data-item-id="${item.id}">
              <div class="item-name">${item.name}</div>
              <div class="item-description">${item.description || ''}</div>
              <div class="item-price">$${item.price.toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
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
    <p>Este menú está disponible en modo autónomo sin necesidad de conexión.</p>
    <p>WebSAP © ${new Date().getFullYear()}</p>
    <p><a class="btn" href="/">Volver al inicio</a></p>
  </div>

  <!-- Incluir los datos JSON para la aplicación -->
  <script>
    // Guardar datos del menú para que estén disponibles para la aplicación
    window.menuData = ${menuDataJSON};
    
    // Funcionalidad de búsqueda y filtrado
    document.addEventListener('DOMContentLoaded', function() {
      // Referencias a elementos
      const searchInput = document.getElementById('search-input');
      const categoriesContainer = document.getElementById('categories-container');
      const categories = document.querySelectorAll('.category');
      const noResults = document.querySelector('.no-results');
      
      // Función de búsqueda
      function searchMenu(query) {
        query = query.toLowerCase();
        let hasResults = false;
        
        categories.forEach(category => {
          const items = category.querySelectorAll('.item');
          let categoryHasResults = false;
          
          items.forEach(item => {
            const name = item.querySelector('.item-name').innerText.toLowerCase();
            const description = item.querySelector('.item-description').innerText.toLowerCase();
            
            if (name.includes(query) || description.includes(query)) {
              // Resaltar coincidencias
              highlightText(item, query);
              item.style.display = 'block';
              categoryHasResults = true;
              hasResults = true;
            } else {
              // Quitar resaltado y ocultar
              removeHighlight(item);
              item.style.display = 'none';
            }
          });
          
          // Mostrar/ocultar categoría según resultados
          if (categoryHasResults) {
            category.style.display = 'block';
            category.classList.remove('collapsed');
          } else {
            category.style.display = 'none';
          }
        });
        
        // Mostrar mensaje de no resultados
        noResults.style.display = hasResults ? 'none' : 'block';
      }
      
      // Función para resaltar texto
      function highlightText(element, query) {
        const nameEl = element.querySelector('.item-name');
        const descEl = element.querySelector('.item-description');
        
        nameEl.innerHTML = highlight(nameEl.textContent, query);
        descEl.innerHTML = highlight(descEl.textContent, query);
      }
      
      // Función para quitar resaltado
      function removeHighlight(element) {
        const nameEl = element.querySelector('.item-name');
        const descEl = element.querySelector('.item-description');
        
        nameEl.innerHTML = nameEl.textContent;
        descEl.innerHTML = descEl.textContent;
      }
      
      // Función auxiliar para resaltar texto
      function highlight(text, query) {
        if (!query) return text;
        const regex = new RegExp('(' + query + ')', 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
      }
      
      // Eventos
      searchInput.addEventListener('input', function() {
        searchMenu(this.value);
      });
      
      // Funcionalidad de plegar/desplegar categorías
      document.querySelectorAll('.category-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
          const category = this.closest('.category');
          category.classList.toggle('collapsed');
        });
      });
    });
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