// backend/checkSetup.js
const fs = require('fs');
const path = require('path');

console.log('=== DIAGNÓSTICO DE CONFIGURACIÓN ===');

// Verifica la estructura de directorios
console.log('\n1. Verificando estructura de directorios:');
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const backendDir = path.join(rootDir, 'backend');

console.log(`Root: ${rootDir} - ${fs.existsSync(rootDir) ? 'EXISTE' : 'NO EXISTE'}`);
console.log(`Dist: ${distDir} - ${fs.existsSync(distDir) ? 'EXISTE' : 'NO EXISTE'}`);
console.log(`Backend: ${backendDir} - ${fs.existsSync(backendDir) ? 'EXISTE' : 'NO EXISTE'}`);

// Verifica archivos clave
console.log('\n2. Verificando archivos clave:');
const indexHtml = path.join(distDir, 'index.html');
const serverJs = path.join(backendDir, 'server.js');
const packageJson = path.join(rootDir, 'package.json');

console.log(`index.html: ${indexHtml} - ${fs.existsSync(indexHtml) ? 'EXISTE' : 'NO EXISTE'}`);
console.log(`server.js: ${serverJs} - ${fs.existsSync(serverJs) ? 'EXISTE' : 'NO EXISTE'}`);
console.log(`package.json: ${packageJson} - ${fs.existsSync(packageJson) ? 'EXISTE' : 'NO EXISTE'}`);

// Verifica contenido de package.json
console.log('\n3. Verificando configuración en package.json:');
if (fs.existsSync(packageJson)) {
  const packageData = require(packageJson);
  console.log(`- Nombre: ${packageData.name}`);
  console.log(`- Scripts de inicio: ${packageData.scripts?.start || 'No definido'}`);
  console.log(`- Punto de entrada: ${packageData.main || 'No definido'}`);
}

// Verificar rutas API
console.log('\n4. Verificando rutas API:');
try {
  const adminRoutes = require('./routes/adminRoutes');
  console.log('- adminRoutes cargado correctamente');
  
  // Verificar si adminRoutes tiene la ruta dashboard
  const hasAdminRoutes = Object.keys(adminRoutes.stack || {}).length > 0;
  console.log(`- adminRoutes tiene ${hasAdminRoutes ? '' : 'NO '}rutas definidas`);
} catch (error) {
  console.log(`- Error al cargar adminRoutes: ${error.message}`);
}

// Generar archivo de diagnóstico
const diagFile = path.join(rootDir, 'diagnostico.txt');
const diagData = `
DIAGNÓSTICO DE CONFIGURACIÓN (${new Date().toISOString()})
==================================================

1. ESTRUCTURA DE DIRECTORIOS:
   Root: ${rootDir} - ${fs.existsSync(rootDir) ? 'EXISTE' : 'NO EXISTE'}
   Dist: ${distDir} - ${fs.existsSync(distDir) ? 'EXISTE' : 'NO EXISTE'}
   Backend: ${backendDir} - ${fs.existsSync(backendDir) ? 'EXISTE' : 'NO EXISTE'}

2. ARCHIVOS CLAVE:
   index.html: ${fs.existsSync(indexHtml) ? 'EXISTE' : 'NO EXISTE'}
   server.js: ${fs.existsSync(serverJs) ? 'EXISTE' : 'NO EXISTE'}
   package.json: ${fs.existsSync(packageJson) ? 'EXISTE' : 'NO EXISTE'}

3. ANÁLISIS DE ARCHIVOS:
   - Contenido de package.json: ${fs.existsSync(packageJson) ? JSON.stringify(require(packageJson), null, 2) : 'NO DISPONIBLE'}
   - Punto de entrada: ${fs.existsSync(packageJson) ? require(packageJson).main || 'No definido' : 'NO DISPONIBLE'}
`;

fs.writeFileSync(diagFile, diagData);
console.log(`\nDiagnóstico guardado en: ${diagFile}`);

console.log('\n=== DIAGNÓSTICO FINALIZADO ===');