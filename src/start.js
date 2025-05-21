// start.js en la raíz del proyecto
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== INICIANDO APLICACIÓN ===');

// Verificar estructura básica
const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const backendDir = path.join(rootDir, 'backend');

// Si no existe dist, intentar un build rápido
if (!fs.existsSync(distDir)) {
  console.log('Carpeta dist no encontrada, intentando build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error al realizar build:', error.message);
  }
}

// Iniciar servidor
console.log('Iniciando servidor...');
try {
  require('./backend/server.js');
} catch (error) {
  console.error('Error crítico al iniciar servidor:', error.message);
  process.exit(1);
}