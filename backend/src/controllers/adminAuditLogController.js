const adminAuditLogService = require('../services/adminAuditLogService');

/**
 * GET /api/admin/audit-logs
 * Retrieves paginated audit logs.
 * Protected by requireSuperAdmin.
 */
async function getAuditLogs(req, res) {
  try {
    const result = await adminAuditLogService.listAuditLogs(req.query);
    return res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('[AdminAuditLogController] Failed to fetch audit logs:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs.',
    });
  }
}

/**
 * GET /api/admin/audit-logs/filters
 * Retrieves distinct actions and entity types for filter dropdowns.
 */
async function getAuditLogFilters(req, res) {
  try {
    const filters = await adminAuditLogService.getFilterOptions();
    return res.status(200).json({
      success: true,
      data: filters,
    });
  } catch (error) {
    console.error('[AdminAuditLogController] Failed to fetch filter options:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve filter options.',
    });
  }
}

module.exports = {
  getAuditLogs,
  getAuditLogFilters,
};
