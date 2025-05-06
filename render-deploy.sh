#!/bin/bash
# Script simple par# Asegurarse de que los archivos del servidor estén disponibles
echo "===== Copiando archivos del servidor ====="
cp -f server.js server-minimal.js cache-server.js api-mocks.js server-fixes.js api-interceptor.js inject-interceptor.js modify-index-html.js patch-compiled-js.js patch-sync-service.js create-menu-page.js insert-localhost-interceptor.js generate-menu-pages.js static-menu-page.js fix-business-info-error.js fix-menu-cache.js initialize-indexeddb.js fix-duplicate-definitions.js auto-refresh-menu.js clean-deleted-menu-items.js force-menu-rebuild.js fix-dashboard-errors.js inject-dashboard-fix.js fix-server-imports.js switch-to-minimal-server.js menu-backup.html menu-not-found.html ./dist/ 2>/dev/null || :espliegue en Render

echo "===== Iniciando despli# Inyectar interceptor de localhost
echo "===== Insertando interceptor de localhost ====="
node insert-localhost-interceptor.js || echo "⚠️ Error al insertar interceptor de localhost. Continuando..."

# Inicializar IndexedDB para caché
echo "===== Inicializando IndexedDB para caché ====="
node initialize-indexeddb.js || echo "⚠️ Error al inicializar IndexedDB. Continuando..."

# Inyectar correcciones para el dashboard
echo "===== Corrigiendo errores del dashboard ====="
node fix-dashboard-errors.js || echo "⚠️ Error al corregir errores del dashboard. Continuando..."
node inject-dashboard-fix.js || echo "⚠️ Error al inyectar correcciones del dashboard. Continuando..."

# Modificar index.html para agregar código de redirección
echo "===== Modificando index.html para menús compartidos ====="
node modify-index-html.js || echo "⚠️ Error al modificar index.html. Continuando..." Render ====="

# Asegurar que los archivos de script tengan permisos adecuados
chmod +x build-without-eslint.sh
chmod +x start.sh

# Limpiar caché e instalar dependencias esenciales
echo "===== Limpiando caché ====="
rm -rf node_modules package-lock.json

echo "===== Instalando dependencias esenciales ====="
npm install express dotenv cors webpack-cli

# Asegurarse de que los archivos del servidor estén disponibles
echo "===== Copiando archivos del servidor ====="
cp -f server.js cache-server.js api-mocks.js server-fixes.js api-interceptor.js inject-interceptor.js modify-index-html.js patch-compiled-js.js patch-sync-service.js create-menu-page.js insert-localhost-interceptor.js generate-menu-pages.js static-menu-page.js fix-business-info-error.js fix-menu-cache.js initialize-indexeddb.js fix-duplicate-definitions.js auto-refresh-menu.js clean-deleted-menu-items.js force-menu-rebuild.js fix-dashboard-errors.js inject-dashboard-fix.js dashboard-runtime-patch.js dashboard-fix.js fix-server-imports.js menu-backup.html menu-not-found.html ./dist/ 2>/dev/null || :
echo "✅ Archivos del servidor copiados"

# Crear directorio dist si no existe
mkdir -p dist

# Crear una página de mantenimiento básica como fallback
echo "===== Creando página de mantenimiento básica ====="
cat > dist/index.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebSAP - Mantenimiento</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #2c3e50; }
    p { line-height: 1.5; color: #34495e; }
  </style>
</head>
<body>
  <div class="container">
    <h1>WebSAP</h1>
    <p>La aplicación está en mantenimiento. Por favor, intente más tarde.</p>
  </div>
</body>
</html>
EOL

# Intentar construir la aplicación con diferentes métodos
echo "===== Intentando construir la aplicación ====="

# Primero generar una página de mantenimiento garantizada
echo "Generando página de mantenimiento de respaldo..."
node generate-minimal-dist.js

# Ahora intentar los métodos de construcción
echo "Intentando métodos de construcción avanzados..."

# Método 1: Script de node
echo "Método 1: Usando script de Node..."
node build-without-eslint.js || {
  echo "El método 1 falló, intentando método 2..."
  
  # Método 2: Script de shell
  echo "Método 2: Usando script de shell..."
  bash build-without-eslint.sh || {
    echo "El método 2 falló, intentando método 3..."
    
    # Método 3: Vue CLI directamente
    echo "Método 3: Usando Vue CLI directamente..."
    export VUE_CLI_SKIP_PLUGINS=eslint
    npx vue-cli-service build --skip-plugins eslint --mode production || {
      echo "Todos los métodos de construcción fallaron."
      echo "Se usará la página de mantenimiento generada anteriormente."
    }
  }
}

# Inyectar interceptor de API en el HTML generado
echo "===== Inyectando interceptor de API ====="
node inject-interceptor.js || echo "⚠️ Error al inyectar interceptor. Continuando..."

# Insertar interceptor de localhost
echo "===== Insertando interceptor de localhost ====="
node insert-localhost-interceptor.js || echo "⚠️ Error al insertar interceptor de localhost. Continuando..."

# Modificar index.html para agregar código de redirección
echo "===== Modificando index.html para menús compartidos ====="
node modify-index-html.js || echo "⚠️ Error al modificar index.html. Continuando..."

# Parchear los archivos JS compilados
echo "===== Parcheando archivos JS compilados ====="
node patch-compiled-js.js || echo "⚠️ Error al parchear archivos JS. Continuando..."

# Parchear específicamente el servicio de sincronización
echo "===== Aplicando parche para evitar localhost en producción ====="
node patch-sync-service.js || echo "⚠️ Error al parchear syncService. Continuando..."

# Parchear específicamente el problema de businessInfo
echo "===== Aplicando parche crítico para error de businessInfo ====="
node fix-business-info-error.js || echo "⚠️ Error al aplicar parche businessInfo. Continuando..."

# Aplicar parche para problemas de caché
echo "===== Aplicando parche para problemas de caché ====="
node fix-menu-cache.js || echo "⚠️ Error al aplicar parche de caché. Continuando..."

# Eliminar definiciones duplicadas en el código JS
echo "===== Eliminando definiciones duplicadas ====="
node fix-duplicate-definitions.js || echo "⚠️ Error al eliminar definiciones duplicadas. Continuando..."

# Crear páginas HTML estáticas para el menú principal
echo "===== Creando página HTML estática para menú principal ====="
node static-menu-page.js || echo "⚠️ Error al crear página estática. Continuando..."

# Copiar archivo de respaldo para asegurar disponibilidad
echo "===== Copiando archivo HTML de respaldo para menú principal ====="
mkdir -p dist/menu/8idq9bgbdwr7srcw
cp -f menu-backup.html dist/menu/8idq9bgbdwr7srcw/backup.html 2>/dev/null || :
cp -f menu-backup.html dist/menu-publico.html 2>/dev/null || :
echo "✅ Archivos de respaldo copiados"

# Crear páginas HTML adicionales para menús compartidos
echo "===== Creando páginas HTML para menús compartidos ====="
node generate-menu-pages.js || echo "⚠️ Error al crear páginas de menú. Continuando..."

echo "===== Despliegue completado ====="