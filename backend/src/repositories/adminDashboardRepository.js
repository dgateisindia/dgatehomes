const { pool } = require('../config/db');

/**
 * Retrieves aggregate summary metrics for properties.
 * Excludes soft-deleted properties (deleted_at IS NULL).
 *
 * @returns {Promise<{
 *   totalProperties: number,
 *   publishedProperties: number,
 *   draftProperties: number,
 *   archivedProperties: number,
 *   featuredProperties: number,
 *   propertiesPublishedThisMonth: number
 * }>}
 */
async function getPropertySummaryMetrics() {
  const query = `
    SELECT
      COUNT(*) AS totalProperties,
      COALESCE(SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END), 0) AS publishedProperties,
      COALESCE(SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END), 0) AS draftProperties,
      COALESCE(SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END), 0) AS archivedProperties,
      COALESCE(SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END), 0) AS featuredProperties,
      COALESCE(SUM(CASE
        WHEN status = 'published' AND COALESCE(published_at, created_at) >= DATE_FORMAT(NOW(), '%Y-%m-01 00:00:00')
        THEN 1 ELSE 0 END
      ), 0) AS propertiesPublishedThisMonth
    FROM properties
    WHERE deleted_at IS NULL
  `;

  const [rows] = await pool.query(query);
  const row = rows[0] || {};

  return {
    totalProperties: Number(row.totalProperties) || 0,
    publishedProperties: Number(row.publishedProperties) || 0,
    draftProperties: Number(row.draftProperties) || 0,
    archivedProperties: Number(row.archivedProperties) || 0,
    featuredProperties: Number(row.featuredProperties) || 0,
    propertiesPublishedThisMonth: Number(row.propertiesPublishedThisMonth) || 0,
  };
}

/**
 * Retrieves aggregate summary metrics for enquiries.
 *
 * @returns {Promise<{
 *   totalEnquiries: number,
 *   newEnquiries: number,
 *   contactedEnquiries: number,
 *   inProgressEnquiries: number,
 *   closedEnquiries: number,
 *   overdueFollowUps: number,
 *   enquiriesToday: number,
 *   enquiriesThisWeek: number
 * }>}
 */
async function getEnquirySummaryMetrics() {
  const query = `
    SELECT
      COUNT(*) AS totalEnquiries,
      COALESCE(SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END), 0) AS newEnquiries,
      COALESCE(SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END), 0) AS contactedEnquiries,
      COALESCE(SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), 0) AS inProgressEnquiries,
      COALESCE(SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END), 0) AS closedEnquiries,
      COALESCE(SUM(CASE
        WHEN status != 'closed' AND next_follow_up_at IS NOT NULL AND next_follow_up_at < NOW()
        THEN 1 ELSE 0 END
      ), 0) AS overdueFollowUps,
      COALESCE(SUM(CASE WHEN created_at >= CURDATE() THEN 1 ELSE 0 END), 0) AS enquiriesToday,
      COALESCE(SUM(CASE
        WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        THEN 1 ELSE 0 END
      ), 0) AS enquiriesThisWeek
    FROM enquiries
  `;

  const [rows] = await pool.query(query);
  const row = rows[0] || {};

  return {
    totalEnquiries: Number(row.totalEnquiries) || 0,
    newEnquiries: Number(row.newEnquiries) || 0,
    contactedEnquiries: Number(row.contactedEnquiries) || 0,
    inProgressEnquiries: Number(row.inProgressEnquiries) || 0,
    closedEnquiries: Number(row.closedEnquiries) || 0,
    overdueFollowUps: Number(row.overdueFollowUps) || 0,
    enquiriesToday: Number(row.enquiriesToday) || 0,
    enquiriesThisWeek: Number(row.enquiriesThisWeek) || 0,
  };
}

/**
 * Retrieves the latest properties ordered by creation date descending.
 * Does not expose internal creator Clerk IDs or soft-deleted records.
 *
 * @param {number} limit - Maximum number of properties to return (defaults to 5)
 * @returns {Promise<Array>}
 */
async function getRecentProperties(limit = 5) {
  const query = `
    SELECT
      p.id,
      p.title,
      p.slug,
      p.price,
      p.location,
      p.property_type,
      p.listing_type,
      p.status,
      p.bedrooms,
      p.bathrooms,
      p.area,
      p.area_unit,
      p.is_featured,
      p.created_at,
      pt.name AS property_type_name
    FROM properties p
    LEFT JOIN property_types pt ON p.property_type_id = pt.id
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ?
  `;

  const [rows] = await pool.query(query, [Math.max(1, parseInt(limit, 10) || 5)]);
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    price: Number(row.price),
    location: row.location,
    propertyType: row.property_type_name || row.property_type || 'Property',
    listingType: row.listing_type,
    status: row.status,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: Number(row.area),
    areaUnit: row.area_unit,
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
  }));
}

/**
 * Retrieves the latest enquiries ordered by creation date descending.
 * Joins property details where available.
 *
 * @param {number} limit - Maximum number of enquiries to return (defaults to 5)
 * @returns {Promise<Array>}
 */
async function getRecentEnquiries(limit = 5) {
  const query = `
    SELECT
      e.id,
      e.property_id,
      e.name,
      e.phone,
      e.email,
      e.message,
      e.source,
      e.status,
      e.created_at,
      p.title AS property_title,
      p.slug AS property_slug
    FROM enquiries e
    LEFT JOIN properties p ON e.property_id = p.id
    ORDER BY e.created_at DESC, e.id DESC
    LIMIT ?
  `;

  const [rows] = await pool.query(query, [Math.max(1, parseInt(limit, 10) || 5)]);
  return rows.map((row) => ({
    id: row.id,
    propertyId: row.property_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    source: row.source,
    status: row.status,
    createdAt: row.created_at,
    propertyTitle: row.property_title || null,
    propertySlug: row.property_slug || null,
  }));
}

/**
 * Retrieves upcoming follow-up schedules that are not closed.
 * Ordered by next_follow_up_at ascending.
 *
 * @param {number} limit - Maximum number of follow-ups to return (defaults to 5)
 * @returns {Promise<Array>}
 */
async function getUpcomingFollowUps(limit = 5) {
  const query = `
    SELECT
      e.id,
      e.property_id,
      e.name,
      e.phone,
      e.email,
      e.status,
      e.next_follow_up_at,
      e.assigned_to_clerk_user_id,
      p.title AS property_title,
      p.slug AS property_slug,
      ap.display_name AS assigned_admin_name
    FROM enquiries e
    LEFT JOIN properties p ON e.property_id = p.id
    LEFT JOIN admin_profiles ap ON e.assigned_to_clerk_user_id = ap.clerk_user_id
    WHERE e.status != 'closed' AND e.next_follow_up_at IS NOT NULL
    ORDER BY e.next_follow_up_at ASC
    LIMIT ?
  `;

  const [rows] = await pool.query(query, [Math.max(1, parseInt(limit, 10) || 5)]);
  return rows.map((row) => ({
    id: row.id,
    propertyId: row.property_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    status: row.status,
    nextFollowUpAt: row.next_follow_up_at,
    assignedToClerkUserId: row.assigned_to_clerk_user_id,
    assignedAdminName: row.assigned_admin_name || null,
    propertyTitle: row.property_title || null,
    propertySlug: row.property_slug || null,
    isOverdue: new Date(row.next_follow_up_at).getTime() < Date.now(),
  }));
}

module.exports = {
  getPropertySummaryMetrics,
  getEnquirySummaryMetrics,
  getRecentProperties,
  getRecentEnquiries,
  getUpcomingFollowUps,
};
