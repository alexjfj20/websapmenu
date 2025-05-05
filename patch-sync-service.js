/**
 * Script específico para parchear el servicio de sincronización y evitar 
 * solicitudes a localhost en producción
 */
const fs = require('fs');
const path = require('path');

console.log('🔄 Parcheando servicio de sincronización...');

// Buscar archivos JS en dist
const distDir = path.join(__dirname, 'dist');
const jsDir = path.join(distDir, 'js');

// Verificar si el directorio js existe
if (!fs.existsSync(jsDir)) {
  console.log('⚠️ Directorio /js no encontrado en dist');
  process.exit(0);
}

// Leer todos los archivos JS
const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));

if (jsFiles.length === 0) {
  console.log('⚠️ No se encontraron archivos JS');
  process.exit(0);
}

let syncServiceFound = false;

// Procesar cada archivo JS
for (const file of jsFiles) {
  const filePath = path.join(jsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Buscar patrones que indiquen que este archivo contiene syncService
  if (content.includes('Probando puertos alternativos') || 
      content.includes('No se encontró el servidor en ningún puerto común') ||
      content.includes('Puerto 8080 no disponible')) {
    
    console.log(`✅ Encontrado archivo con syncService: ${file}`);
    syncServiceFound = true;
    
    // Crear el parche
    let modifiedContent = content;
    
    // 1. Parche para desactivar pruebas de puertos en producción
    modifiedContent = modifiedContent.replace(
      /🔄 Probando puertos alternativos/g,
      `// Verificar si estamos en entorno de producción
      if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        console.log("✅ Detectado entorno de producción, omitiendo pruebas a localhost");
        return { success: false, message: "En entorno de producción, no se prueban puertos locales" };
      }
      console.log("🔄 Probando puertos alternativos")`
    );
    
    // 2. Parche para las solicitudes a localhost específicas
    modifiedContent = modifiedContent.replace(
      /(fetch|XMLHttpRequest)\s*\(\s*['"]http:\/\/localhost:(\d+)/g,
      `$1((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? 
          "http://localhost:$2" : 
          window.location.origin)`
    );
    
    // 3. Parche para las comprobaciones de conectividad
    modifiedContent = modifiedContent.replace(
      /❌ No se pudo establecer conexión con el servidor/g,
      `// En producción, simplemente asumir que no hay conexión local
      if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        console.log("ℹ️ En entorno de producción, trabajando en modo sin conexión");
        // Devolver estado desconectado
        return { connected: false, online: true, message: "Modo mantenimiento" };
      }
      console.log("❌ No se pudo establecer conexión con el servidor")`
    );
    
    // 4. Inyectar código para detectar producción
    const envDetectionCode = `
    // Detección de entorno
    const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
    const baseApiUrl = isProduction ? window.location.origin : "http://localhost:3000";
    console.log("🌐 Entorno detectado:", isProduction ? "Producción" : "Desarrollo");
    console.log("🔗 API Base URL:", baseApiUrl);
    `;
    
    // Encontrar un buen lugar para insertar este código
    if (modifiedContent.includes('function Le(') || modifiedContent.includes('const Le=')) {
      modifiedContent = modifiedContent.replace(
        /(function Le\(|const Le\s*=)/,
        `${envDetectionCode}\n$1`
      );
    }
    
    // Guardar el archivo modificado si se realizaron cambios
    if (content !== modifiedContent) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Archivo ${file} parcheado correctamente`);
    } else {
      console.log(`⚠️ No se pudieron aplicar parches a ${file}`);
    }
  }
}

if (!syncServiceFound) {
  console.log('⚠️ No se encontró ningún archivo con syncService');
}

console.log('✅ Proceso de parcheo de syncService completado');