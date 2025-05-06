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

echo "===== Corrigiendo problemas críticos de importación ====="
# Ejecutar primero esta corrección para evitar errores en el servidor
node fix-server-imports.js || echo "⚠️ Error al corregir importaciones, continuando..."

echo "===== Iniciando servidor ====="

# Forzar una reconstrucción completa del menú desde cero
echo "===== FORZANDO RECONSTRUCCIÓN COMPLETA DEL MENÚ ====="
node force-menu-rebuild.js || echo "⚠️ Error durante la reconstrucción forzada, intentando método alternativo..."

# Si falló la reconstrucción forzada, intentar con el método de limpieza estándar
if [ $? -ne 0 ]; then
  echo "===== Limpiando platos eliminados del menú (método alternativo) ====="
  node clean-deleted-menu-items.js || echo "⚠️ Error al limpiar platos eliminados, continuando..."
fi

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

# Corregir errores específicos del dashboard
echo "===== Corrigiendo errores del dashboard ====="
node fix-dashboard-errors.js || echo "⚠️ Error al corregir errores del dashboard, continuando..."

# Asegurarse de que el directorio para el archivo de activación de regeneración existe
mkdir -p dist

# Verificar si estamos en Render, y usar el enfoque adecuado
if [ "$RENDER" = "true" ]; then
  echo "===== EJECUTANDO SERVIDOR PARA RENDER ====="
  
  # Enfoque prioritario: server-worker.js (más simple y rápido)
  if [ -f "server-worker.js" ]; then
    echo "✅ Iniciando servidor worker (máxima prioridad)"
    exec node server-worker.js
  
  # Segundo enfoque: port-binder.js
  elif [ -f "port-binder.js" ]; then
    echo "✅ Iniciando vinculador de puerto explícito"
    exec node port-binder.js
  
  # Tercer enfoque: servidor optimizado para Render
  elif [ -f "server-render.js" ]; then
    echo "✅ Usando versión especial para Render"
    exec node server-render.js
  
  # Cuarto enfoque: servidor minimalista
  elif [ -f "server-minimal.js" ]; then
    echo "✅ Usando servidor minimalista"
    exec node server-minimal.js
  
  # Último recurso: servidor estándar
  else
    echo "⚠️ No se encontraron servidores especiales, usando server.js normal"
    exec node server.js
  fi
else
  # Iniciar el servidor con reinicio automático en caso de error (entorno no-Render)
  node server.js || {
    echo "❌ Error en el servidor. Intentando solución de emergencia..."
    
    # Si existe el script de cambio a servidor minimal, ejecutarlo
    if [ -f "switch-to-minimal-server.js" ]; then
      echo "🚨 ACTIVANDO SERVIDOR DE EMERGENCIA 🚨"
      node switch-to-minimal-server.js
      
      echo "⏳ Iniciando servidor minimal en 3 segundos..."
      sleep 3
      node server.js
    else
      echo "⏳ Reiniciando servidor original en 5 segundos..."
      sleep 5
      node server.js
    fi
  }
fi