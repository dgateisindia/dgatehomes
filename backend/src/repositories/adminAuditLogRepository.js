const { pool } = require('../config/db');

/**
 * Retrieves paginated audit logs from admin_activity_logs with optional filters.
 *
 * @param {Object} filters
 * @param {string} [filters.clerkUserId]
 * @param {string} [filters.action]
 * @param {string} [filters.entityType]
 * @param {number|string} [filters.entityId]
 * @param {string} [filters.requestId]
 * @param {string} [filters.startDate]
 * @param {string} [filters.endDate]
 * @param {number} [filters.page=1]
 * @param {number} [filters.limit=25]
 * @returns {Promise<{ logs: Array, total: number, page: number, limit: number, totalPages: number }>}
 */
async function getAuditLogs(filters = {}) {
  const whereClauses = [];
  const params = [];

  if (filters.clerkUserId && String(filters.clerkUserId).trim()) {
    whereClauses.push('l.clerk_user_id = ?');
    params.push(String(filters.clerkUserId).trim());
  }

  if (filters.action && String(filters.action).trim()) {
    whereClauses.push('l.action = ?');
    params.push(String(filters.action).trim());
  }

  if (filters.entityType && String(filters.entityType).trim()) {
    whereClauses.push('l.entity_type = ?');
    params.push(String(filters.entityType).trim());
  }

  if (filters.entityId !== undefined && filters.entityId !== null && String(filters.entityId).trim() !== '') {
    whereClauses.push('l.entity_id = ?');
    params.push(Number(filters.entityId));
  }

  if (filters.requestId && String(filters.requestId).trim()) {
    whereClauses.push('l.request_id LIKE ?');
    params.push(`%${String(filters.requestId).trim()}%`);
  }

  if (filters.startDate && String(filters.startDate).trim()) {
    whereClauses.push('l.created_at >= ?');
    params.push(`${String(filters.startDate).trim()} 00:00:00`);
  }

  if (filters.endDate && String(filters.endDate).trim()) {
    whereClauses.push('l.created_at <= ?');
    params.push(`${String(filters.endDate).trim()} 23:59:59`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Count total matching records
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM admin_activity_logs l
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
      l.id,
      l.clerk_user_id,
      l.action,
      l.entity_type,
      l.entity_id,
      l.old_values,
      l.new_values,
      l.request_id,
      l.ip_address,
      l.user_agent,
      l.created_at,
      ap.display_name AS admin_display_name,
      ap.role AS admin_role
    FROM admin_activity_logs l
    LEFT JOIN admin_profiles ap ON l.clerk_user_id = ap.clerk_user_id
    ${whereSql}
    ORDER BY l.created_at DESC, l.id DESC
    LIMIT ? OFFSET ?
  `;

  const queryParams = [...params, rawLimit, offset];
  const [rows] = await pool.query(selectQuery, queryParams);

  const logs = rows.map((r) => {
    let parsedOld = r.old_values;
    let parsedNew = r.new_values;

    if (typeof parsedOld === 'string') {
      try {
        parsedOld = JSON.parse(parsedOld);
      } catch (e) {
        // Keep string if not JSON
      }
    }
    if (typeof parsedNew === 'string') {
      try {
        parsedNew = JSON.parse(parsedNew);
      } catch (e) {
        // Keep string if not JSON
      }
    }

    return {
      id: r.id,
      clerk_user_id: r.clerk_user_id,
      action: r.action,
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      old_values: parsedOld,
      new_values: parsedNew,
      request_id: r.request_id,
      ip_address: r.ip_address,
      user_agent: r.user_agent,
      created_at: r.created_at,
      admin_display_name: r.admin_display_name || null,
      admin_role: r.admin_role || null,
    };
  });

  return {
    logs,
    pagination: {
      total,
      page,
      limit: rawLimit,
      totalPages,
    },
  };
}

/**
 * Retrieves distinct action and entity type values for UI filter dropdowns.
 * @returns {Promise<{ actions: string[], entityTypes: string[] }>}
 */
async function getAuditLogFilterOptions() {
  const [actionRows] = await pool.query(
    'SELECT DISTINCT action FROM admin_activity_logs WHERE action IS NOT NULL ORDER BY action ASC'
  );
  const [entityRows] = await pool.query(
    'SELECT DISTINCT entity_type FROM admin_activity_logs WHERE entity_type IS NOT NULL ORDER BY entity_type ASC'
  );

  return {
    actions: actionRows.map((r) => r.action),
    entityTypes: entityRows.map((r) => r.entity_type),
  };
}

module.exports = {
  getAuditLogs,
  getAuditLogFilterOptions,
};
