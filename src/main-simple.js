import Vue from 'vue'
import App from './App.vue'
import router from './router'

// Variable global simple para menu IDs
window.MENU_PUBLIC_ID = window.location.pathname.startsWith('/menu/') ? 
  window.location.pathname.split('/menu/')[1] : 
  null;

// Crear instancia de Vue con el mínimo de configuración posible
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')