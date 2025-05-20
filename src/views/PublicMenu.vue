<template>
  <div class="public-menu">
    <h1>Menú Público</h1>
    <!-- Aquí iría el contenido del menú basado en el ID -->
    <div v-if="menuId">
      <p v-if="loading">Cargando menú con ID: {{ menuId }}</p>
      <div v-else-if="menu" class="menu-content">
        <h2>{{ menu.name }}</h2>
        <div v-if="error" class="error-message">
          <p>{{ error }}</p>
          <button @click="retryLoadMenu">Intentar nuevamente</button>
        </div>
        <div v-else>
          <!-- Contenido del menú -->
        </div>
      </div>
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="retryLoadMenu">Intentar nuevamente</button>
      </div>
    </div>
    <div v-else>
      <p>Cargando menú...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PublicMenu',
  props: {
    id: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      menu: null,
      loading: true,
      error: null
    }
  },  
  computed: {
    menuId() {
      // Usar el ID del prop, del parámetro de ruta o de la variable global
      const fromProps = this.id;
      const fromRoute = this.$route && this.$route.params ? this.$route.params.id : null;
      const fromGlobal = window.MENU_PUBLIC_ID;
      
      return fromProps || fromRoute || fromGlobal;
    }
  },
  mounted() {
    this.loadMenu();
  },
  methods: {
    async loadMenu() {
      if (!this.menuId) return;
      
      try {
        this.loading = true;
        this.error = null;
        
        // Usamos un formato adecuado para asegurar que recibimos JSON
        const response = await fetch(`/api/menus/${this.menuId}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        // Verificar que la respuesta es JSON válido
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('La respuesta del servidor no es JSON válido');
        }
        
        this.menu = await response.json();
      } catch (error) {
        console.error("Error al cargar el menú:", error);
        this.error = "No se pudo cargar el menú. Inténtalo de nuevo más tarde.";
      } finally {
        this.loading = false;
      }
    },
    
    retryLoadMenu() {
      this.loadMenu();
    }
  }
}
</script>

<style scoped>
.public-menu {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 15px;
  border-radius: 4px;
  margin: 10px 0;
}

.error-message button {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.error-message button:hover {
  background-color: #b71c1c;
}

.menu-content {
  margin-top: 20px;
}
</style>