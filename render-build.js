// Script especial para compilar en Render.com
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Iniciando proceso de construcción para Render.com...');

// Verificar dependencias instaladas
try {
  console.log('Instalando dependencias de Vue CLI...');
  execSync('npm install --save @vue/cli-service @vue/cli-plugin-babel @vue/cli-plugin-eslint', { stdio: 'inherit' });
  
  // Verificar si existe el ejecutable vue-cli-service
  const vueBinPath = path.join(__dirname, 'node_modules', '.bin', 'vue-cli-service');
  
  if (fs.existsSync(vueBinPath)) {
    console.log(`✅ Vue CLI service encontrado en: ${vueBinPath}`);
  } else {
    console.log('⚠️ No se encontró vue-cli-service en node_modules/.bin, intentando instalación global...');
    execSync('npm install -g @vue/cli-service', { stdio: 'inherit' });
  }
  
  // Intentar construir usando el binario directamente
  console.log('Construyendo la aplicación Vue...');
  try {
    execSync('node ./node_modules/.bin/vue-cli-service build', { stdio: 'inherit' });
  } catch (e) {
    console.log('Primer intento fallido, intentando con npx...');
    execSync('npx vue-cli-service build', { stdio: 'inherit' });
  }
  
  // Verificar que la carpeta dist se creó
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('✅ Construcción exitosa. Carpeta dist creada.');
  } else {
    console.error('❌ Error: La carpeta dist no fue creada.');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Error durante la construcción:', error.message);
  process.exit(1);
}