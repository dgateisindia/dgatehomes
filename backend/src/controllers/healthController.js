const healthService = require('../services/healthService');

/**
 * GET /api/health
 * Returns health status of the application and database connectivity.
 */
async function getHealth(req, res, next) {
  try {
    const { isHealthy, response } = await healthService.checkHealth();
    const statusCode = isHealthy ? 200 : 503;
    return res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth,
};
