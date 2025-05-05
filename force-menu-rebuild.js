/**
 * Script para forzar la regeneración completa del menú
 * Elimina todos los datos antiguos y regenera todo desde cero
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('⚡ INICIANDO RECONSTRUCCIÓN FORZADA DEL MENÚ ⚡');

// ID del menú principal
const MENU_ID = '8idq9bgbdwr7srcw';
const BASE_DIR = __dirname;
const DIST_DIR = path.join(BASE_DIR, 'dist');
const MENU_DIR = path.join(DIST_DIR, 'menu');
const SPECIFIC_MENU_DIR = path.join(MENU_DIR, MENU_ID);
const CACHE_DIR = path.join(DIST_DIR, 'cache');

console.log('🔍 Verificando directorios existentes...');
console.log(`- Base: ${BASE_DIR}`);
console.log(`- Dist: ${DIST_DIR}`);
console.log(`- Menú: ${MENU_DIR}`);
console.log(`- Menú específico: ${SPECIFIC_MENU_DIR}`);
console.log(`- Caché: ${CACHE_DIR}`);

// Función para eliminar un directorio y su contenido de forma recursiva
function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️ Directorio no encontrado: ${dirPath}`);
    return;
  }
  
  console.log(`🗑️ Eliminando directorio: ${dirPath}`);
  
  try {
    // Eliminar archivos dentro del directorio
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        removeDirectory(filePath); // Recursión para subdirectorios
      } else {
        fs.unlinkSync(filePath); // Eliminar archivo
        console.log(`  - Eliminado archivo: ${file}`);
      }
    }
    
    // Eliminar el directorio vacío
    fs.rmdirSync(dirPath);
    console.log(`✅ Directorio eliminado: ${path.basename(dirPath)}`);
  } catch (error) {
    console.error(`❌ Error al eliminar directorio ${dirPath}:`, error);
  }
}

// Eliminar directorios específicos
if (fs.existsSync(SPECIFIC_MENU_DIR)) {
  removeDirectory(SPECIFIC_MENU_DIR);
} else {
  console.log(`⚠️ Directorio de menú específico no existe: ${SPECIFIC_MENU_DIR}`);
}

// Eliminar cualquier archivo de caché relacionado con el menú
if (fs.existsSync(CACHE_DIR)) {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    const menuFiles = files.filter(file => file.includes('menu-'));
    if (menuFiles.length > 0) {
      console.log(`🗑️ Eliminando ${menuFiles.length} archivos de caché de menú...`);
      menuFiles.forEach(file => {
        fs.unlinkSync(path.join(CACHE_DIR, file));
        console.log(`  - Eliminado: ${file}`);
      });
    } else {
      console.log('ℹ️ No se encontraron archivos de caché de menú');
    }
  } catch (error) {
    console.error('❌ Error al limpiar caché:', error);
  }
}

// Asegurarnos de que existen los directorios necesarios
console.log('📁 Creando estructura de directorios limpia...');

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
  console.log(`✅ Creado directorio: dist`);
}

if (!fs.existsSync(MENU_DIR)) {
  fs.mkdirSync(MENU_DIR, { recursive: true });
  console.log(`✅ Creado directorio: menu`);
}

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  console.log(`✅ Creado directorio: cache`);
}

// Forzar la regeneración limpia del menú
console.log('🔄 Generando nuevos archivos de menú desde cero...');

try {
  // Ejecutar scripts de generación en orden
  console.log('\n📄 Generando página estática principal...');
  execSync('node static-menu-page.js', { stdio: 'inherit' });
  
  console.log('\n📄 Generando páginas adicionales...');
  execSync('node generate-menu-pages.js', { stdio: 'inherit' });
  
  // Verificar si se crearon los archivos correctamente
  if (fs.existsSync(path.join(SPECIFIC_MENU_DIR, 'index.html'))) {
    console.log('✅ Archivo index.html creado correctamente');
  } else {
    console.error('❌ No se pudo crear el archivo index.html');
  }
  
  // Aplicar todos los parches necesarios
  console.log('\n🧰 Aplicando parches críticos...');
  execSync('node fix-business-info-error.js', { stdio: 'inherit' });
  execSync('node fix-menu-cache.js', { stdio: 'inherit' });
  execSync('node fix-duplicate-definitions.js', { stdio: 'inherit' });
  
  // Registrar el momento de la reconstrucción
  const timestamp = new Date().toISOString();
  fs.writeFileSync(
    path.join(DIST_DIR, 'last-menu-rebuild.txt'),
    `Última reconstrucción completa: ${timestamp}\n`,
    'utf8'
  );
  
  console.log(`\n✅ RECONSTRUCCIÓN COMPLETA FINALIZADA: ${new Date().toLocaleString()}`);
} catch (error) {
  console.error('\n❌ ERROR DURANTE LA RECONSTRUCCIÓN:', error);
  process.exit(1);
}