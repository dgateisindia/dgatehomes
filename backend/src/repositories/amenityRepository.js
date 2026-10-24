const { pool } = require('../config/db');

/**
 * Retrieves all active amenities ordered by category ASC, sort_order ASC, name ASC.
 * @returns {Promise<any[]>}
 */
async function findActiveAmenities() {
  const query = `
    SELECT
      id,
      name,
      slug,
      category,
      icon_key,
      sort_order
    FROM amenities
    WHERE is_active = ?
    ORDER BY category ASC, sort_order ASC, name ASC
  `;

  const [rows] = await pool.query(query, [1]);
  return rows;
}

module.exports = {
  findActiveAmenities,
};
