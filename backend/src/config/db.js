const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: config.db.waitForConnections,
  connectionLimit: config.db.connectionLimit,
  queueLimit: config.db.queueLimit,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Tests the MySQL pool connectivity with a simple alive query.
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1 AS alive');
    return true;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection,
};
