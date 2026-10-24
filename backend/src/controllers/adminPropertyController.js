const adminPropertyService = require('../services/adminPropertyService');

/**
 * Extracts safe admin audit context from the Express request.
 */
function buildAdminContext(req) {
  return {
    clerkUserId: req.admin.clerkUserId,
    ipAddress: req.ip ? String(req.ip).slice(0, 45) : null,
    userAgent:
      req.headers && req.headers['user-agent']
        ? String(req.headers['user-agent']).slice(0, 500)
        : null,
  };
}

/**
 * GET /api/admin/properties
 */
async function listProperties(req, res, next) {
  try {
    const result = await adminPropertyService.getAdminProperties(req.query);
    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/admin/properties/:id
 */
async function getPropertyById(req, res, next) {
  try {
    const data = await adminPropertyService.getAdminPropertyById(req.params.id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/admin/properties
 */
async function createProperty(req, res, next) {
  try {
    const adminContext = buildAdminContext(req);
    const data = await adminPropertyService.createAdminProperty(req.body, adminContext);
    return res.status(201).json({
      success: true,
      message: 'Property created successfully as draft.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /api/admin/properties/:id
 */
async function updateProperty(req, res, next) {
  try {
    const adminContext = buildAdminContext(req);
    const data = await adminPropertyService.updateAdminProperty(
      req.params.id,
      req.body,
      adminContext
    );
    return res.status(200).json({
      success: true,
      message: 'Property updated successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/admin/properties/:id/status
 */
async function updatePropertyStatus(req, res, next) {
  try {
    const adminContext = buildAdminContext(req);
    const data = await adminPropertyService.updateAdminPropertyStatus(
      req.params.id,
      req.body,
      adminContext
    );
    return res.status(200).json({
      success: true,
      message: `Property status updated to ${data.property.status}.`,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/admin/tags
 */
async function listTags(req, res, next) {
  try {
    const data = await adminPropertyService.getAdminTags();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/admin/projects
 */
async function listProjects(req, res, next) {
  try {
    const data = await adminPropertyService.getAdminProjects();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  listTags,
  listProjects,
};
