const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production'
    ? (process.env.VUE_APP_PUBLIC_PATH || '/websapmenu/') // Permite configuración dinámica del path
    : '/',
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.runtime.esm-bundler.js'
      }
    }
  },
  devServer: {
    host: '0.0.0.0',  // Permite conexiones externas
    port: 3001,       // Puerto de desarrollo
    allowedHosts: "all",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    },
    // El proxy es solo para desarrollo, no afecta producción.
    // En producción, el frontend hará llamadas a /api directamente,
    // y el backend (Express) servirá esas rutas.
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Backend de desarrollo
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
      // Asegúrate que __VUE_PROD_HYDRATION_MISMATCH_DETAILS__ esté definido
      // Puedes establecerlo en false para producción si no necesitas los detalles
      args[0]['__VUE_PROD_HYDRATION_MISMATCH_DETAILS__'] = JSON.stringify(process.env.NODE_ENV !== 'production');
      return args;
    });
  }
});
