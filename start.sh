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

# Asegurarse de que se crean las páginas específicas de menú
echo "Verificando páginas de menú compartido..."
if [ ! -d "dist/menu" ] || [ ! -d "dist/menu/8idq9bgbdwr7srcw" ]; then
  echo "Creando páginas para menús compartidos..."
  node generate-menu-pages.js || echo "⚠️ Error al crear páginas de menú, continuando..."
elif [ ! -f "dist/menu/8idq9bgbdwr7srcw/index.html" ]; then
  echo "Archivo index.html no encontrado para el menú principal, regenerando..."
  node generate-menu-pages.js || echo "⚠️ Error al crear páginas de menú, continuando..."
else
  echo "✅ Las páginas de menú existen"
fi

# Iniciar el servidor con reinicio automático en caso de error
node server.js || {
  echo "❌ Error en el servidor. Reiniciando en 5 segundos..."
  sleep 5
  node server.js
}