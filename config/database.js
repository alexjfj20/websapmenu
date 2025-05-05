require('dotenv').config();

const config = {
  development: {
    client: process.env.USE_MYSQL === 'true' ? 'mysql' : 'sqlite3',
    connection: process.env.USE_MYSQL === 'true' ? {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'websap',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    } : {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: !process.env.USE_MYSQL
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    ssl: {
      rejectUnauthorized: false
    }
  }
};

// Determine which environment to use
const environment = process.env.NODE_ENV || 'development';

module.exports = config[environment];