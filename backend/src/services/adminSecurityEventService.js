const adminSecurityEventRepository = require('../repositories/adminSecurityEventRepository');

/**
 * Service to retrieve security events with sanitized filters.
 *
 * @param {Object} queryParams
 * @returns {Promise<Object>}
 */
async function listSecurityEvents(queryParams = {}) {
  const filters = {
    eventType: queryParams.event_type || queryParams.eventType,
    severity: queryParams.severity,
    clerkUserId: queryParams.clerk_user_id || queryParams.clerkUserId,
    requestId: queryParams.request_id || queryParams.requestId,
    startDate: queryParams.start_date || queryParams.startDate,
    endDate: queryParams.end_date || queryParams.endDate,
    page: parseInt(queryParams.page, 10) || 1,
    limit: parseInt(queryParams.limit, 10) || 25,
  };

  return adminSecurityEventRepository.getSecurityEvents(filters);
}

/**
 * Service to retrieve distinct filter options for security events.
 *
 * @returns {Promise<Object>}
 */
async function getFilterOptions() {
  return adminSecurityEventRepository.getSecurityEventFilterOptions();
}

module.exports = {
  listSecurityEvents,
  getFilterOptions,
};
