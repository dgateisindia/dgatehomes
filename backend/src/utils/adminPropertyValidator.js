const ALLOWED_ADMIN_SORT_VALUES = ['newest', 'oldest', 'price_asc', 'price_desc', 'updated_desc'];
const ALLOWED_STATUSES = ['draft', 'published', 'archived'];
const ALLOWED_LISTING_TYPES = ['sale', 'rent'];
const ALLOWED_AREA_UNITS = ['sqft', 'sqm', 'acre', 'gunta'];

/**
 * Validates and sanitizes query parameters for GET /api/admin/properties.
 *
 * @param {Record<string, any>} query
 * @returns {{ isValid: boolean, errors?: string[], data?: Object }}
 */
function validateAdminPropertyListQuery(query = {}) {
  const errors = [];
  const filters = {};
  const pagination = {
    page: 1,
    limit: 12,
    offset: 0,
  };
  let sort = 'newest';

  // 1. Page
  if (query.page !== undefined && query.page !== '') {
    const parsedPage = Number(query.page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      errors.push('page must be an integer greater than or equal to 1');
    } else {
      pagination.page = parsedPage;
    }
  }

  // 2. Limit (1..50, default 12)
  if (query.limit !== undefined && query.limit !== '') {
    const parsedLimit = Number(query.limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      errors.push('limit must be an integer between 1 and 50');
    } else {
      pagination.limit = parsedLimit;
    }
  }

  pagination.offset = (pagination.page - 1) * pagination.limit;

  // 3. Sort
  if (query.sort !== undefined && query.sort !== '') {
    const sortVal = String(query.sort).toLowerCase().trim();
    if (!ALLOWED_ADMIN_SORT_VALUES.includes(sortVal)) {
      errors.push(`sort must be one of: ${ALLOWED_ADMIN_SORT_VALUES.join(', ')}`);
    } else {
      sort = sortVal;
    }
  }

  // 4. Search (title or location)
  if (query.search !== undefined && query.search !== '') {
    const searchStr = String(query.search).trim();
    if (searchStr.length > 200) {
      errors.push('search query must not exceed 200 characters');
    } else if (searchStr.length > 0) {
      filters.search = searchStr;
    }
  }

  // 5. Status ('draft' | 'published' | 'archived')
  if (query.status !== undefined && query.status !== '') {
    const statusStr = String(query.status).toLowerCase().trim();
    if (!ALLOWED_STATUSES.includes(statusStr)) {
      errors.push(`status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
    } else {
      filters.status = statusStr;
    }
  }

  // 6. property_type_id
  if (query.property_type_id !== undefined && query.property_type_id !== '') {
    const ptId = Number(query.property_type_id);
    if (!Number.isInteger(ptId) || ptId < 1) {
      errors.push('property_type_id must be a positive integer');
    } else {
      filters.property_type_id = ptId;
    }
  }

  // 7. listing_type ('sale' | 'rent')
  if (query.listing_type !== undefined && query.listing_type !== '') {
    const lt = String(query.listing_type).toLowerCase().trim();
    if (!ALLOWED_LISTING_TYPES.includes(lt)) {
      errors.push("listing_type must be either 'sale' or 'rent'");
    } else {
      filters.listing_type = lt;
    }
  }

  // 8. featured
  if (query.featured !== undefined && query.featured !== '') {
    const featStr = String(query.featured).toLowerCase().trim();
    if (featStr === 'true' || featStr === '1') {
      filters.featured = 1;
    } else if (featStr === 'false' || featStr === '0') {
      filters.featured = 0;
    } else {
      errors.push('featured must be a boolean (true/false or 1/0)');
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    data: {
      filters,
      pagination,
      sort,
    },
  };
}

/**
 * Helper to validate YYYY-MM-DD date string or ISO date string.
 */
function parseOptionalDate(val, fieldName, errors, isDateTime = false) {
  if (val === undefined || val === null || String(val).trim() === '') {
    return null;
  }

  const str = String(val).trim();
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) {
    errors.push(`${fieldName} must be a valid date`);
    return null;
  }

  if (isDateTime) {
    // Format as YYYY-MM-DD HH:MM:SS for MySQL DATETIME
    return parsed.toISOString().slice(0, 19).replace('T', ' ');
  }

  // Format as YYYY-MM-DD for MySQL DATE
  return parsed.toISOString().slice(0, 10);
}

/**
 * Validates and sanitizes request body for POST /api/admin/properties and PUT /api/admin/properties/:id.
 *
 * @param {Record<string, any>} body
 * @returns {{ isValid: boolean, errors?: string[], data?: Object }}
 */
function validateAdminPropertyPayload(body = {}) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Invalid request body'] };
  }

  // 1. Title
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    errors.push('title is required');
  } else if (title.length < 3 || title.length > 200) {
    errors.push('title must be between 3 and 200 characters');
  }

  // 2. Description
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  if (!description) {
    errors.push('description is required');
  } else if (description.length < 10) {
    errors.push('description must be at least 10 characters');
  }

  // 3. Price
  const price = body.price !== undefined && body.price !== '' ? Number(body.price) : NaN;
  if (!Number.isFinite(price) || price <= 0) {
    errors.push('price is required and must be a positive number');
  }

  // 4. Location
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  if (!location) {
    errors.push('location is required');
  } else if (location.length > 150) {
    errors.push('location must not exceed 150 characters');
  }

  // 5. Address
  const address = typeof body.address === 'string' ? body.address.trim() : '';
  if (!address) {
    errors.push('address is required');
  } else if (address.length > 500) {
    errors.push('address must not exceed 500 characters');
  }

  // 6. property_type_id
  const propertyTypeId =
    body.property_type_id !== undefined && body.property_type_id !== ''
      ? Number(body.property_type_id)
      : NaN;
  if (!Number.isInteger(propertyTypeId) || propertyTypeId < 1) {
    errors.push('property_type_id is required and must be a valid positive integer');
  }

  // 7. listing_type
  const listingType =
    typeof body.listing_type === 'string' ? body.listing_type.toLowerCase().trim() : '';
  if (!ALLOWED_LISTING_TYPES.includes(listingType)) {
    errors.push("listing_type is required and must be either 'sale' or 'rent'");
  }

  // 8. bedrooms (optional)
  let bedrooms = null;
  if (body.bedrooms !== undefined && body.bedrooms !== null && String(body.bedrooms).trim() !== '') {
    const parsed = Number(body.bedrooms);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      errors.push('bedrooms must be a non-negative integer');
    } else {
      bedrooms = parsed;
    }
  }

  // 9. bathrooms (optional)
  let bathrooms = null;
  if (body.bathrooms !== undefined && body.bathrooms !== null && String(body.bathrooms).trim() !== '') {
    const parsed = Number(body.bathrooms);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      errors.push('bathrooms must be a non-negative integer');
    } else {
      bathrooms = parsed;
    }
  }

  // 10. area (optional)
  let area = null;
  if (body.area !== undefined && body.area !== null && String(body.area).trim() !== '') {
    const parsed = Number(body.area);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      errors.push('area must be a positive number');
    } else {
      area = parsed;
    }
  }

  // 11. area_unit (optional, defaults to 'sqft')
  let areaUnit = 'sqft';
  if (body.area_unit !== undefined && body.area_unit !== null && String(body.area_unit).trim() !== '') {
    const unitVal = String(body.area_unit).toLowerCase().trim();
    if (!ALLOWED_AREA_UNITS.includes(unitVal)) {
      errors.push(`area_unit must be one of: ${ALLOWED_AREA_UNITS.join(', ')}`);
    } else {
      areaUnit = unitVal;
    }
  }

  // 12. units_available (optional)
  let unitsAvailable = null;
  if (
    body.units_available !== undefined &&
    body.units_available !== null &&
    String(body.units_available).trim() !== ''
  ) {
    const parsed = Number(body.units_available);
    if (!Number.isInteger(parsed) || parsed < 0) {
      errors.push('units_available must be a non-negative integer');
    } else {
      unitsAvailable = parsed;
    }
  }

  // 13. Dates
  const listingDate = parseOptionalDate(body.listing_date, 'listing_date', errors, false);
  const possessionDate = parseOptionalDate(body.possession_date, 'possession_date', errors, false);
  const expiresAt = parseOptionalDate(body.expires_at, 'expires_at', errors, true);

  // 14. is_featured
  let isFeatured = 0;
  if (body.is_featured !== undefined && body.is_featured !== null) {
    isFeatured =
      body.is_featured === true ||
      body.is_featured === 1 ||
      String(body.is_featured).toLowerCase() === 'true' ||
      String(body.is_featured) === '1'
        ? 1
        : 0;
  }

  // 15. project_id (optional)
  let projectId = null;
  if (body.project_id !== undefined && body.project_id !== null && String(body.project_id).trim() !== '') {
    const parsed = Number(body.project_id);
    if (!Number.isInteger(parsed) || parsed < 1) {
      errors.push('project_id must be a positive integer');
    } else {
      projectId = parsed;
    }
  }

  // 16. project_unit_type_id (optional)
  let projectUnitTypeId = null;
  if (
    body.project_unit_type_id !== undefined &&
    body.project_unit_type_id !== null &&
    String(body.project_unit_type_id).trim() !== ''
  ) {
    const parsed = Number(body.project_unit_type_id);
    if (!Number.isInteger(parsed) || parsed < 1) {
      errors.push('project_unit_type_id must be a positive integer');
    } else {
      projectUnitTypeId = parsed;
    }
  }

  // 17. amenity_ids (array of positive integers)
  let amenityIds = [];
  if (body.amenity_ids !== undefined && body.amenity_ids !== null) {
    if (!Array.isArray(body.amenity_ids)) {
      errors.push('amenity_ids must be an array of positive integers');
    } else {
      const parsedIds = [];
      for (const rawId of body.amenity_ids) {
        const num = Number(rawId);
        if (!Number.isInteger(num) || num < 1) {
          errors.push('All values in amenity_ids must be positive integers');
          break;
        }
        parsedIds.push(num);
      }
      amenityIds = [...new Set(parsedIds)];
    }
  }

  // 18. tag_ids (array of positive integers)
  let tagIds = [];
  if (body.tag_ids !== undefined && body.tag_ids !== null) {
    if (!Array.isArray(body.tag_ids)) {
      errors.push('tag_ids must be an array of positive integers');
    } else {
      const parsedIds = [];
      for (const rawId of body.tag_ids) {
        const num = Number(rawId);
        if (!Number.isInteger(num) || num < 1) {
          errors.push('All values in tag_ids must be positive integers');
          break;
        }
        parsedIds.push(num);
      }
      tagIds = [...new Set(parsedIds)];
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    data: {
      title,
      description,
      price,
      location,
      address,
      property_type_id: propertyTypeId,
      listing_type: listingType,
      bedrooms,
      bathrooms,
      area,
      area_unit: areaUnit,
      units_available: unitsAvailable,
      listing_date: listingDate,
      possession_date: possessionDate,
      expires_at: expiresAt,
      is_featured: isFeatured,
      project_id: projectId,
      project_unit_type_id: projectUnitTypeId,
      amenity_ids: amenityIds,
      tag_ids: tagIds,
    },
  };
}

/**
 * Validates request body for PATCH /api/admin/properties/:id/status.
 *
 * @param {Record<string, any>} body
 * @returns {{ isValid: boolean, errors?: string[], data?: { status: string, reason: string | null } }}
 */
function validateStatusUpdatePayload(body = {}) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return { isValid: false, errors: ['Invalid request body'] };
  }

  const status = typeof body.status === 'string' ? body.status.toLowerCase().trim() : '';
  if (!ALLOWED_STATUSES.includes(status)) {
    errors.push(`status is required and must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }

  let reason = null;
  if (body.reason !== undefined && body.reason !== null && String(body.reason).trim() !== '') {
    const str = String(body.reason).trim();
    if (str.length > 500) {
      errors.push('reason must not exceed 500 characters');
    } else {
      reason = str;
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    data: {
      status,
      reason,
    },
  };
}

module.exports = {
  validateAdminPropertyListQuery,
  validateAdminPropertyPayload,
  validateStatusUpdatePayload,
  ALLOWED_STATUSES,
};
