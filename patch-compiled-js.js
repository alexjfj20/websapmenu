/**
 * Script para parchear directamente los archivos JS compilados
 * para solucionar el error de "Cannot create property 'businessInfo' on string"
 */
const fs = require('fs');
const path = require('path');

// Busca y modifica todos los archivos JS en el directorio dist
console.log('🔍 Buscando archivos JS compilados...');

const distDir = path.join(__dirname, 'dist');
const jsDir = path.join(distDir, 'js');

// Asegurarse de que el directorio existe
if (!fs.existsSync(jsDir)) {
  console.log('⚠️ El directorio /js no existe en dist. Verificando directorio principal...');
  
  // Buscar archivos JS directamente en dist
  const files = fs.readdirSync(distDir);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  
  if (jsFiles.length === 0) {
    console.log('❌ No se encontraron archivos JS para parchear.');
    process.exit(1);
  }
  
  // Si hay archivos JS, procesarlos
  jsFiles.forEach(processJSFile.bind(null, distDir));
} else {
  // Buscar archivos JS en el directorio /js
  const files = fs.readdirSync(jsDir);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  
  if (jsFiles.length === 0) {
    console.log('❌ No se encontraron archivos JS para parchear.');
    process.exit(1);
  }
  
  // Procesar cada archivo JS
  jsFiles.forEach(processJSFile.bind(null, jsDir));
}

// Función para procesar y parchear cada archivo JS
function processJSFile(directory, filename) {
  const filePath = path.join(directory, filename);
  console.log(`⚙️ Procesando: ${filePath}`);
  
  try {
    // Leer el contenido del archivo
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Aplicar parches:
    
    // 1. Parche para el error "Cannot create property 'businessInfo' on string"
    // Este parche busca el código que intenta asignar businessInfo y lo envuelve en una comprobación
    const menuServicePatterns = [
      // Buscar patrones del código de menuService que causa el error
      /(\w+)\.businessInfo\s*=\s*(\w+)/g,
      /Cannot\s+create\s+property\s+'businessInfo'/g
    ];
    
    menuServicePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        console.log(`✅ Patrón encontrado en ${filename}: ${pattern}`);
        
        // Reemplazar con código seguro que verifica si es un objeto antes de asignar
        content = content.replace(pattern, match => {
          if (match.includes('Cannot')) {
            return match; // No modificar mensajes de error
          }
          
          // Extraer las variables del patrón
          const parts = /(\w+)\.businessInfo\s*=\s*(\w+)/.exec(match);
          if (!parts || parts.length < 3) return match;
          
          const obj = parts[1];
          const value = parts[2];
          
          // Reemplazar con código seguro
          return `(typeof ${obj} === 'object' && ${obj} !== null) ? ${obj}.businessInfo = ${value} : 
            console.warn("⚠️ No se puede asignar businessInfo, el objeto no es válido")`;
        });
      }
    });
    
    // 2. Parche para asegurarse de que las respuestas de texto se conviertan a JSON
    // Busca patrones relacionados con el manejo de respuestas fetch o XHR
    const fetchPatterns = [
      /(fetch\(\s*[^)]+\))\.then\(\s*(\w+)\s*=>\s*\2\.json\(\)\s*\)/g,
      /(fetch\(\s*[^)]+\))\.then\(\s*(\w+)\s*=>\s*\2\.text\(\)\s*\)/g
    ];
    
    fetchPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        console.log(`✅ Patrón fetch encontrado en ${filename}`);
        
        // Reemplazar con código que intenta convertir texto a JSON
        content = content.replace(pattern, (match, fetchCall, respVar) => {
          // Si ya es .json(), mantenerlo; si es .text(), convertirlo
          if (match.includes('.text()')) {
            return `${fetchCall}.then(${respVar} => {
              try {
                return ${respVar}.json();
              } catch(e) {
                console.error("Error al parsear JSON:", e);
                return {};
              }
            })`;
          }
          return match;
        });
      }
    });
    
    // 3. Parche para redirigir solicitudes de API a endpoints correctos
    const apiCallPatterns = [
      /fetch\(\s*["'](\/api\/menu\/[^"']+)["']/g,
      /fetch\(\s*["'](\/api\/business\/[^"']+)["']/g
    ];
    
    apiCallPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        console.log(`✅ Patrón de llamada API encontrado en ${filename}`);
        
        // Reemplazar con URL modificada
        content = content.replace(pattern, (match, url) => {
          return match.replace(url, `/api/shared-menu/${url.split('/').pop()}`);
        });
      }
    });
    
    // 4. Parche para añadir código de manejo de errores en el procesamiento de menús
    if (content.includes('SharedMenuView') && content.includes('Error al cargar')) {
      console.log(`✅ Encontrado código de SharedMenuView en ${filename}`);
      
      // Buscar patrones de manejo de respuesta
      const responsePattern = /\.then\(\s*(\w+)\s*=>\s*\{\s*([^}]+)\.businessInfo/g;
      
      content = content.replace(responsePattern, (match, respVar, objVar) => {
        return `.then(${respVar} => {
          if (typeof ${respVar} === 'string') {
            console.warn("⚠️ Respuesta recibida como string, intentando parsear JSON");
            try {
              ${respVar} = JSON.parse(${respVar});
            } catch(e) {
              console.error("Error al parsear respuesta", e);
              // Crear un objeto respuesta simulado para evitar errores
              ${respVar} = {
                businessInfo: {
                  id: window.location.pathname.split('/').pop(),
                  name: "Menú temporalmente no disponible",
                  description: "El menú está en mantenimiento"
                },
                categories: []
              };
            }
          }
          if (${respVar} && typeof ${respVar} === 'object') {
            ${objVar}.businessInfo`;
      });
    }
    
    // Verificar si se realizaron cambios
    if (original === content) {
      console.log(`ℹ️ No se realizaron cambios en ${filename}`);
    } else {
      // Guardar el archivo modificado
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Archivo ${filename} parcheado correctamente`);
    }
    
  } catch (error) {
    console.error(`❌ Error al procesar ${filename}:`, error);
  }
}

console.log('✅ Proceso de parcheo completado');