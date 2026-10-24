const adminEnquiryService = require('../services/adminEnquiryService');

function getAdminContext(req) {
  return {
    clerkUserId: req.admin?.clerk_user_id || 'system',
    displayName: req.admin?.display_name || null,
    ipAddress: req.ip || req.connection?.remoteAddress || null,
    userAgent: req.get('user-agent') || null,
  };
}

/**
 * GET /api/admin/enquiries
 */
async function listEnquiries(req, res, next) {
  try {
    const result = await adminEnquiryService.listEnquiries(req.query);
    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/admin/enquiries/:id
 */
async function getEnquiryById(req, res, next) {
  try {
    const result = await adminEnquiryService.getEnquiryById(req.params.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/admin/enquiries/:id/status
 */
async function updateEnquiryStatus(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const result = await adminEnquiryService.updateEnquiryStatus(
      req.params.id,
      req.body,
      adminContext
    );
    return res.status(200).json({
      success: true,
      message: `Enquiry status updated to ${req.body.status}.`,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/admin/enquiries/:id/assign
 */
async function assignEnquiry(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const result = await adminEnquiryService.assignEnquiry(
      req.params.id,
      req.body,
      adminContext
    );
    return res.status(200).json({
      success: true,
      message: 'Enquiry assigned successfully.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/admin/enquiries/:id/follow-up
 */
async function addEnquiryFollowUp(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const result = await adminEnquiryService.addEnquiryFollowUp(
      req.params.id,
      req.body,
      adminContext
    );
    return res.status(200).json({
      success: true,
      message: 'Follow-up scheduled successfully.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/admin/enquiries/:id/note
 */
async function addEnquiryNote(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const result = await adminEnquiryService.addEnquiryNote(
      req.params.id,
      req.body,
      adminContext
    );
    return res.status(200).json({
      success: true,
      message: 'Note added successfully.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/admin/admins
 */
async function listActiveAdmins(req, res, next) {
  try {
    const admins = await adminEnquiryService.listActiveAdmins();
    return res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  assignEnquiry,
  addEnquiryFollowUp,
  addEnquiryNote,
  listActiveAdmins,
};
