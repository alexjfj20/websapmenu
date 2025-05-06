#!/bin/bash
# Script de inicio específico para Render

echo "===== INICIANDO SERVIDOR DE WORKER PARA RENDER ====="
echo "Este script NO usa la lógica estándar de inicio, sino un worker simple"

# Vincular el puerto inmediatamente
PORT=${PORT:-10000}
echo "Vinculando puerto ${PORT}..."

# Ejecutar el servidor worker directamente
exec node server-worker.js