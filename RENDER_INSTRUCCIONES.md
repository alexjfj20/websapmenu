# Pasos para desplegar tu aplicación en Render.com usando GitHub

## Requisitos previos
- Tu proyecto debe estar subido a GitHub (ver archivo GITHUB_INSTRUCCIONES.md)
- Una cuenta en Render.com (puedes registrarte gratis en https://render.com)

## Paso 1: Crear una base de datos PostgreSQL en Render

1. Inicia sesión en tu cuenta de Render.com
2. En el dashboard, haz clic en "New" y selecciona "PostgreSQL"
3. Configura tu base de datos:
   - **Nombre**: websap-db (o el nombre que prefieras)
   - **Base de datos**: websap
   - **Usuario**: (Render lo genera automáticamente)
   - **Región**: Selecciona la más cercana a tu ubicación o usuarios
   - **Plan**: Selecciona el plan gratuito para pruebas o el que se ajuste a tus necesidades
4. Haz clic en "Create Database"
5. **IMPORTANTE**: Guarda la información de conexión que Render te proporciona:
   - **Internal Database URL**: Este es tu DATABASE_URL que necesitarás para la configuración
   - **External Database URL**: Para conectarte desde tu máquina local si lo necesitas
   - **Username, Password, Database name, Host**: Detalles individuales de conexión

## Paso 2: Desplegar tu aplicación Web en Render

1. En el dashboard de Render, haz clic en "New" y selecciona "Web Service"
2. Conecta tu cuenta de GitHub si aún no lo has hecho
3. Busca y selecciona el repositorio de tu proyecto websap
4. Configura el servicio web:
   - **Nombre**: websap (o el nombre que prefieras)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Selecciona el plan gratuito para pruebas o el que se ajuste a tus necesidades
   - **Región**: Selecciona la misma que elegiste para la base de datos

5. En la sección "Environment", añade las siguientes variables de entorno:
   - `NODE_ENV`: production
   - `DATABASE_URL`: (Pega el Internal Database URL que obtuviste al crear la base de datos)
   - `JWT_SECRET`: (Una cadena segura para firmar los tokens JWT)
   - `JWT_EXPIRES_IN`: 24h
   - `PORT`: 8080 (aunque Render asignará su propio puerto)
   - `SYNC_ENABLED`: true
   - `SYNC_INTERVAL`: 60000
   - Agrega otras variables de entorno necesarias para tu aplicación

6. Haz clic en "Create Web Service"

## Paso 3: Verificar el despliegue

1. Render comenzará a construir y desplegar tu aplicación automáticamente
2. Puedes seguir el proceso de despliegue en la pestaña "Logs"
3. Una vez completado, Render proporcionará una URL para acceder a tu aplicación (algo como https://websap.onrender.com)
4. Visita la URL para confirmar que tu aplicación funciona correctamente

## Paso 4: Configurar despliegue automático (opcional)

Por defecto, Render.com actualizará automáticamente tu aplicación cada vez que hagas push a la rama principal de tu repositorio GitHub. Si deseas cambiar este comportamiento:

1. Ve a la configuración de tu Web Service
2. Busca la sección "Auto-Deploy"
3. Configura las opciones según tus preferencias:
   - Puedes deshabilitar los despliegues automáticos
   - Cambiar la rama que se despliega
   - Configurar despliegues manuales

## Troubleshooting

Si tienes problemas con el despliegue:

1. **Errores de construcción**: Revisa los logs de deploy para identificar errores en el proceso de build
2. **Errores de conexión a base de datos**:
   - Verifica que el DATABASE_URL es correcto
   - Asegúrate de que tu aplicación esté configurada para usar PostgreSQL en producción
   - Revisa la configuración SSL para la conexión a la base de datos
3. **Errores de aplicación**: 
   - Consulta los logs de la aplicación en Render
   - Asegúrate de que todas las variables de entorno necesarias estén configuradas

## Mantenimiento

1. **Monitoreo**: Render proporciona estadísticas básicas de uso y logs para monitorear tu aplicación
2. **Escalamiento**: Si necesitas más recursos, puedes actualizar tu plan en cualquier momento
3. **Backups**: Configura backups regulares de tu base de datos desde la sección de configuración de PostgreSQL