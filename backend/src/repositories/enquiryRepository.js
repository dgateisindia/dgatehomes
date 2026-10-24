const { pool } = require('../config/db');

/**
 * Checks whether a property exists, is published, and has deleted_at IS NULL.
 * @param {number} propertyId
 * @returns {Promise<boolean>}
 */
async function findPublicPropertyById(propertyId) {
  const query = `
    SELECT id
    FROM properties
    WHERE id = ? AND status = 'published' AND deleted_at IS NULL
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [propertyId]);
  return rows.length > 0;
}

/**
 * Inserts a new enquiry and its corresponding enquiry_activity log within a single MySQL transaction.
 * Rolls back all changes if any query fails.
 * @param {{ property_id: number, name: string, phone: string, email: string | null, message: string | null, source: string }} enquiryData
 * @returns {Promise<number>} Returns the newly inserted enquiryId
 */
async function createEnquiryWithActivity(enquiryData) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insert into enquiries
    const insertEnquirySql = `
      INSERT INTO enquiries (
        property_id,
        name,
        phone,
        email,
        message,
        source,
        status,
        last_activity_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'new', NOW())
    `;

    const [enquiryResult] = await connection.query(insertEnquirySql, [
      enquiryData.property_id,
      enquiryData.name,
      enquiryData.phone,
      enquiryData.email,
      enquiryData.message,
      enquiryData.source,
    ]);

    const enquiryId = enquiryResult.insertId;

    // 2. Insert into enquiry_activity
    const insertActivitySql = `
      INSERT INTO enquiry_activity (
        enquiry_id,
        actor_clerk_user_id,
        activity_type,
        new_status,
        note
      ) VALUES (?, NULL, 'created', 'new', 'Enquiry submitted from public website.')
    `;

    await connection.query(insertActivitySql, [enquiryId]);

    // Commit both operations
    await connection.commit();

    return enquiryId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  findPublicPropertyById,
  createEnquiryWithActivity,
};
