/**
 * Script para regenerar automáticamente las páginas de menú 
 * cuando se detectan cambios en los datos
 * 
 * VERSIÓN MEJORADA: Actualización inmediata y forzada para reflejar cambios en tiempo real
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Iniciando servicio de actualización automática de menús (versión mejorada)...');

// Configuración
const config = {
  // Archivo que indica cuándo se debe actualizar el menú
  triggerFile: path.join(__dirname, 'dist', 'refresh-needed.txt'),
  // Archivo para forzar actualización inmediata
  forceRefreshFile: path.join(__dirname, 'dist', 'force-refresh-now.txt'),
  // Intervalo de verificación (en milisegundos)
  checkInterval: 5000, // 5 segundos (más frecuente)
  // ID del menú principal
  mainMenuId: '8idq9bgbdwr7srcw',
  // Tiempo mínimo entre actualizaciones normales (en milisegundos)
  minTimeBetweenUpdates: 60000 // 1 minuto (más frecuente)
};

// Variables de control
let lastUpdateTime = 0;
let isUpdating = false;

/**
 * Regenera las páginas del menú
 */
async function regenerateMenus() {
  if (isUpdating) {
    console.log('⏳ Ya hay una actualización en curso, omitiendo...');
    return;
  }
  
  const now = Date.now();
  
  // Verificar si ha pasado suficiente tiempo desde la última actualización
  if (now - lastUpdateTime < config.minTimeBetweenUpdates) {
    console.log('⏳ Actualización reciente, esperando el tiempo mínimo...');
    return;
  }
  
  isUpdating = true;
  console.log('🔄 Regenerando páginas de menú...');
  
  try {
    // Ejecutar scripts de generación de menú
    execSync('node static-menu-page.js', { stdio: 'inherit' });
    execSync('node generate-menu-pages.js', { stdio: 'inherit' });
    
    // Aplicar parches
    execSync('node fix-business-info-error.js', { stdio: 'inherit' });
    execSync('node fix-menu-cache.js', { stdio: 'inherit' });
    
    console.log('✅ Regeneración de menús completada');
    
    // Eliminar el archivo de activación
    if (fs.existsSync(config.triggerFile)) {
      fs.unlinkSync(config.triggerFile);
      console.log('🗑️ Archivo de activación eliminado');
    }
    
    lastUpdateTime = Date.now();
  } catch (error) {
    console.error('❌ Error al regenerar menús:', error);
  } finally {
    isUpdating = false;
  }
}

/**
 * Verifica si es necesario regenerar los menús
 */
function checkIfUpdateNeeded() {
  // Primero verificar si hay una solicitud de actualización forzada
  if (fs.existsSync(config.forceRefreshFile)) {
    try {
      console.log('⚡ Solicitud de actualización forzada detectada');
      
      // Eliminar el archivo primero para evitar bucles
      fs.unlinkSync(config.forceRefreshFile);
      
      // Ejecutar regeneración inmediata, sin respetar tiempos mínimos
      forceRegenerateMenus();
      
      return; // No continuar con verificaciones normales
    } catch (error) {
      console.error('❌ Error al procesar actualización forzada:', error);
    }
  }
  
  // Verificar solicitudes normales
  if (fs.existsSync(config.triggerFile)) {
    try {
      // Leer el contenido para ver cuándo se solicitó la actualización
      const content = fs.readFileSync(config.triggerFile, 'utf8');
      const requestTime = parseInt(content.trim()) || 0;
      const now = Date.now();
      
      console.log(`🔎 Archivo de activación encontrado (${new Date(requestTime).toLocaleTimeString()})`);
      
      // Si el archivo es reciente, regenerar los menús
      if (now - requestTime < 3600000) { // Menos de 1 hora
        regenerateMenus();
      } else {
        console.log('⏳ Solicitud de actualización antigua, ignorando');
        fs.unlinkSync(config.triggerFile);
      }
    } catch (error) {
      console.error('❌ Error al procesar archivo de activación:', error);
    }
  }
  
  // También verificar si hace mucho tiempo que no se actualiza el menú
  try {
    const menuPath = path.join(__dirname, 'dist', 'menu', config.mainMenuId, 'index.html');
    if (fs.existsSync(menuPath)) {
      const stats = fs.statSync(menuPath);
      const fileAge = Date.now() - stats.mtimeMs;
      
      // Si el archivo tiene más de 24 horas, actualizarlo
      if (fileAge > 24 * 60 * 60 * 1000) {
        console.log('⚠️ Menú principal no actualizado en más de 24 horas, forzando actualización');
        regenerateMenus();
      }
    }
  } catch (error) {
    console.error('❌ Error al verificar antigüedad del menú:', error);
  }
}

/**
 * Fuerza la regeneración inmediata sin respetar tiempos mínimos
 */
async function forceRegenerateMenus() {
  console.log('⚡ REGENERACIÓN FORZADA: Actualizando páginas de menú inmediatamente...');
  
  try {
    // Eliminar páginas existentes para forzar regeneración completa
    const menuDir = path.join(__dirname, 'dist', 'menu', config.mainMenuId);
    if (fs.existsSync(menuDir)) {
      console.log('🗑️ Eliminando versiones anteriores del menú');
      
      // Eliminar solo los archivos HTML, no el directorio completo
      const files = fs.readdirSync(menuDir).filter(file => file.endsWith('.html'));
      files.forEach(file => {
        fs.unlinkSync(path.join(menuDir, file));
      });
    }
    
    // Actualizar la caché en disco
    const cacheFile = path.join(__dirname, 'dist', 'cache', `menu-${config.mainMenuId}.json`);
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
      console.log('🗑️ Caché de menú eliminada');
    }
    
    // Ejecutar scripts de regeneración
    console.log('🔄 Generando nuevas versiones...');
    execSync('node static-menu-page.js', { stdio: 'inherit' });
    execSync('node generate-menu-pages.js', { stdio: 'inherit' });
    
    // Aplicar parches críticos
    execSync('node fix-business-info-error.js', { stdio: 'inherit' });
    execSync('node fix-menu-cache.js', { stdio: 'inherit' });
    
    console.log('✅ Regeneración forzada completada con éxito');
    
    // Registrar marca de tiempo de la última actualización
    lastUpdateTime = Date.now();
  } catch (error) {
    console.error('❌ Error en regeneración forzada:', error);
  }
}

// Iniciar el servicio de verificación periódica (más frecuente)
setInterval(checkIfUpdateNeeded, config.checkInterval);
console.log(`✅ Servicio de actualización automática iniciado (verificando cada ${config.checkInterval/1000} segundos)`);

// Verificar inmediatamente al inicio
checkIfUpdateNeeded();

// Exportar funciones para uso desde otros módulos
module.exports = {
  regenerateMenus,
  forceRegenerateMenus,
  triggerRefresh: () => {
    const timestamp = Date.now();
    fs.writeFileSync(config.triggerFile, timestamp.toString(), 'utf8');
    console.log(`✅ Actualización de menús programada para el próximo ciclo (${new Date().toLocaleTimeString()})`);
    return true;
  },
  triggerForceRefresh: () => {
    const timestamp = Date.now();
    fs.writeFileSync(config.forceRefreshFile, timestamp.toString(), 'utf8');
    console.log(`⚡ Actualización FORZADA de menús programada INMEDIATAMENTE (${new Date().toLocaleTimeString()})`);
    return true;
  }
};