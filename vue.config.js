const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  // Configuración de transpilación de dependencias
  transpileDependencies: true,
  
  // Configuración para despliegue en producción
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  
  // Opciones de construcción
  configureWebpack: {
    // Evita minificar en desarrollo para acelerar las reconstrucciones
    optimization: {
      minimize: process.env.NODE_ENV === 'production'
    },
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.runtime.esm-bundler.js'
      }
    }
  },
  devServer: {
    host: '0.0.0.0',  // Permite conexiones externas
    port: 3001,       // Usa el puerto correcto
    allowedHosts: "all",  // Permite cualquier host (incluye Ngrok)
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws' // Configuración automática para WebSocket
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        },
        secure: false,
        logLevel: 'debug'
      }
    }
  },
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0].__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = JSON.stringify(false);
      return args;
    });
    // Configuration previously (incorrectly) in package.json
    config.plugins.delete('eslint');
    config.module.rules.delete('eslint');
    console.log('INFO: ESLint plugin/rule removed via chainWebpack.');
  },
  
  // Configuración de CSS
  css: {
    // Extrae CSS en archivos separados
    extract: process.env.NODE_ENV === 'production',
    sourceMap: process.env.NODE_ENV !== 'production'
  }
});
