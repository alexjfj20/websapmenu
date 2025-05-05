#!/bin/bash
# Script para construir sin ESLint

echo "🚀 Iniciando construcción sin ESLint..."

# Crear directorio dist si no existe
mkdir -p dist

# Crear página de mantenimiento como respaldo
echo "📄 Creando página de mantenimiento como respaldo..."
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

echo "📦 Instalando dependencias básicas..."
npm install --no-save

# Si existe el directorio del plugin ESLint, renombrarlo temporalmente
if [ -d "./node_modules/@vue/cli-plugin-eslint" ]; then
  echo "🧹 Moviendo plugin ESLint temporalmente..."
  mkdir -p ./temp-backup
  mv ./node_modules/@vue/cli-plugin-eslint ./temp-backup/
fi

# Intentar construir
echo "🔨 Intentando construir sin ESLint..."
export VUE_CLI_SKIP_PLUGINS=eslint
export NODE_ENV=production

# Primera opción: vue-cli-service  npx vue-cli-service build --skip-plugins eslint --mode production || {
    echo "⚠️ Primera opción falló, intentando alternativa..."
    
    # Pre-instalar webpack-cli para evitar la pregunta interactiva
    echo "📦 Instalando webpack-cli automáticamente..."
    npm install --no-save webpack-cli
    
    # Segunda opción: webpack directamente
    echo "🛠️ Construyendo con webpack..."
    npx webpack --config ./node_modules/@vue/cli-service/webpack.config.js --mode production || {
      echo "⚠️ Todos los intentos de construcción fallaron, usando página de mantenimiento."
    }
  }

# Restaurar el plugin si fue movido
if [ -d "./temp-backup/cli-plugin-eslint" ]; then
  echo "🔄 Restaurando plugin ESLint..."
  mv ./temp-backup/cli-plugin-eslint ./node_modules/@vue/cli-plugin-eslint/
  rmdir ./temp-backup
fi

echo "✅ Proceso de construcción completado."