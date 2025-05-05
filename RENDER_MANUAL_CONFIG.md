# Configuración manual para despliegue en Render.com (Plan Gratuito)

Esta guía te ayudará a configurar correctamente tu aplicación Vue.js para desplegarse en Render.com usando el plan gratuito.

## Configuración del Web Service en Render.com

Cuando configures manualmente el servicio web en Render.com, utiliza exactamente estos valores:

### Información básica
- **Name**: websapmenu (o el nombre que prefieras)
- **Environment**: Node
- **Branch**: main (o la rama principal de tu repositorio)

### Comandos de construcción y inicio
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Variables de entorno
Configura las siguientes variables de entorno:

| KEY | VALUE |
|-----|-------|
| NODE_ENV | production |
| JWT_SECRET | (genera una clave aleatoria segura) |
| JWT_EXPIRES_IN | 24h |
| SYNC_ENABLED | true |
| SYNC_INTERVAL | 60000 |
| DATABASE_URL | (URL de tu base de datos PostgreSQL) |

## Solución de problemas comunes

### Error: vue-cli-service no encontrado

Si ves este error durante el despliegue, sigue estos pasos:

1. Asegúrate de que `@vue/cli-service` esté en la sección de dependencies (no en devDependencies) de tu package.json ✅
2. Verifica que el comando build use `npx`: `"build": "npx vue-cli-service build"` ✅
3. Intenta cambiar el comando de construcción en Render a:
   ```
   npm install @vue/cli-service @vue/cli-plugin-babel @vue/cli-plugin-eslint && npm run build
   ```

### Error: módulo no encontrado

Si la aplicación no encuentra algún módulo después de desplegar:

1. Asegúrate de que todas las dependencias estén en la sección "dependencies" de tu package.json
2. Verifica que no haya dependencias faltantes que uses en tu código

### Error al conectar a la base de datos

Si hay problemas con la conexión a la base de datos:

1. Verifica que la variable DATABASE_URL sea correcta
2. Asegúrate de que la base de datos PostgreSQL esté creada y activa
3. Confirma que el usuario tiene permisos para conectarse desde Render.com