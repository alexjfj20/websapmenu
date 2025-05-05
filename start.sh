#!/bin/bash
# Script para instalar dependencias y luego iniciar el servidor

echo "Instalando dependencias necesarias..."
npm install express dotenv cors

echo "Iniciando servidor..."
node server.js