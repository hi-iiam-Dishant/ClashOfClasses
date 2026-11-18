// src/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const poolConfig = {
  user: process.env.DB_USER || 'junk',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clash_of_classes',
  waitForConnections: true,
  connectionLimit: 10,
};

// Prefer an explicitly configured socket; otherwise use TCP. This works both
// for native installs and for Docker Compose service-to-service networking.
if (process.env.DB_SOCKET) {
  poolConfig.socketPath = process.env.DB_SOCKET;
} else {
  poolConfig.host = process.env.DB_HOST || '127.0.0.1';
  poolConfig.port = Number(process.env.DB_PORT || 3306);
}

const pool = mysql.createPool(poolConfig);

// Startup connection verification test
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MariaDB.');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed on startup:', err.message);
  }
})();

module.exports = pool;