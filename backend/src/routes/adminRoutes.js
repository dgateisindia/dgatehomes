const express = require('express');
const { clerkMiddleware } = require('@clerk/express');
const { requireAuth, requireAdmin, requireSuperAdmin } = require('../middleware/adminAuth');
const { uploadPropertyImagesMiddleware } = require('../middleware/uploadMiddleware');
const adminAuthController = require('../controllers/adminAuthController');
const adminDashboardController = require('../controllers/adminDashboardController');
const adminPropertyController = require('../controllers/adminPropertyController');
const adminPropertyImageController = require('../controllers/adminPropertyImageController');
const adminEnquiryController = require('../controllers/adminEnquiryController');
const adminMasterDataController = require('../controllers/adminMasterDataController');
const adminSettingsController = require('../controllers/adminSettingsController');
const adminAuditLogController = require('../controllers/adminAuditLogController');
const adminSecurityEventController = require('../controllers/adminSecurityEventController');

const router = express.Router();

// Apply Clerk middleware to parse session cookies or Authorization: Bearer JWTs
router.use(clerkMiddleware());

/**
 * GET /api/admin/me
 * Protected endpoint returning the authenticated and authorized admin's profile.
 */
router.get('/me', requireAuth, adminAuthController.getCurrentAdmin);

/**
 * GET /api/admin/dashboard/summary
 * Protected endpoint returning aggregate metrics and recent activities for the admin dashboard.
 */
router.get(
  '/dashboard/summary',
  requireAuth,
  requireAdmin,
  adminDashboardController.getDashboardSummary
);

/**
 * Admin Selector Endpoints
 */
router.get('/admins', requireAuth, requireAdmin, adminEnquiryController.listActiveAdmins);

/**
 * Admin Master Data Management Endpoints
 */
// 1. Amenities
router.get('/amenities', requireAuth, requireAdmin, adminMasterDataController.listAmenities);
router.post('/amenities', requireAuth, requireAdmin, adminMasterDataController.createAmenity);
router.put('/amenities/:id', requireAuth, requireAdmin, adminMasterDataController.updateAmenity);
router.patch('/amenities/:id/status', requireAuth, requireAdmin, adminMasterDataController.toggleAmenityStatus);

// 2. Property Types
router.get('/property-types', requireAuth, requireAdmin, adminMasterDataController.listPropertyTypes);
router.post('/property-types', requireAuth, requireAdmin, adminMasterDataController.createPropertyType);
router.put('/property-types/:id', requireAuth, requireAdmin, adminMasterDataController.updatePropertyType);
router.patch('/property-types/:id/status', requireAuth, requireAdmin, adminMasterDataController.togglePropertyTypeStatus);

// 3. Property Tags
router.get('/tags', requireAuth, requireAdmin, adminMasterDataController.listTags);
router.post('/tags', requireAuth, requireAdmin, adminMasterDataController.createTag);
router.put('/tags/:id', requireAuth, requireAdmin, adminMasterDataController.updateTag);
router.patch('/tags/:id/status', requireAuth, requireAdmin, adminMasterDataController.toggleTagStatus);

// 4. Projects & Nested Unit Types
router.get('/projects', requireAuth, requireAdmin, adminMasterDataController.listProjects);
router.get('/projects/:id', requireAuth, requireAdmin, adminMasterDataController.getProjectById);
router.post('/projects', requireAuth, requireAdmin, adminMasterDataController.createProject);
router.put('/projects/:id', requireAuth, requireAdmin, adminMasterDataController.updateProject);
router.patch('/projects/:id/status', requireAuth, requireAdmin, adminMasterDataController.updateProjectStatus);

router.get('/projects/:projectId/unit-types', requireAuth, requireAdmin, adminMasterDataController.listProjectUnitTypes);
router.post('/projects/:projectId/unit-types', requireAuth, requireAdmin, adminMasterDataController.createProjectUnitType);
router.put('/projects/:projectId/unit-types/:unitTypeId', requireAuth, requireAdmin, adminMasterDataController.updateProjectUnitType);

/**
 * Admin Property Management Endpoints
 */
router.get('/properties', requireAuth, requireAdmin, adminPropertyController.listProperties);
router.get('/properties/:id', requireAuth, requireAdmin, adminPropertyController.getPropertyById);
router.post('/properties', requireAuth, requireAdmin, adminPropertyController.createProperty);
router.put('/properties/:id', requireAuth, requireAdmin, adminPropertyController.updateProperty);
router.patch(
  '/properties/:id/status',
  requireAuth,
  requireAdmin,
  adminPropertyController.updatePropertyStatus
);

/**
 * Admin Property Image Management Endpoints
 * Note: /reorder is mounted before /:imageId to prevent route parameter collision.
 */
router.post(
  '/properties/:propertyId/images',
  requireAuth,
  requireAdmin,
  uploadPropertyImagesMiddleware,
  adminPropertyImageController.uploadImages
);
router.patch(
  '/properties/:propertyId/images/reorder',
  requireAuth,
  requireAdmin,
  adminPropertyImageController.reorderImages
);
router.patch(
  '/properties/:propertyId/images/:imageId',
  requireAuth,
  requireAdmin,
  adminPropertyImageController.updateImageMetadata
);
router.patch(
  '/properties/:propertyId/images/:imageId/cover',
  requireAuth,
  requireAdmin,
  adminPropertyImageController.setCoverImage
);
router.delete(
  '/properties/:propertyId/images/:imageId',
  requireAuth,
  requireAdmin,
  adminPropertyImageController.deleteImage
);

/**
 * Admin Enquiry Management Endpoints
 */
router.get('/enquiries', requireAuth, requireAdmin, adminEnquiryController.listEnquiries);
router.get('/enquiries/:id', requireAuth, requireAdmin, adminEnquiryController.getEnquiryById);
router.patch(
  '/enquiries/:id/status',
  requireAuth,
  requireAdmin,
  adminEnquiryController.updateEnquiryStatus
);
router.patch(
  '/enquiries/:id/assign',
  requireAuth,
  requireAdmin,
  adminEnquiryController.assignEnquiry
);
router.post(
  '/enquiries/:id/follow-up',
  requireAuth,
  requireAdmin,
  adminEnquiryController.addEnquiryFollowUp
);
router.post(
  '/enquiries/:id/note',
  requireAuth,
  requireAdmin,
  adminEnquiryController.addEnquiryNote
);

/**
 * Admin Application Settings Endpoint (Read-only configuration)
 */
router.get('/settings', requireAuth, requireAdmin, adminSettingsController.getSettings);

/**
 * Super Admin Operational & Observability Endpoints
 */
// Audit Logs (admin_activity_logs)
router.get('/audit-logs', requireAuth, requireSuperAdmin, adminAuditLogController.getAuditLogs);
router.get(
  '/audit-logs/filters',
  requireAuth,
  requireSuperAdmin,
  adminAuditLogController.getAuditLogFilters
);

// Security Events (security_events)
router.get(
  '/security-events',
  requireAuth,
  requireSuperAdmin,
  adminSecurityEventController.getSecurityEvents
);
router.get(
  '/security-events/filters',
  requireAuth,
  requireSuperAdmin,
  adminSecurityEventController.getSecurityEventFilters
);

module.exports = router;

