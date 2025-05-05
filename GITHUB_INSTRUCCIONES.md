# Instrucciones para subir el proyecto a GitHub

## Requisitos previos
- Tener una cuenta de GitHub
- Tener Git instalado en tu computadora
- Tener acceso a la terminal o línea de comandos

## Pasos para subir el proyecto a GitHub

### 1. Crear un nuevo repositorio en GitHub
1. Inicia sesión en tu cuenta de GitHub.
2. En la página principal, haz clic en el botón verde "New" (Nuevo).
3. Escribe un nombre para tu repositorio, por ejemplo: "websap".
4. Agrega una descripción opcional.
5. Selecciona si quieres que el repositorio sea público o privado.
6. **No inicialices** el repositorio con ningún archivo (README, licencia, etc.).
7. Haz clic en "Create repository" (Crear repositorio).

### 2. Inicializar el repositorio Git local
Abre la terminal o línea de comandos y navega hasta la carpeta de tu proyecto:

```bash
cd "f:\Driver google\VUE.JS-2\VUE-JS\websap"
```

Si no has inicializado Git en tu proyecto, ejecuta:

```bash
git init
```

### 3. Agregar los archivos al staging area
```bash
git add .
```

### 4. Hacer el primer commit
```bash
git commit -m "Primera versión del proyecto WebSAP"
```

### 5. Conectar con el repositorio remoto
Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub:

```bash
git remote add origin https://github.com/TU_USUARIO/websap.git
```

### 6. Cambiar a la rama principal (si es necesario)
```bash
git branch -M main
```

### 7. Subir el código al repositorio
```bash
git push -u origin main
```

## Actualizar el código en GitHub posteriormente

Después de hacer cambios en tu código, para subirlos a GitHub:

1. Guardar los cambios en el staging area:
```bash
git add .
```

2. Crear un commit con un mensaje descriptivo:
```bash
git commit -m "Descripción de los cambios realizados"
```

3. Subir los cambios a GitHub:
```bash
git push
```

## Configuración para despliegue en Render.com

Una vez que tu código esté en GitHub, puedes conectar tu repositorio con Render.com para el despliegue automático. Para más detalles, consulta el archivo README.md.