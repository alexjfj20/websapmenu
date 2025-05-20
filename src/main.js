import { createApp } from 'vue'; // Importar createApp de Vue 3
import App from './App.vue';
import router from './router';

// Variable global para almacenar ID del menú público (si aún la necesitas)
window.MENU_PUBLIC_ID = null;

// Función simple para detectar URLs públicas
function detectPublicUrl() {
  try {
    const path = window.location.pathname;
    if (path.startsWith('/menu/')) {
      const menuId = path.split('/menu/')[1];
      if (menuId) {
        console.log('Detectada URL de menú público:', menuId);
        window.MENU_PUBLIC_ID = menuId;
      }
    }
  } catch (error) {
    console.error('Error al detectar URL:', error);
  }
}

// Ejecutar detección
detectPublicUrl();

// Crear la instancia de la aplicación Vue 3
const app = createApp(App);

// Usar el router
app.use(router);

// Montar la aplicación en el elemento #app del HTML
app.mount('#app');