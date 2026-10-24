const adminPropertyImageService = require('../services/adminPropertyImageService');

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
 * POST /api/admin/properties/:propertyId/images
 */
async function uploadImages(req, res, next) {
  try {
    const adminContext = buildAdminContext(req);
    const images = await adminPropertyImageService.uploadPropertyImages(
      req.params.propertyId,
      req.files || [],
      req.body || {},
      adminContext
    );

    return res.status(201).json({
      success: true,
      message: 'Images uploaded successfully.',
      data: images,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/admin/properties/:propertyId/images/reorder
 */
async function reorderImages(req, res, next) {
  try {
    const adminContext = buildAdminContext(req);
    const images = await adminPropertyImageService.reorderPropertyImages(
      req.params.propertyId,
      req.body,
      adminContext
    );

    return res.status(200).json({
      success: true,
      message: 'Images reordered successfully.',
      data: images,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/admin/properties/:propertyId/images/:imageId
 */
async function updateImageMetadata(req, res, next) {
  try {
    const adminContext = buildAdminContext(req);
    const images = await adminPropertyImageService.updatePropertyImageMetadata(
      req.params.propertyId,
      req.params.imageId,
      req.body,
      adminContext
    );

    return res.status(200).json({
      success: true,
      message: 'Image metadata updated successfully.',
      data: images,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/admin/properties/:propertyId/images/:imageId/cover
 */
async function setCoverImage(req, res, next) {
  try {
    const adminContext = buildAdminContext(req);
    const images = await adminPropertyImageService.setPropertyCoverImage(
      req.params.propertyId,
      req.params.imageId,
      adminContext
    );

    return res.status(200).json({
      success: true,
      message: 'Cover image updated successfully.',
      data: images,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/admin/properties/:propertyId/images/:imageId
 */
async function deleteImage(req, res, next) {
  try {
    const adminContext = buildAdminContext(req);
    const images = await adminPropertyImageService.deletePropertyImage(
      req.params.propertyId,
      req.params.imageId,
      adminContext
    );

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully.',
      data: images,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  uploadImages,
  reorderImages,
  updateImageMetadata,
  setCoverImage,
  deleteImage,
};
