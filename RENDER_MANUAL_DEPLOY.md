# Guía de despliegue manual en Render.com (Plan Gratuito)

Esta guía te ayudará a desplegar tu aplicación en Render.com de forma manual y gratuita, sin necesidad de usar la función Blueprint.

## 1. Crear una base de datos PostgreSQL

1. Inicia sesión en tu cuenta de Render.com
2. Haz clic en "New" en el dashboard y selecciona "PostgreSQL"
3. Completa el formulario con la siguiente información:
   - **Name**: websap-db (o el nombre que prefieras)
   - **Database**: websap
   - **User**: (Render lo generará automáticamente)
   - **Region**: Selecciona la más cercana a tus usuarios
   - **Plan**: Free
4. Haz clic en "Create Database"
5. **IMPORTANTE**: Una vez creada, toma nota de:
   - **Internal Database URL**: Lo necesitarás para configurar tu aplicación
   - **Password**: La contraseña generada para el usuario de la base de datos

## 2. Crear un servicio web para tu aplicación

1. En el dashboard de Render, haz clic en "New" y selecciona "Web Service"
2. Conecta tu cuenta de GitHub (si aún no lo has hecho)
3. Busca y selecciona tu repositorio: `https://github.com/alexjfj20/websapmenu`
4. Completa el formulario con la siguiente información:
   - **Name**: websapmenu
   - **Environment**: Node
   - **Branch**: main (o la rama principal de tu repositorio)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. En "Advanced", expande la sección "Environment Variables" y agrega las siguientes:

   | KEY | VALUE |
   |-----|-------|
   | NODE_ENV | production |
   | JWT_EXPIRES_IN | 24h |
   | SYNC_ENABLED | true |
   | SYNC_INTERVAL | 60000 |
   | DATABASE_URL | (Pega aquí el Internal Database URL de tu base de datos PostgreSQL) |
   | JWT_SECRET | (Una cadena aleatoria y segura, por ejemplo, puedes generar una en https://passwordsgenerator.net/) |

6. Haz clic en "Create Web Service"

## 3. Monitorear el despliegue

1. Render comenzará a clonar tu repositorio y construir tu aplicación automáticamente
2. Puedes seguir el progreso en la pestaña "Events"
3. Una vez completado el despliegue, Render te proporcionará una URL para acceder a tu aplicación (algo como https://websapmenu.onrender.com)

## 4. Verificar la conexión a la base de datos

Para asegurarte de que tu aplicación se conecta correctamente a la base de datos:

1. Accede a los logs de tu servicio web en Render
2. Busca mensajes relacionados con la conexión a PostgreSQL
3. Si hay errores, verifica:
   - Que la variable DATABASE_URL sea correcta
   - Que tu aplicación esté configurada para usar PostgreSQL en producción
   - Que las migraciones de base de datos se ejecuten correctamente

## 5. Configuración adicional (opcional)

### Auto-despliegue
Por defecto, Render desplegará automáticamente tu aplicación cuando hagas push a la rama principal. Para cambiar esta configuración:

1. Ve a la configuración de tu servicio web
2. Busca la sección "Auto-Deploy"
3. Activa o desactiva según tus preferencias

### Personalización de dominio
Si deseas usar tu propio dominio:

1. Ve a la configuración de tu servicio web
2. Haz clic en "Custom Domain"
3. Sigue las instrucciones para configurar tu dominio personalizado

## Solución de problemas comunes

### Error: Cannot find module
- Verifica que todas las dependencias estén incluidas en tu package.json
- Asegúrate de que la ruta del módulo sea correcta

### Error de conexión a la base de datos
- Verifica que el DATABASE_URL sea correcto
- Confirma que tu aplicación esté configurada para usar PostgreSQL
- Comprueba que la base de datos esté activa en Render

### Error en el proceso de build
- Revisa los logs de construcción para identificar el problema específico
- Verifica que tu package.json tenga los scripts correctos
- Asegúrate de que todas las dependencias necesarias estén instaladas