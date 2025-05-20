// backend/config/dbPool.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la conexión a MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'websap',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones para ser reutilizado por la aplicación
let pool;

// Obtener una conexión del pool
const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

// Devolver la configuración de la base de datos
const getDbConfig = () => {
  return { ...dbConfig }; // Retorna una copia para evitar modificaciones
};

// Cerrar el pool de conexiones
const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Pool de conexiones MySQL cerrado');
  }
};

module.exports = {
  getConnection,
  getDbConfig,
  closePool
};
