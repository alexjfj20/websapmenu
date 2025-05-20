const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Middleware de protección para todas las rutas
router.use(verifyToken);

// Rutas para administración de usuarios
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Ruta para obtener roles
router.get('/roles', userController.getRoles);

// Ruta para el dashboard principal
router.get('/dashboard', (req, res) => {
  try {
    // Endpoint para el dashboard principal
    console.log('Solicitando datos del dashboard administrativo');
    res.status(200).json({
      success: true,
      data: {
        usuarios: {
          total: 10,
          activos: 8,
          inactivos: 2
        },
        ventas: {
          diarias: 1250000,
          semanales: 8750000,
          mensuales: 35000000
        },
        pedidos: {
          pendientes: 8,
          completados: 120,
          cancelados: 12
        },
        platos: {
          total: 45,
          destacados: 10,
          agotados: 3
        },
        totalIncome: 15750000,
        status: 'Normal',
        lastBackup: new Date().toISOString(),
        recentActivity: [
          {
            id: 1,
            action: 'Usuario creado',
            user: 'admin@example.com',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            action: 'Nuevo pedido',
            user: 'cliente@example.com',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: 3,
            action: 'Modificación de inventario',
            user: 'alexjfj20',
            timestamp: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        systemStatus: {
          cpu: '23%',
          memory: '42%',
          storage: '56%',
          uptime: '5d 7h 23m'
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cargar datos del dashboard',
      error: error.message
    });
  }
});

// Ruta para estadísticas específicas (mantener para compatibilidad)
router.get('/stats', (req, res) => {
  try {
    // Endpoint para estadísticas
    console.log('Solicitando datos de estadísticas');
    res.status(200).json({
      success: true,
      data: {
        totalUsers: 10,
        activeUsers: 8,
        inactiveUsers: 2,
        totalIncome: 15750000,
        status: 'Normal',
        lastBackup: new Date().toISOString(),
        recentActivity: []
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cargar estadísticas',
      error: error.message
    });
  }
});

// Ruta para analíticas avanzadas
router.get('/analytics', (req, res) => {
  try {
    // Endpoint para analíticas
    console.log('Solicitando datos de analíticas');
    const currentDate = new Date();
    const lastMonth = new Date(currentDate);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    res.status(200).json({
      success: true,
      data: {
        period: {
          start: lastMonth.toISOString(),
          end: currentDate.toISOString()
        },
        sales: {
          total: 24500000,
          growth: 13.5,
          byCategory: [
            { name: 'Entradas', value: 5200000 },
            { name: 'Platos principales', value: 12300000 },
            { name: 'Postres', value: 4100000 },
            { name: 'Bebidas', value: 2900000 }
          ]
        },
        users: {
          total: 10,
          new: 3,
          active: 8
        },
        topProducts: [
          { id: 1, name: 'Hamburguesa Clásica', sales: 145 },
          { id: 2, name: 'Pizza Margherita', sales: 132 },
          { id: 3, name: 'Ensalada César', sales: 98 },
          { id: 4, name: 'Pasta Alfredo', sales: 87 },
          { id: 5, name: 'Limonada', sales: 76 }
        ]
      }
    });
  } catch (error) {
    console.error('Error al obtener analíticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cargar analíticas',
      error: error.message
    });
  }
});

// Ruta para la verificación de estado del servidor
router.get('/healthcheck', (req, res) => {
  try {
    console.log('Verificando estado del servidor');
    res.status(200).json({
      success: true,
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Error en healthcheck:', error);
    res.status(500).json({
      success: false,
      message: 'Error en servidor',
      error: error.message
    });
  }
});

// Ruta para configuración del sistema
router.get('/settings', (req, res) => {
  try {
    console.log('Solicitando configuración del sistema');
    res.status(200).json({
      success: true,
      data: {
        appName: 'WebSAP Menu',
        theme: 'light',
        features: {
          offlineMode: true,
          notifications: true,
          analytics: true
        },
        backup: {
          automatic: true,
          frequency: 'daily',
          lastBackup: new Date().toISOString()
        },
        maintenance: {
          scheduled: false,
          nextDate: null
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cargar configuración',
      error: error.message
    });
  }
});

// Exportar router
module.exports = router;
