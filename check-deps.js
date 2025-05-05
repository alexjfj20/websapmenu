#!/usr/bin/env node
// Script para verificar dependencias

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Lista de dependencias críticas para verificar
const criticalDeps = [
  'vue-router',
  'file-saver',
  'xlsx',
  'jspdf',
  'jspdf-autotable',
  'vue-chartjs',
  'chart.js',
  'axios',
  'eslint-plugin-vue'
];

console.log('Verificando dependencias críticas...');

// Función para verificar si un módulo está disponible
function checkModule(moduleName) {
  try {
    require.resolve(moduleName);
    console.log(`✅ ${moduleName} está correctamente instalado`);
    return true;
  } catch (e) {
    console.log(`❌ ${moduleName} no está disponible. Instalando...`);
    try {
      execSync(`npm install --save ${moduleName}`, { stdio: 'inherit' });
      console.log(`✅ ${moduleName} ha sido instalado`);
      return true;
    } catch (installError) {
      console.error(`❌ Error al instalar ${moduleName}:`, installError.message);
      return false;
    }
  }
}

// Verificar cada dependencia
let allDepsOk = true;
criticalDeps.forEach(dep => {
  if (!checkModule(dep)) {
    allDepsOk = false;
  }
});

// Verificar la estructura de directorios src
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  console.log(`✅ Directorio src existe`);
} else {
  console.error(`❌ Directorio src no encontrado`);
  allDepsOk = false;
}

// Verificar si hay un archivo main.js en src
const mainJs = path.join(srcDir, 'main.js');
if (fs.existsSync(mainJs)) {
  console.log(`✅ Archivo main.js encontrado`);
} else {
  console.error(`❌ Archivo main.js no encontrado en src`);
  allDepsOk = false;
}

// Salir con código de error si alguna verificación falló
process.exit(allDepsOk ? 0 : 1);