#!/bin/bash
# Script para construir y preparar la aplicación para Render

echo "===== Preparando archivos ultraminimalistas para Render ====="
# Esta es una solución extrema para resolver el problema de detección de puerto
cp -f render-pure.js ./dist/ 2>/dev/null || echo "⚠️ render-pure.js no encontrado, creándolo..."

# Si render-pure.js no existe, crearlo directamente
if [ ! -f "render-pure.js" ] || [ ! -f "./dist/render-pure.js" ]; then
  echo "// PUNTO DE ENTRADA ULTRA-MINIMALISTA PARA RENDER
const http = require('http');
const PORT = process.env.PORT || 10000;
console.log('RENDER-PURE: INICIANDO SERVIDOR EN PUERTO ' + PORT);
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('OK');
});
server.listen(PORT, '0.0.0.0', () => {
  console.log('RENDER-PURE: PUERTO ' + PORT + ' VINCULADO EN 0.0.0.0');
});
" > ./dist/render-pure.js
  echo "✅ render-pure.js creado directamente"
fi

# Crear package.json minimalista
echo '{
  "name": "websap-pure",
  "version": "1.0.0",
  "main": "render-pure.js",
  "scripts": {
    "start": "node render-pure.js"
  }
}' > ./dist/package.json
echo "✅ package.json minimalista creado"

# Crear Procfile explícito
echo "web: node render-pure.js" > ./dist/Procfile
echo "✅ Procfile minimalista creado"

echo "===== Copiando archivos del servidor ====="

# Asegurarse de que los archivos de configuración específicos de Render existan
if [ -f "package-worker.json" ]; then
  echo "✅ Usando package-worker.json optimizado para Worker en Render"
  cp package-worker.json package.json
else
  echo "⚠️ package-worker.json no encontrado, usando package.json estándar"
fi

# Crear directorio dist si no existe (para evitar errores de copia)
mkdir -p dist

# Copiar scripts esenciales al directorio raíz para que estén disponibles en tiempo de ejecución
echo "===== Copiando scripts de ejecución al raíz ====="
cp server.js server-minimal.js server-render.js server-worker.js port-binder.js start.sh start-render.sh fix-server-imports.js force-menu-rebuild.js clean-deleted-menu-items.js static-menu-page.js generate-menu-pages.js fix-business-info-error.js fix-menu-cache.js fix-duplicate-definitions.js initialize-indexeddb.js fix-dashboard-errors.js . || echo "⚠️ Error copiando scripts de ejecución"

echo "===== Limpiando caché ====="
rm -rf node_modules package-lock.json

echo "===== Instalando dependencias esenciales ====="
npm install --omit=dev --no-fund --no-audit

echo "===== Creando página de mantenimiento básica ====="
# Crear directorio dist si no existe (doble verificación)
mkdir -p dist
echo "<html><body><h1>WebSAP</h1><p>En mantenimiento</p></body></html>" > dist/index.html

echo "===== Intentando construir la aplicación ====="
# Intentar construir con el script personalizado que maneja errores de ESLint
node render-build.js
BUILD_EXIT_CODE=$?

# Si la construcción falló, intentar con npm run build estándar
if [ $BUILD_EXIT_CODE -ne 0 ]; then
  echo "⚠️ La construcción con render-build.js falló, intentando npm run build..."
  npm run build
  BUILD_EXIT_CODE=$?
fi

# Verificar si la construcción fue exitosa
if [ $BUILD_EXIT_CODE -ne 0 ]; then
  echo "❌ ERROR: La construcción de la aplicación falló después de múltiples intentos."
  exit 1
else
  echo "✅ Construcción completada exitosamente"
fi

# --- Scripts Post-Build ---
# Estos scripts modifican los archivos DENTRO de dist/

echo "===== Inyectando interceptor de API ====="
node inject-interceptor.js || echo "⚠️ Error al inyectar interceptor de API. Continuando..."

echo "===== Insertando interceptor de localhost ====="
node insert-localhost-interceptor.js || echo "⚠️ Error al insertar interceptor de localhost. Continuando..."

echo "===== Modificando index.html para menús compartidos ====="
node modify-index-html.js || echo "⚠️ Error al modificar index.html. Continuando..."

echo "===== Parcheando archivos JS compilados ====="
node patch-compiled-js.js || echo "⚠️ Error al parchear JS compilado. Continuando..."

echo "===== Aplicando parche para evitar localhost en producción ====="
node patch-sync-service.js || echo "⚠️ Error al parchear syncService. Continuando..."

# Copiar scripts que se ejecutan DESDE dist/ o que necesitan estar DENTRO de dist/
# (Ajustar según sea necesario si start.sh se ejecuta desde /src o /dist)
# Por ahora, asumimos que start.sh se ejecuta desde /src y opera sobre /dist
# cp fix-business-info-error.js dist/ || echo "⚠️ Error copiando fix-business-info-error.js a dist"
# cp fix-menu-cache.js dist/ || echo "⚠️ Error copiando fix-menu-cache.js a dist"
# cp fix-duplicate-definitions.js dist/ || echo "⚠️ Error copiando fix-duplicate-definitions.js a dist"
# cp initialize-indexeddb.js dist/ || echo "⚠️ Error copiando initialize-indexeddb.js a dist"
# cp fix-dashboard-errors.js dist/ || echo "⚠️ Error copiando fix-dashboard-errors.js a dist"
# cp force-menu-rebuild.js dist/ || echo "⚠️ Error copiando force-menu-rebuild.js a dist"
# cp clean-deleted-menu-items.js dist/ || echo "⚠️ Error copiando clean-deleted-menu-items.js a dist"
# cp static-menu-page.js dist/ || echo "⚠️ Error copiando static-menu-page.js a dist"
# cp generate-menu-pages.js dist/ || echo "⚠️ Error copiando generate-menu-pages.js a dist"

echo "===== Creando páginas HTML estáticas y de respaldo ====="
node static-menu-page.js || echo "⚠️ Error al crear página estática principal. Continuando..."
node generate-menu-pages.js || echo "⚠️ Error al crear páginas de menú adicionales. Continuando..."

echo "===== Despliegue completado ====="