const { pool } = require('../config/db');

/**
 * Retrieves all active property types ordered by sort_order ASC, name ASC.
 * @returns {Promise<any[]>}
 */
async function findActivePropertyTypes() {
  const query = `
    SELECT
      id,
      name,
      slug,
      segment,
      sort_order
    FROM property_types
    WHERE is_active = ?
    ORDER BY sort_order ASC, name ASC
  `;

  const [rows] = await pool.query(query, [1]);
  return rows;
}

module.exports = {
  findActivePropertyTypes,
};
