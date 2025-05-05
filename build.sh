#!/usr/bin/env bash
# Script para construir la aplicación en Render.com

echo "Iniciando script de construcción para Render..."

# Instalar dependencias
echo "Instalando dependencias..."
npm install

# Instalar Vue CLI globalmente
echo "Instalando Vue CLI globalmente..."
npm install -g @vue/cli @vue/cli-service

# Verificar la instalación
echo "Verificando instalación de Vue CLI..."
which vue-cli-service
which vue

# Construir aplicación
echo "Construyendo la aplicación..."
export NODE_OPTIONS=--openssl-legacy-provider
npx vue-cli-service build

# Verificar resultado
echo "Verificando resultado de la construcción..."
if [ -d "dist" ]; then
  echo "✅ Construcción exitosa. Directorio dist creado."
else
  echo "❌ Error en la construcción. El directorio dist no se creó."
  exit 1
fi