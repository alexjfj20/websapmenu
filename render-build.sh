#!/bin/bash
# Script personalizado para construir la aplicación en Render.com

echo "Iniciando proceso de construcción para Render.com..."

# Instalar todas las dependencias, incluyendo las de desarrollo
npm install

# Verificar si vue-cli-service está instalado
if ! [ -x "$(command -v ./node_modules/.bin/vue-cli-service)" ]; then
  echo "Error: vue-cli-service no está instalado. Instalando..."
  npm install @vue/cli-service
fi

# Construir la aplicación
echo "Construyendo la aplicación Vue..."
npm run build

# Verificar si la construcción fue exitosa
if [ -d "dist" ]; then
  echo "✅ Construcción exitosa. Directorio 'dist' creado."
else
  echo "❌ Error en la construcción. El directorio 'dist' no se creó."
  exit 1
fi

echo "Proceso de construcción completado."