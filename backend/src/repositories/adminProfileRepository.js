const { pool } = require('../config/db');

/**
 * Finds an admin profile by Clerk user ID using parameterized SQL.
 * Never exposes passwords or internal secrets.
 *
 * @param {string} clerkUserId - Unique Clerk subject identifier (e.g. 'user_...')
 * @returns {Promise<Object|null>} Admin profile row or null if not found
 */
async function findByClerkUserId(clerkUserId) {
  if (!clerkUserId || typeof clerkUserId !== 'string') {
    return null;
  }

  const query = `
    SELECT
      id,
      clerk_user_id,
      display_name,
      role,
      is_active
    FROM admin_profiles
    WHERE clerk_user_id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [clerkUserId.trim()]);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  findByClerkUserId,
};
