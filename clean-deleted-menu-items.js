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

// Eliminar COMPLETAMENTE el directorio del menú para forzar regeneración desde cero
if (fs.existsSync(menuDir)) {
  try {
    console.log(`🗑️ Eliminando directorio completo del menú: ${menuDir}`);
    // Eliminar todos los archivos dentro del directorio
    const files = fs.readdirSync(menuDir);
    files.forEach(file => {
      const filePath = path.join(menuDir, file);
      fs.unlinkSync(filePath);
      console.log(`  - Eliminado: ${file}`);
    });
    
    // Eliminar el directorio vacío
    fs.rmdirSync(menuDir);
    console.log('✅ Directorio de menú eliminado completamente');
    needsRegeneration = true;
  } catch (error) {
    console.error('❌ Error al eliminar directorio de menú:', error);
  }
} else {
  console.log('⚠️ Directorio del menú no encontrado, será creado al regenerar');
  needsRegeneration = true;
}

// Eliminar COMPLETAMENTE el directorio de caché para forzar regeneración desde cero
if (fs.existsSync(cacheDir)) {
  try {
    console.log(`🧹 Limpiando directorio de caché: ${cacheDir}`);
    // Eliminar todos los archivos dentro del directorio
    const files = fs.readdirSync(cacheDir);
    files.forEach(file => {
      const filePath = path.join(cacheDir, file);
      fs.unlinkSync(filePath);
      console.log(`  - Eliminado: ${file}`);
    });
    console.log('✅ Directorio de caché limpiado completamente');
    needsRegeneration = true;
  } catch (error) {
    console.error('❌ Error al limpiar directorio de caché:', error);
  }
} else {
  console.log('⚠️ Directorio de caché no encontrado, será creado al regenerar');
  needsRegeneration = true;
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