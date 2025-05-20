import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Función para detectar y ajustar las rutas públicas
function detectPublicRoutes() {
  try {
    // Detectar si estamos en una URL pública como /menu/ID
    const path = window.location.pathname;
    if (path.startsWith('/menu/')) {
      console.log('Detectada URL pública de menú:', path);
      // Si es necesario, podemos hacer ajustes aquí
      const menuId = path.split('/menu/')[1];
      if (menuId) {
        console.log('Guardando ID del menú público:', menuId);
        // Guardamos el ID directamente en una variable global
        window.MENU_PUBLIC_ID = menuId;
      }
    }
  } catch (error) {
    console.error('Error al detectar rutas públicas:', error);
  }
}

// Ejecutar la detección de rutas públicas
detectPublicRoutes();

// Hacemos el store disponible globalmente
Vue.prototype.$store = store;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')