const propertyService = require('../services/propertyService');
const { validatePropertyQueryParams } = require('../utils/propertyValidator');

/**
 * GET /api/properties
 * Public endpoint to fetch published properties with filters, pagination, and sorting.
 */
async function getProperties(req, res, next) {
  try {
    const validation = validatePropertyQueryParams(req.query);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${validation.errors.join('; ')}`,
      });
    }

    const result = await propertyService.getPublicProperties(validation.data);

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/properties/:slug
 * Public endpoint to fetch single published property details by slug.
 */
async function getPropertyBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property slug',
      });
    }

    const result = await propertyService.getPropertyBySlug(slug.trim());

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/properties/types
 * Public endpoint to fetch all available property types.
 */
async function getPropertyTypes(req, res, next) {
  try {
    const types = await propertyService.getPropertyTypes();
    return res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProperties,
  getPropertyBySlug,
  getPropertyTypes,
};
