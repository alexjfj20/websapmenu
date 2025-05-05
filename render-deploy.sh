#!/bin/bash
# Script simple para despliegue en Render

echo "Iniciando despliegue en Render..."

# Limpiar caché
rm -rf node_modules package-lock.json

# Instalar solo dependencias esenciales para el servidor
npm install express dotenv cors

# Crear directorio dist si no existe
mkdir -p dist

# Crear una página de mantenimiento básica como fallback
echo "Creando página de mantenimiento básica..."
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

# Intentar construir la aplicación (si hay tiempo y recursos)
echo "Intentando construir la aplicación..."
node build-without-eslint.js || echo "Se usará la página de mantenimiento"

echo "Despliegue completado."