#!/usr/bin/env bash
# Script personalizado para construir la aplicación en Render.com

echo "Iniciando proceso de construcción para Render.com..."

# Instalar explícitamente vue-cli-service y plugins
echo "Instalando dependencias de Vue CLI..."
npm install @vue/cli-service @vue/cli-plugin-babel @vue/cli-plugin-eslint --no-save

# Verificar la instalación
echo "Verificando instalación de Vue CLI..."
if [ -f "./node_modules/.bin/vue-cli-service" ]; then
  echo "✅ Vue CLI service encontrado."
else
  echo "❌ Vue CLI service no encontrado. Instalando directamente..."
  npm install -g @vue/cli-service
fi

# Intentar construir la aplicación
echo "Construyendo la aplicación Vue..."
./node_modules/.bin/vue-cli-service build || npx vue-cli-service build

# Verificar si la construcción fue exitosa
if [ -d "dist" ]; then
  echo "✅ Construcción exitosa. Directorio 'dist' creado."
else
  echo "❌ Error en la construcción. El directorio 'dist' no se creó."
  exit 1
fi

echo "Proceso de construcción completado."