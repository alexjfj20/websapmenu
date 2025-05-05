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

# Limpiar platos eliminados y forzar regeneración del menú
echo "===== Limpiando platos eliminados del menú ====="
node clean-deleted-menu-items.js || echo "⚠️ Error al limpiar platos eliminados, continuando..."

# Asegurarse de que se crean las páginas específicas de menú
echo "Verificando páginas de menú compartido..."
if [ ! -d "dist/menu" ] || [ ! -d "dist/menu/8idq9bgbdwr7srcw" ]; then
  echo "Creando página estática para menú principal..."
  node static-menu-page.js || echo "⚠️ Error al crear página de menú estática, continuando..."
  
  echo "Creando páginas adicionales para menús compartidos..."
  node generate-menu-pages.js || echo "⚠️ Error al crear páginas de menú, continuando..."
elif [ ! -f "dist/menu/8idq9bgbdwr7srcw/index.html" ]; then
  echo "Archivo index.html no encontrado para el menú principal, regenerando..."
  node static-menu-page.js || echo "⚠️ Error al crear página de menú estática, continuando..."
else
  echo "✅ Las páginas de menú existen"
fi

# Aplicar parche crítico para el error de businessInfo
echo "===== Aplicando parche para error crítico de businessInfo ====="
node fix-business-info-error.js || echo "⚠️ Error al aplicar parche de businessInfo, continuando..."

# Aplicar parche para problemas de caché
echo "===== Aplicando parche para problemas de caché ====="
node fix-menu-cache.js || echo "⚠️ Error al aplicar parche de caché, continuando..."

# Eliminar definiciones duplicadas en el código JS
echo "===== Eliminando definiciones duplicadas ====="
node fix-duplicate-definitions.js || echo "⚠️ Error al eliminar definiciones duplicadas, continuando..."

# Inicializar IndexedDB para caché
echo "===== Inicializando IndexedDB para caché ====="
node initialize-indexeddb.js || echo "⚠️ Error al inicializar IndexedDB, continuando..."

# Asegurarse de que el directorio para el archivo de activación de regeneración existe
mkdir -p dist

# Iniciar el servidor con reinicio automático en caso de error
node server.js || {
  echo "❌ Error en el servidor. Reiniciando en 5 segundos..."
  sleep 5
  node server.js
}