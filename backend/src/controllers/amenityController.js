const amenityService = require('../services/amenityService');

/**
 * GET /api/amenities
 * Public endpoint to fetch active amenities ordered by category ASC, sort_order ASC, name ASC.
 */
async function getAmenities(req, res, next) {
  try {
    const data = await amenityService.getActiveAmenities();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAmenities,
};
