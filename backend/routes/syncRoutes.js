const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { getDbConfig } = require('../config/dbPool');

// Endpoint para probar la conexión
router.get('/test/ping', (req, res) => {
  res.json({ status: 'ok', message: 'API sincronización funcionando correctamente' });
});

// Endpoint para verificar estado de sincronización
router.get('/status', async (req, res) => {
  try {
    // Verificar conexión MySQL
    const dbConfig = getDbConfig();
    const connection = await mysql.createConnection(dbConfig);
    
    // Obtener información de la base de datos
    const [tables] = await connection.query('SHOW TABLES');
    const [dbInfo] = await connection.query('SELECT DATABASE() as database');
    
    await connection.end();
    
    res.json({
      status: 'ok',
      mysql: {
        connected: true,
        database: dbInfo[0].database,
        tables: tables.map(table => Object.values(table)[0])
      }
    });
  } catch (error) {
    console.error('Error al verificar estado de sincronización:', error);
    res.status(500).json({
      status: 'error',
      mysql: { connected: false },
      error: error.message
    });
  }
});

// Endpoint para configurar la sincronización
router.post('/setup', async (req, res) => {
  try {
    const dbConfig = getDbConfig();
    const connection = await mysql.createConnection(dbConfig);
    
    // Determinar si debemos forzar la recreación de tablas
    const force = req.body.force === true;
    
    // Asegurarse de que las tablas necesarias existan
    if (force) {
      // Si se fuerza, podemos recrear las tablas (eliminar y volver a crear)
      console.log('Recreando tablas para sincronización...');
      
      // Eliminar la tabla si existe
      await connection.query('DROP TABLE IF EXISTS platos');
    }
    
    // Crear tabla platos si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS platos (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) DEFAULT 0,
        description TEXT,
        category VARCHAR(50) DEFAULT 'principal',
        image LONGTEXT,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Verificar si la tabla se creó correctamente
    const [tables] = await connection.query('SHOW TABLES');
    const tableExists = tables.some(table => Object.values(table)[0] === 'platos');
    
    await connection.end();
    
    res.json({
      status: 'ok',
      message: tableExists ? 'Tabla platos lista para sincronización' : 'Error al verificar tabla platos',
      force: force,
      tables: tables.map(table => Object.values(table)[0])
    });
  } catch (error) {
    console.error('Error al configurar sincronización:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Endpoint para sincronizar platos - El que estaba fallando
router.post('/platos', async (req, res) => {
  try {
    const platoData = req.body;
    
    // Validar que tengamos los datos mínimos necesarios
    if (!platoData || !platoData.id || !platoData.name) {
      return res.status(400).json({
        success: false,
        error: 'Datos del plato incompletos'
      });
    }
    
    // Conectar a la base de datos
    const dbConfig = getDbConfig();
    const connection = await mysql.createConnection(dbConfig);
    
    // Verificar si el plato ya existe
    const [existingPlatos] = await connection.query('SELECT id FROM platos WHERE id = ?', [platoData.id]);
    
    let query;
    let params;
    
    if (existingPlatos.length > 0) {
      // Actualizar plato existente
      query = `
        UPDATE platos SET 
        name = ?, 
        price = ?, 
        description = ?,
        category = ?,
        image = ?,
        is_available = ?
        WHERE id = ?
      `;
      params = [
        platoData.name,
        platoData.price || 0,
        platoData.description || '',
        platoData.category || 'principal',
        platoData.image || null,
        platoData.is_available !== false,
        platoData.id
      ];
    } else {
      // Insertar nuevo plato
      query = `
        INSERT INTO platos 
        (id, name, price, description, category, image, is_available) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      params = [
        platoData.id,
        platoData.name,
        platoData.price || 0,
        platoData.description || '',
        platoData.category || 'principal',
        platoData.image || null,
        platoData.is_available !== false
      ];
    }
    
    const [result] = await connection.query(query, params);
    await connection.end();
    
    res.json({
      success: true,
      message: existingPlatos.length > 0 ? 'Plato actualizado correctamente' : 'Plato creado correctamente',
      platoId: platoData.id,
      result: {
        affectedRows: result.affectedRows
      }
    });
  } catch (error) {
    console.error('Error al sincronizar plato:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
