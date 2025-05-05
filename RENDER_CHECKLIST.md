# Lista de verificación para despliegue en Render.com

Usa esta lista para asegurarte de que tu aplicación esté lista para ser desplegada en Render.com.

## Preparación del repositorio

- [ ] El código está subido a GitHub: https://github.com/alexjfj20/websapmenu
- [ ] El archivo `package.json` incluye todos los scripts necesarios:
  - [ ] `build`: para construir tu aplicación Vue.js
  - [ ] `start`: para iniciar el servidor
- [ ] El archivo `.gitignore` excluye archivos sensibles (`.env`, `node_modules`, etc.)
- [ ] Existe un `server.js` o archivo similar para servir la aplicación en producción

## Configuración de la base de datos

- [ ] La aplicación está configurada para usar PostgreSQL en producción
- [ ] Existen migraciones para crear las tablas necesarias
- [ ] La conexión a la base de datos usa variables de entorno

## Variables de entorno

Asegúrate de tener preparados los valores para estas variables:

- [ ] `NODE_ENV`: production
- [ ] `DATABASE_URL`: (se obtendrá de Render)
- [ ] `JWT_SECRET`: (generarás una clave segura)
- [ ] `JWT_EXPIRES_IN`: 24h
- [ ] Otras variables específicas de tu aplicación

## Comandos y scripts

Confirma que estos comandos funcionan correctamente en tu entorno local:

- [ ] `npm install`: instala todas las dependencias
- [ ] `npm run build`: construye la versión de producción
- [ ] `npm start`: inicia el servidor

## Consideraciones de producción

- [ ] Las rutas API están configuradas correctamente
- [ ] Los errores se manejan adecuadamente
- [ ] Las políticas CORS están configuradas (si es necesario)
- [ ] La aplicación puede servir los archivos estáticos de Vue.js

## Después del despliegue

- [ ] Verificar que la aplicación se inicia correctamente
- [ ] Probar la conexión a la base de datos
- [ ] Verificar las rutas principales de la aplicación
- [ ] Revisar los logs en busca de errores