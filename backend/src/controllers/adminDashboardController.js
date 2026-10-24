const adminDashboardService = require('../services/adminDashboardService');

/**
 * Controller for retrieving admin dashboard summary data.
 * Endpoint: GET /api/admin/dashboard/summary
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function getDashboardSummary(req, res, next) {
  try {
    const data = await adminDashboardService.getDashboardSummary();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[Admin Dashboard] Failed to fetch summary metrics:', error.message);
    return next(error);
  }
}

module.exports = {
  getDashboardSummary,
};
