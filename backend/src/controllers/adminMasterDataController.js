const adminMasterDataService = require('../services/adminMasterDataService');

function getAdminContext(req) {
  return {
    clerkUserId: req.admin?.clerk_user_id || req.admin?.clerkUserId || 'system',
    displayName: req.admin?.display_name || null,
    ipAddress: req.ip || req.connection?.remoteAddress || null,
    userAgent: req.get('user-agent') || null,
  };
}

/* ==========================================================================
   1. AMENITIES
   ========================================================================== */

async function listAmenities(req, res, next) {
  try {
    const data = await adminMasterDataService.listAmenities(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function createAmenity(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const data = await adminMasterDataService.createAmenity(req.body, adminContext);
    return res.status(201).json({
      success: true,
      message: 'Amenity created successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateAmenity(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const data = await adminMasterDataService.updateAmenity(req.params.id, req.body, adminContext);
    return res.status(200).json({
      success: true,
      message: 'Amenity updated successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function toggleAmenityStatus(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const isActive = req.body.is_active;
    const data = await adminMasterDataService.toggleAmenityStatus(req.params.id, isActive, adminContext);
    return res.status(200).json({
      success: true,
      message: `Amenity ${data.is_active ? 'activated' : 'deactivated'} successfully.`,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/* ==========================================================================
   2. PROPERTY TYPES
   ========================================================================== */

async function listPropertyTypes(req, res, next) {
  try {
    const data = await adminMasterDataService.listPropertyTypes(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function createPropertyType(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const data = await adminMasterDataService.createPropertyType(req.body, adminContext);
    return res.status(201).json({
      success: true,
      message: 'Property type created successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function updatePropertyType(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const data = await adminMasterDataService.updatePropertyType(req.params.id, req.body, adminContext);
    return res.status(200).json({
      success: true,
      message: 'Property type updated successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function togglePropertyTypeStatus(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const isActive = req.body.is_active;
    const data = await adminMasterDataService.togglePropertyTypeStatus(req.params.id, isActive, adminContext);
    return res.status(200).json({
      success: true,
      message: `Property type ${data.is_active ? 'activated' : 'deactivated'} successfully.`,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/* ==========================================================================
   3. PROPERTY TAGS
   ========================================================================== */

async function listTags(req, res, next) {
  try {
    const data = await adminMasterDataService.listTags(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function createTag(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const data = await adminMasterDataService.createTag(req.body, adminContext);
    return res.status(201).json({
      success: true,
      message: 'Property tag created successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateTag(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const data = await adminMasterDataService.updateTag(req.params.id, req.body, adminContext);
    return res.status(200).json({
      success: true,
      message: 'Property tag updated successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function toggleTagStatus(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const isActive = req.body.is_active;
    const data = await adminMasterDataService.toggleTagStatus(req.params.id, isActive, adminContext);
    return res.status(200).json({
      success: true,
      message: `Property tag ${data.is_active ? 'activated' : 'deactivated'} successfully.`,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/* ==========================================================================
   4. PROJECTS
   ========================================================================== */

async function listProjects(req, res, next) {
  try {
    const data = await adminMasterDataService.listProjects(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function getProjectById(req, res, next) {
  try {
    const data = await adminMasterDataService.getProjectById(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function createProject(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const data = await adminMasterDataService.createProject(req.body, adminContext);
    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const data = await adminMasterDataService.updateProject(req.params.id, req.body, adminContext);
    return res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProjectStatus(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const status = req.body.status;
    const data = await adminMasterDataService.updateProjectStatus(req.params.id, status, adminContext);
    return res.status(200).json({
      success: true,
      message: `Project status updated to ${data.status}.`,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

/* ==========================================================================
   5. PROJECT UNIT TYPES
   ========================================================================== */

async function listProjectUnitTypes(req, res, next) {
  try {
    const data = await adminMasterDataService.listProjectUnitTypes(req.params.projectId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function createProjectUnitType(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const data = await adminMasterDataService.createProjectUnitType(
      req.params.projectId,
      req.body,
      adminContext
    );
    return res.status(201).json({
      success: true,
      message: 'Unit type created successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProjectUnitType(req, res, next) {
  try {
    const adminContext = getAdminContext(req);
    const data = await adminMasterDataService.updateProjectUnitType(
      req.params.projectId,
      req.params.unitTypeId,
      req.body,
      adminContext
    );
    return res.status(200).json({
      success: true,
      message: 'Unit type updated successfully.',
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  // Amenities
  listAmenities,
  createAmenity,
  updateAmenity,
  toggleAmenityStatus,
  // Property Types
  listPropertyTypes,
  createPropertyType,
  updatePropertyType,
  togglePropertyTypeStatus,
  // Property Tags
  listTags,
  createTag,
  updateTag,
  toggleTagStatus,
  // Projects
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  updateProjectStatus,
  // Project Unit Types
  listProjectUnitTypes,
  createProjectUnitType,
  updateProjectUnitType,
};
