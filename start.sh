#!/bin/bash
# Script para instalar dependencias y luego iniciar el servidor

echo "===== Preparando entorno ====="

# Verificar si estamos en Render
if [ "$RENDER" = "true" ]; then
  echo "Ejecutando en entorno Render"
else
  echo "Ejecutando en entorno local"
fi

# Verificar si existe la carpeta dist
if [ ! -d "dist" ]; then
  echo "La carpeta dist no existe. Creando una página de mantenimiento..."
  mkdir -p dist
  echo "<html><body><h1>WebSAP</h1><p>En mantenimiento</p></body></html>" > dist/index.html
fi

echo "===== Instalando dependencias necesarias ====="
npm install express dotenv cors

echo "===== Iniciando servidor ====="
node server.js