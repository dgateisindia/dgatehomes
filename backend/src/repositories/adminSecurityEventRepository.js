const { pool } = require('../config/db');

/**
 * Retrieves paginated security events from security_events with optional filters.
 *
 * @param {Object} filters
 * @param {string} [filters.eventType]
 * @param {string} [filters.severity]
 * @param {string} [filters.clerkUserId]
 * @param {string} [filters.requestId]
 * @param {string} [filters.startDate]
 * @param {string} [filters.endDate]
 * @param {number} [filters.page=1]
 * @param {number} [filters.limit=25]
 * @returns {Promise<{ events: Array, total: number, page: number, limit: number, totalPages: number }>}
 */
async function getSecurityEvents(filters = {}) {
  const whereClauses = [];
  const params = [];

  if (filters.eventType && String(filters.eventType).trim()) {
    whereClauses.push('s.event_type = ?');
    params.push(String(filters.eventType).trim());
  }

  if (filters.severity && String(filters.severity).trim()) {
    whereClauses.push('s.severity = ?');
    params.push(String(filters.severity).trim());
  }

  if (filters.clerkUserId && String(filters.clerkUserId).trim()) {
    whereClauses.push('s.clerk_user_id = ?');
    params.push(String(filters.clerkUserId).trim());
  }

  if (filters.requestId && String(filters.requestId).trim()) {
    whereClauses.push('s.request_id LIKE ?');
    params.push(`%${String(filters.requestId).trim()}%`);
  }

  if (filters.startDate && String(filters.startDate).trim()) {
    whereClauses.push('s.created_at >= ?');
    params.push(`${String(filters.startDate).trim()} 00:00:00`);
  }

  if (filters.endDate && String(filters.endDate).trim()) {
    whereClauses.push('s.created_at <= ?');
    params.push(`${String(filters.endDate).trim()} 23:59:59`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Count total matching records
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM security_events s
    ${whereSql}
  `;
  const [countRows] = await pool.query(countQuery, params);
  const total = Number(countRows[0]?.total || 0);

  // Pagination bounds: default 25, max 100
  const rawPage = Math.max(1, parseInt(filters.page, 10) || 1);
  const rawLimit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 25));
  const totalPages = Math.ceil(total / rawLimit) || 1;
  const page = Math.min(rawPage, totalPages);
  const offset = (page - 1) * rawLimit;

  // Query records, joining admin_profiles to resolve display name
  const selectQuery = `
    SELECT
      s.id,
      s.clerk_user_id,
      s.event_type,
      s.severity,
      s.request_id,
      s.ip_address,
      s.user_agent,
      s.metadata,
      s.created_at,
      ap.display_name AS admin_display_name,
      ap.role AS admin_role
    FROM security_events s
    LEFT JOIN admin_profiles ap ON s.clerk_user_id = ap.clerk_user_id
    ${whereSql}
    ORDER BY s.created_at DESC, s.id DESC
    LIMIT ? OFFSET ?
  `;

  const queryParams = [...params, rawLimit, offset];
  const [rows] = await pool.query(selectQuery, queryParams);

  const events = rows.map((r) => {
    let parsedMeta = r.metadata;
    if (typeof parsedMeta === 'string') {
      try {
        parsedMeta = JSON.parse(parsedMeta);
      } catch (e) {
        // Keep string if not JSON
      }
    }

    return {
      id: r.id,
      clerk_user_id: r.clerk_user_id,
      event_type: r.event_type,
      severity: r.severity,
      request_id: r.request_id,
      ip_address: r.ip_address,
      user_agent: r.user_agent,
      metadata: parsedMeta,
      created_at: r.created_at,
      admin_display_name: r.admin_display_name || null,
      admin_role: r.admin_role || null,
    };
  });

  return {
    events,
    pagination: {
      total,
      page,
      limit: rawLimit,
      totalPages,
    },
  };
}

/**
 * Retrieves distinct event types and severities for UI filter dropdowns.
 * @returns {Promise<{ eventTypes: string[], severities: string[] }>}
 */
async function getSecurityEventFilterOptions() {
  const [typeRows] = await pool.query(
    'SELECT DISTINCT event_type FROM security_events WHERE event_type IS NOT NULL ORDER BY event_type ASC'
  );

  return {
    eventTypes: typeRows.map((r) => r.event_type),
    severities: ['info', 'warning', 'critical'],
  };
}

module.exports = {
  getSecurityEvents,
  getSecurityEventFilterOptions,
};
