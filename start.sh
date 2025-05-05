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

# Asegurarse de que se crea la página específica de menú en caso de que no se haya creado
if [ ! -d "dist/menu/8idq9bgbdwr7srcw" ]; then
  echo "Creando página específica para menú compartido..."
  node create-menu-page.js || echo "⚠️ Error al crear página de menú, continuando..."
fi

# Iniciar el servidor con reinicio automático en caso de error
node server.js || {
  echo "❌ Error en el servidor. Reiniciando en 5 segundos..."
  sleep 5
  node server.js
}