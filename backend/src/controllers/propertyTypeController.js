const propertyTypeService = require('../services/propertyTypeService');

/**
 * GET /api/property-types
 * Public endpoint to fetch active property types ordered by sort_order ASC, name ASC.
 */
async function getPropertyTypes(req, res, next) {
  try {
    const data = await propertyTypeService.getActivePropertyTypes();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPropertyTypes,
};
