#!/bin/bash
# Script de despliegue mínimo que no puede fallar

echo "Iniciando despliegue mínimo..."

# Asegurarnos de que tenemos las dependencias mínimas
npm install express path fs

# Crear directorio dist
mkdir -p dist

# Crear archivo HTML mínimo
cat > dist/index.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
  <title>WebSAP - Mantenimiento</title>
  <style>
    body { font-family: sans-serif; text-align: center; margin-top: 50px; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>WebSAP</h1>
  <p>Aplicación en mantenimiento. Por favor, intente más tarde.</p>
</body>
</html>
EOL

echo "Despliegue mínimo completado exitosamente."