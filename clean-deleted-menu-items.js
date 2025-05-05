/**
 * Script para limpiar los platos eliminados del menú
 * Este script busca inconsistencias entre el menú de administración y el menú público
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Iniciando limpieza de platos eliminados del menú público...');

// ID del menú principal
const MENU_ID = '8idq9bgbdwr7srcw';

// Directorios importantes
const menuDir = path.join(__dirname, 'dist', 'menu', MENU_ID);
const cacheDir = path.join(__dirname, 'dist', 'cache');

// Verificar si hay archivos para regenerar
let needsRegeneration = false;

// Eliminar todos los archivos HTML del menú
if (fs.existsSync(menuDir)) {
  try {
    const files = fs.readdirSync(menuDir).filter(file => file.endsWith('.html'));
    if (files.length > 0) {
      console.log(`🗑️ Eliminando ${files.length} archivos HTML para forzar regeneración`);
      files.forEach(file => fs.unlinkSync(path.join(menuDir, file)));
      needsRegeneration = true;
    }
  } catch (error) {
    console.error('❌ Error al eliminar archivos HTML:', error);
  }
} else {
  console.log('⚠️ Directorio del menú no encontrado, será creado al regenerar');
  needsRegeneration = true;
}

// Eliminar archivos de caché JSON
if (fs.existsSync(cacheDir)) {
  try {
    const files = fs.readdirSync(cacheDir).filter(file => file.includes(`menu-${MENU_ID}`));
    if (files.length > 0) {
      console.log(`🗑️ Eliminando ${files.length} archivos de caché JSON`);
      files.forEach(file => fs.unlinkSync(path.join(cacheDir, file)));
      needsRegeneration = true;
    }
  } catch (error) {
    console.error('❌ Error al eliminar archivos de caché:', error);
  }
} else {
  console.log('⚠️ Directorio de caché no encontrado');
}

// Regenerar los menús si es necesario
if (needsRegeneration) {
  console.log('🔄 Regenerando menús desde cero...');
  
  try {
    console.log('🔄 Generando página estática de menú principal...');
    execSync('node static-menu-page.js', { stdio: 'inherit' });
    
    console.log('🔄 Generando páginas adicionales...');
    execSync('node generate-menu-pages.js', { stdio: 'inherit' });
    
    console.log('✅ Regeneración completada con éxito');
    
    // Crear un marcador de tiempo para indicar cuándo fue la última limpieza
    const timestamp = new Date().toISOString();
    fs.writeFileSync(
      path.join(__dirname, 'dist', 'last-menu-cleanup.txt'), 
      `Última limpieza: ${timestamp}\n`, 
      'utf8'
    );
  } catch (error) {
    console.error('❌ Error al regenerar menús:', error);
  }
} else {
  console.log('✅ No se requiere regeneración, todo está actualizado');
}

console.log('✅ Proceso de limpieza completado');