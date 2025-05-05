/**
 * Script para regenerar automáticamente las páginas de menú 
 * cuando se detectan cambios en los datos
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Iniciando servicio de actualización automática de menús...');

// Configuración
const config = {
  // Archivo que indica cuándo se debe actualizar el menú
  triggerFile: path.join(__dirname, 'dist', 'refresh-needed.txt'),
  // Intervalo de verificación (en milisegundos)
  checkInterval: 30000, // 30 segundos
  // ID del menú principal
  mainMenuId: '8idq9bgbdwr7srcw',
  // Tiempo mínimo entre actualizaciones (en milisegundos)
  minTimeBetweenUpdates: 300000 // 5 minutos
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
  // Verificar si existe el archivo de activación
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
}

// Iniciar el servicio de verificación periódica
setInterval(checkIfUpdateNeeded, config.checkInterval);
console.log(`✅ Servicio de actualización automática iniciado (verificando cada ${config.checkInterval/1000} segundos)`);

// Verificar inmediatamente al inicio
checkIfUpdateNeeded();

// Exportar funciones para uso desde otros módulos
module.exports = {
  regenerateMenus,
  triggerRefresh: () => {
    const timestamp = Date.now();
    fs.writeFileSync(config.triggerFile, timestamp.toString(), 'utf8');
    console.log(`✅ Actualización de menús programada para el próximo ciclo (${new Date().toLocaleTimeString()})`);
    return true;
  }
};