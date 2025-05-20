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
  // Endpoint para el dashboard principal
  res.status(200).json({
    success: true,
    data: {
      totalUsers: 10,
      activeUsers: 8,
      inactiveUsers: 2,
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
});

// Ruta para estadísticas específicas (mantener para compatibilidad)
router.get('/stats', (req, res) => {
  // Endpoint para estadísticas
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
});

// Ruta para analíticas avanzadas
router.get('/analytics', (req, res) => {
  // Endpoint para analíticas
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
});

// Ruta para configuración del sistema
router.get('/settings', (req, res) => {
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
});

// Exportar router
module.exports = router;
