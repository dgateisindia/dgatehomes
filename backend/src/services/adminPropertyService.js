const AppError = require('../utils/appError');
const { slugifyTitle } = require('../utils/slugHelper');
const {
  validateAdminPropertyListQuery,
  validateAdminPropertyPayload,
  validateStatusUpdatePayload,
} = require('../utils/adminPropertyValidator');
const adminPropertyRepository = require('../repositories/adminPropertyRepository');

/**
 * Validates all foreign-key references in a property payload before transaction execution.
 */
async function validateAndResolveForeignKeys(data) {
  // 1. Validate property_type_id
  const propertyType = await adminPropertyRepository.findActivePropertyTypeById(
    data.property_type_id
  );
  if (!propertyType) {
    throw new AppError('Invalid or inactive property_type_id', 400);
  }
  data.property_type_name = propertyType.name;

  // 2. Validate project_id if provided
  if (data.project_id !== null) {
    const project = await adminPropertyRepository.findProjectById(data.project_id);
    if (!project) {
      throw new AppError('Invalid project_id: project does not exist', 400);
    }
  }

  // 3. Validate project_unit_type_id if provided
  if (data.project_unit_type_id !== null) {
    const unitType = await adminPropertyRepository.findProjectUnitTypeById(
      data.project_unit_type_id
    );
    if (!unitType) {
      throw new AppError('Invalid project_unit_type_id: unit type does not exist', 400);
    }

    if (data.project_id !== null && Number(unitType.project_id) !== Number(data.project_id)) {
      throw new AppError(
        'project_unit_type_id does not belong to the specified project_id',
        400
      );
    }

    // Automatically link project_id if only unit_type_id was supplied
    if (data.project_id === null) {
      data.project_id = Number(unitType.project_id);
    }
  }

  // 4. Validate amenity_ids
  if (data.amenity_ids && data.amenity_ids.length > 0) {
    const validAmenityIds = await adminPropertyRepository.findValidActiveAmenityIds(
      data.amenity_ids
    );
    if (validAmenityIds.length !== data.amenity_ids.length) {
      throw new AppError('One or more amenity_ids are invalid or inactive', 400);
    }
  }

  // 5. Validate tag_ids
  if (data.tag_ids && data.tag_ids.length > 0) {
    const validTagIds = await adminPropertyRepository.findValidActiveTagIds(data.tag_ids);
    if (validTagIds.length !== data.tag_ids.length) {
      throw new AppError('One or more tag_ids are invalid or inactive', 400);
    }
  }
}

/**
 * Lists properties for admin management with filters, pagination, and sorting.
 */
async function getAdminProperties(rawQuery) {
  const validation = validateAdminPropertyListQuery(rawQuery);
  if (!validation.isValid) {
    throw new AppError(validation.errors.join('; '), 400);
  }

  const { filters, pagination, sort } = validation.data;
  const { rows, total } = await adminPropertyRepository.findAdminProperties({
    filters,
    pagination,
    sort,
  });

  const totalPages = total > 0 ? Math.ceil(total / pagination.limit) : 0;

  return {
    data: rows,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
    },
  };
}

/**
 * Gets full property details by ID for admin view/edit.
 */
async function getAdminPropertyById(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Property ID must be a valid positive integer', 400);
  }

  const bundle = await adminPropertyRepository.findAdminPropertyById(id);
  if (!bundle) {
    throw new AppError('Property not found', 404);
  }

  return bundle;
}

/**
 * Creates a new property in draft status within a MySQL transaction.
 */
async function createAdminProperty(rawBody, adminContext) {
  const validation = validateAdminPropertyPayload(rawBody);
  if (!validation.isValid) {
    throw new AppError(validation.errors.join('; '), 400);
  }

  const data = validation.data;
  await validateAndResolveForeignKeys(data);
  data.baseSlug = slugifyTitle(data.title);

  const propertyId = await adminPropertyRepository.createPropertyTransaction(data, adminContext);
  return adminPropertyRepository.findAdminPropertyById(propertyId);
}

/**
 * Updates an existing property, mappings, price history, and activity log within a MySQL transaction.
 */
async function updateAdminProperty(rawId, rawBody, adminContext) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Property ID must be a valid positive integer', 400);
  }

  const existingBundle = await adminPropertyRepository.findAdminPropertyById(id);
  if (!existingBundle) {
    throw new AppError('Property not found', 404);
  }

  const validation = validateAdminPropertyPayload(rawBody);
  if (!validation.isValid) {
    throw new AppError(validation.errors.join('; '), 400);
  }

  const data = validation.data;
  await validateAndResolveForeignKeys(data);
  data.baseSlug = slugifyTitle(data.title);

  await adminPropertyRepository.updatePropertyTransaction(
    id,
    data,
    existingBundle,
    adminContext
  );

  return adminPropertyRepository.findAdminPropertyById(id);
}

/**
 * Updates a property's status (draft | published | archived) within a MySQL transaction.
 */
async function updateAdminPropertyStatus(rawId, rawBody, adminContext) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Property ID must be a valid positive integer', 400);
  }

  const existingBundle = await adminPropertyRepository.findAdminPropertyById(id);
  if (!existingBundle) {
    throw new AppError('Property not found', 404);
  }

  const validation = validateStatusUpdatePayload(rawBody);
  if (!validation.isValid) {
    throw new AppError(validation.errors.join('; '), 400);
  }

  const { status, reason } = validation.data;

  await adminPropertyRepository.updatePropertyStatusTransaction(
    id,
    status,
    reason,
    existingBundle.property,
    adminContext
  );

  return adminPropertyRepository.findAdminPropertyById(id);
}

/**
 * Retrieves active tags for admin property form selectors.
 */
async function getAdminTags() {
  return adminPropertyRepository.findActiveTags();
}

/**
 * Retrieves projects and their unit types for admin property form selectors.
 */
async function getAdminProjects() {
  return adminPropertyRepository.findProjectsWithUnitTypes();
}

module.exports = {
  getAdminProperties,
  getAdminPropertyById,
  createAdminProperty,
  updateAdminProperty,
  updateAdminPropertyStatus,
  getAdminTags,
  getAdminProjects,
};
