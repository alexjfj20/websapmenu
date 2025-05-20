import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

// Función simple para obtener el token de autenticación del almacenamiento local
function getAuthHeader() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token ? { Authorization: 'Bearer ' + user.token } : {};
}

class RolService {
  getRoles() {
    return axios.get(`${API_URL}/roles`, { headers: getAuthHeader() });
  }

  getRol(id) {
    return axios.get(`${API_URL}/roles/${id}`, { headers: getAuthHeader() });
  }

  createRol(rol) {
    return axios.post(`${API_URL}/roles`, rol, { headers: getAuthHeader() });
  }

  updateRol(id, rol) {
    return axios.put(`${API_URL}/roles/${id}`, rol, { headers: getAuthHeader() });
  }

  deleteRol(id) {
    return axios.delete(`${API_URL}/roles/${id}`, { headers: getAuthHeader() });
  }
}

export default new RolService();
