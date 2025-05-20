// Store simplificado sin dependencias externas
export default {
  state: {
    currentPublicMenuId: null // Almacena el ID del menú público
  },
  
  setPublicMenuId(id) {
    this.state.currentPublicMenuId = id;
  },
  
  getPublicMenuId() {
    return this.state.currentPublicMenuId;
  }
}