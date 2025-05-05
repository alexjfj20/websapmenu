/**
 * Datos simulados para la API durante el mantenimiento
 */

// Datos de negocio simulados
const businessInfoMock = {
  generateBusinessInfo: (id) => ({
    id: id || '8idq9bgbdwr7srcw',
    name: "Restaurante Demo",
    description: "Restaurante disponible en modo de mantenimiento",
    logo: null,
    address: "Dirección no disponible durante mantenimiento",
    phone: "000-000-0000",
    email: "info@ejemplo.com",
    openingHours: "Lun-Vie: 9:00-18:00",
    status: "maintenance"
  })
};

// Datos de menú simulados
const menuMock = {
  generateMenu: (id) => {
    // Generar fecha actual en formato ISO
    const currentDate = new Date().toISOString();
    
    // Crear objeto de menú con estructura exacta esperada
    return {
      businessInfo: businessInfoMock.generateBusinessInfo(id),
      categories: [
        {
          id: 1,
          name: "Entradas",
          orden: 1,
          platos: [
            {
              id: 101,
              name: "Entrada de ejemplo",
              description: "Este es un plato de ejemplo durante el mantenimiento",
              price: 10.99,
              image: null,
              available: true
            }
          ]
        },
        {
          id: 2,
          name: "Platos principales",
          orden: 2,
          platos: [
            {
              id: 201,
              name: "Plato principal de ejemplo",
              description: "Este es un plato de ejemplo durante el mantenimiento",
              price: 15.99,
              image: null,
              available: true
            }
          ]
        },
        {
          id: 3,
          name: "Postres",
          orden: 3,
          platos: [
            {
              id: 301,
              name: "Postre de ejemplo",
              description: "Este es un postre de ejemplo durante el mantenimiento",
              price: 7.99,
              image: null,
              available: true
            }
          ]
        }
      ],
      version: currentDate,
      lastUpdate: currentDate,
      status: "active",
      id: id || '8idq9bgbdwr7srcw'
    };
  }
};

// Respuestas de error comunes
const errorResponses = {
  maintenance: {
    error: "maintenance",
    message: "Servidor en mantenimiento. Por favor, intente más tarde.",
    status: 503
  },
  notFound: {
    error: "not_found",
    message: "El recurso solicitado no fue encontrado",
    status: 404
  },
  unauthorized: {
    error: "unauthorized",
    message: "No tiene autorización para acceder a este recurso",
    status: 401
  }
};

module.exports = {
  businessInfoMock,
  menuMock,
  errorResponses
};