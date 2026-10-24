const { pool } = require('../config/db');

/**
 * Executes a parameterized ping query against MySQL database to verify connectivity.
 * @returns {Promise<boolean>}
 */
async function checkDatabaseConnectivity() {
  // Using parameterized query via pool.execute or pool.query
  const [rows] = await pool.query('SELECT ? AS ping', [1]);
  return Array.isArray(rows) && rows.length > 0 && rows[0].ping === 1;
}

module.exports = {
  checkDatabaseConnectivity,
};
