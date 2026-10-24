const adminAuditLogRepository = require('../repositories/adminAuditLogRepository');

/**
 * Service to retrieve audit logs with sanitized filters.
 *
 * @param {Object} queryParams
 * @returns {Promise<Object>}
 */
async function listAuditLogs(queryParams = {}) {
  const filters = {
    clerkUserId: queryParams.clerk_user_id || queryParams.clerkUserId,
    action: queryParams.action,
    entityType: queryParams.entity_type || queryParams.entityType,
    entityId: queryParams.entity_id || queryParams.entityId,
    requestId: queryParams.request_id || queryParams.requestId,
    startDate: queryParams.start_date || queryParams.startDate,
    endDate: queryParams.end_date || queryParams.endDate,
    page: parseInt(queryParams.page, 10) || 1,
    limit: parseInt(queryParams.limit, 10) || 25,
  };

  return adminAuditLogRepository.getAuditLogs(filters);
}

/**
 * Service to retrieve distinct filter options for audit log search.
 *
 * @returns {Promise<Object>}
 */
async function getFilterOptions() {
  return adminAuditLogRepository.getAuditLogFilterOptions();
}

module.exports = {
  listAuditLogs,
  getFilterOptions,
};
