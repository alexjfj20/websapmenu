/**
 * Script para inyectar el interceptor de API en el HTML generado
 */
const fs = require('fs');
const path = require('path');

// Cargar el interceptor
console.log('Cargando interceptor de API...');
const interceptorPath = path.join(__dirname, 'api-interceptor.js');
let interceptorCode = '';

try {
  interceptorCode = fs.readFileSync(interceptorPath, 'utf8');
  console.log('✅ Interceptor cargado correctamente');
} catch (error) {
  console.error('Error al cargar interceptor:', error);
  process.exit(1);
}

// Modificar el HTML generado para incluir el interceptor
console.log('Modificando HTML generado...');
const htmlPath = path.join(__dirname, 'dist', 'index.html');

try {
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Verificar si el HTML ya contiene el interceptor
  if (htmlContent.includes('Inicializando interceptor de API')) {
    console.log('⚠️ El HTML ya contiene el interceptor. No se realizará ninguna modificación.');
    process.exit(0);
  }
  
  // Buscar el final del <head> para insertar el interceptor
  const insertPosition = htmlContent.indexOf('</head>');
  
  if (insertPosition === -1) {
    throw new Error('No se pudo encontrar la etiqueta </head> en el HTML');
  }
  
  // Insertar el interceptor dentro de una etiqueta <script>
  const modifiedHtml = 
    htmlContent.substring(0, insertPosition) +
    `\n<!-- Interceptor de API para modo mantenimiento -->\n<script>\n${interceptorCode}\n</script>\n` +
    htmlContent.substring(insertPosition);
  
  // Guardar el HTML modificado
  fs.writeFileSync(htmlPath, modifiedHtml);
  console.log('✅ Interceptor inyectado correctamente en el HTML');
} catch (error) {
  console.error('Error al modificar HTML:', error);
  process.exit(1);
}