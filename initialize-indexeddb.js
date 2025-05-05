/**
 * Script para inicializar y configurar IndexedDB en la aplicación cliente
 * Este script se inyectará en el index.html para asegurar que la caché funcione correctamente
 */
const fs = require('fs');
const path = require('path');

console.log('🔄 Inicializando configuración de IndexedDB...');

// Ruta al archivo index.html
const indexPath = path.join(__dirname, 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ No se encontró el archivo index.html');
  process.exit(1);
}

// Código JavaScript para inicializar IndexedDB
const indexedDBScript = `
<script>
// Script de inicialización de IndexedDB para WebSAP
(function() {
  console.log('🔄 Inicializando IndexedDB para WebSAP...');
  
  // Configuración de IndexedDB
  const dbConfig = {
    name: 'restauranteAppDB',
    version: 4,
    stores: {
      platos: { keyPath: 'id', autoIncrement: true },
      syncQueue: { keyPath: 'id', autoIncrement: true },
      menuCache: { keyPath: 'id' } // Nuevo almacén para menús
    }
  };
  
  // Función para inicializar la base de datos
  function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbConfig.name, dbConfig.version);
      
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        console.log('⬆️ Actualizando base de datos a versión', dbConfig.version);
        
        // Crear almacenes si no existen
        if (!db.objectStoreNames.contains('platos')) {
          db.createObjectStore('platos', { keyPath: 'id', autoIncrement: true });
          console.log('✅ Almacén "platos" creado');
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          console.log('✅ Almacén "syncQueue" creado');
        }
        
        // Asegurarse de que existe el almacén menuCache
        if (!db.objectStoreNames.contains('menuCache')) {
          db.createObjectStore('menuCache', { keyPath: 'id' });
          console.log('✅ Almacén "menuCache" creado');
        }
      };
      
      request.onsuccess = function(event) {
        const db = event.target.result;
        console.log('✅ Base de datos IndexedDB inicializada correctamente');
        
        // Verificar almacenes existentes
        console.log('📂 Almacenes disponibles:', Array.from(db.objectStoreNames));
        
        resolve(db);
      };
      
      request.onerror = function(event) {
        console.error('❌ Error al inicializar IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  // Función para guardar un menú en caché
  function saveMenuToCache(menuData) {
    if (!menuData || !menuData.id) {
      console.warn('⚠️ Datos de menú inválidos para caché');
      return Promise.reject(new Error('Datos inválidos'));
    }
    
    return initDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['menuCache'], 'readwrite');
        const store = tx.objectStore('menuCache');
        
        // Añadir fecha de caché
        menuData.cachedAt = new Date().toISOString();
        
        const request = store.put(menuData);
        
        request.onsuccess = function() {
          console.log('✅ Menú guardado en caché:', menuData.id);
          resolve(true);
        };
        
        request.onerror = function(event) {
          console.error('❌ Error al guardar menú en caché:', event.target.error);
          reject(event.target.error);
        };
        
        tx.oncomplete = function() {
          db.close();
        };
      });
    });
  }
  
  // Función para obtener un menú desde caché
  function getMenuFromCache(menuId) {
    return initDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['menuCache'], 'readonly');
        const store = tx.objectStore('menuCache');
        
        const request = store.get(menuId);
        
        request.onsuccess = function(event) {
          const menu = event.target.result;
          if (menu) {
            console.log('✅ Menú recuperado de caché:', menuId);
            resolve(menu);
          } else {
            console.warn('⚠️ Menú no encontrado en caché:', menuId);
            reject(new Error('No se encontró el menú en caché'));
          }
        };
        
        request.onerror = function(event) {
          console.error('❌ Error al recuperar menú de caché:', event.target.error);
          reject(event.target.error);
        };
        
        tx.oncomplete = function() {
          db.close();
        };
      });
    });
  }
  
  // Exponer funciones para uso global en la aplicación
  window.WebSAPCache = {
    initDB,
    saveMenuToCache,
    getMenuFromCache
  };
  
  // Inicializar la base de datos al cargar la página
  initDB().catch(err => {
    console.error('❌ Error durante la inicialización de IndexedDB:', err);
  });
  
  // Intentar precargar el menú principal
  const menuId = '8idq9bgbdwr7srcw';
  
  // Si estamos en la página del menú compartido, intentar obtenerlo y guardarlo en caché
  if (window.location.pathname.includes('/menu/')) {
    const pathParts = window.location.pathname.split('/');
    const currentMenuId = pathParts[pathParts.length - 1];
    
    if (currentMenuId && currentMenuId.length > 5) {
      // Intentar cargar el menú desde la API
      fetch(\`/api/shared-menu/\${currentMenuId}\`)
        .then(response => response.json())
        .then(data => {
          console.log('✅ Menú cargado desde API, guardando en caché');
          return saveMenuToCache(data);
        })
        .catch(err => {
          console.error('❌ Error al cargar menú desde API:', err);
        });
    }
  }
})();
</script>
`;

try {
  // Leer el archivo index.html
  let htmlContent = fs.readFileSync(indexPath, 'utf8');
  
  // Verificar si el script ya está inyectado
  if (htmlContent.includes('Inicializando IndexedDB para WebSAP')) {
    console.log('⚠️ El script de IndexedDB ya está inyectado');
    process.exit(0);
  }
  
  // Insertar el script antes de cerrar el head
  const headCloseTag = '</head>';
  const headPosition = htmlContent.indexOf(headCloseTag);
  
  if (headPosition === -1) {
    throw new Error('No se encontró la etiqueta </head> en el HTML');
  }
  
  // Insertar el script
  htmlContent = htmlContent.slice(0, headPosition) + indexedDBScript + htmlContent.slice(headPosition);
  
  // Guardar el archivo modificado
  fs.writeFileSync(indexPath, htmlContent, 'utf8');
  console.log('✅ Script de IndexedDB inyectado correctamente');
  
} catch (error) {
  console.error('❌ Error al inyectar script de IndexedDB:', error);
  process.exit(1);
}