const adminSecurityEventService = require('../services/adminSecurityEventService');

/**
 * GET /api/admin/security-events
 * Retrieves paginated security events.
 * Protected by requireSuperAdmin.
 */
async function getSecurityEvents(req, res) {
  try {
    const result = await adminSecurityEventService.listSecurityEvents(req.query);
    return res.status(200).json({
      success: true,
      data: result.events,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('[AdminSecurityEventController] Failed to fetch security events:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve security events.',
    });
  }
}

/**
 * GET /api/admin/security-events/filters
 * Retrieves distinct event types and severities for filter dropdowns.
 */
async function getSecurityEventFilters(req, res) {
  try {
    const filters = await adminSecurityEventService.getFilterOptions();
    return res.status(200).json({
      success: true,
      data: filters,
    });
  } catch (error) {
    console.error('[AdminSecurityEventController] Failed to fetch filter options:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve security filter options.',
    });
  }
}

module.exports = {
  getSecurityEvents,
  getSecurityEventFilters,
};
