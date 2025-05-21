// ========================
// Endpoint de diagnóstico
// ========================
app.get('/api/diagnostico', (req, res) => {
  const result = {
    timestamp: new Date().toISOString(),
    directorioActual: process.cwd(),
    estructura: {},
    directoriosClave: {},
    serverJs: {}
  };

  // Función recursiva para listar contenido de directorios (hasta 2 niveles)
  function listDir(dirPath, maxDepth = 2, currentDepth = 0) {
    try {
      if (currentDepth > maxDepth) return { tipo: 'dir', mensaje: 'Profundidad máxima alcanzada' };

      const files = fs.readdirSync(dirPath);
      const result = {};

      files.forEach(file => {
        try {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);

          if (stats.isDirectory()) {
            result[file] = {
              tipo: 'dir',
              tamano: '-',
              contenido: listDir(filePath, maxDepth, currentDepth + 1)
            };
          } else {
            result[file] = {
              tipo: 'archivo',
              tamano: stats.size,
              modificado: stats.mtime
            };
          }
        } catch (err) {
          result[file] = { tipo: 'error', mensaje: err.message };
        }
      });

      return result;
    } catch (err) {
      return { tipo: 'error', mensaje: err.message };
    }
  }

  // Listar estructura básica desde la raíz del proyecto (nivel 1)
  try {
    result.estructura = listDir('.', 1);
  } catch (err) {
    result.estructura = { error: err.message };
  }

  // Verificar existencia y contenido básico de carpetas clave
  ['dist', 'public', 'backend', 'node_modules'].forEach(dir => {
    try {
      const exists = fs.existsSync(dir);
      const dirInfo = { existe: exists };

      if (exists) {
        const stats = fs.statSync(dir);
        dirInfo.tamano = stats.size;
        dirInfo.modificado = stats.mtime;

        try {
          const files = fs.readdirSync(dir).slice(0, 5);
          dirInfo.archivos = files;
          dirInfo.totalArchivos = fs.readdirSync(dir).length;
        } catch (err) {
          dirInfo.error = err.message;
        }
      }

      result.directoriosClave[dir] = dirInfo;
    } catch (err) {
      result.directoriosClave[dir] = { error: err.message };
    }
  });

  // Verificar server.js específico en backend
  const serverJsPath = path.join('backend', 'server.js');
  try {
    const exists = fs.existsSync(serverJsPath);
    result.serverJs.existe = exists;

    if (exists) {
      const stats = fs.statSync(serverJsPath);
      result.serverJs.tamano = stats.size;
      result.serverJs.modificado = stats.mtime;

      const content = fs.readFileSync(serverJsPath, 'utf-8');
      const lines = content.split('\n').slice(0, 10);
      result.serverJs.primerasLineas = lines;
    }
  } catch (err) {
    result.serverJs.error = err.message;
  }

  // Variables de entorno
  result.variables = {
    NODE_ENV: process.env.NODE_ENV || 'no definido',
    PORT: process.env.PORT || 'no definido',
    DATABASE_URL: process.env.DATABASE_URL ? 'definido (oculto)' : 'no definido',
    RENDER: process.env.RENDER || 'no definido'
  };

  // Datos del sistema
  result.sistema = {
    plataforma: process.platform,
    version: process.version,
    memoria: process.memoryUsage(),
    uptime: process.uptime()
  };

  res.json(result);
});
