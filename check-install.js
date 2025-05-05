// Script para verificar la instalación de dependencias
console.log('Verificando instalación de dependencias...');

try {
  // Verificar que vue-cli-service está instalado
  require.resolve('@vue/cli-service');
  console.log('✅ @vue/cli-service está instalado correctamente');
} catch (err) {
  console.error('❌ @vue/cli-service no está instalado. Ejecuta: npm install @vue/cli-service');
  console.error('Error:', err.message);
}

// Verificar otras dependencias críticas
const dependenciesToCheck = [
  'express',
  'dotenv',
  'knex',
  'pg'
];

dependenciesToCheck.forEach(dep => {
  try {
    require.resolve(dep);
    console.log(`✅ ${dep} está instalado correctamente`);
  } catch (err) {
    console.error(`❌ ${dep} no está instalado. Ejecuta: npm install ${dep}`);
  }
});

console.log('\nVerificación completa. Si hay errores, instala las dependencias faltantes.');
console.log('Para un despliegue exitoso en Render.com, asegúrate de que todas las dependencias estén en la sección "dependencies" de tu package.json.');