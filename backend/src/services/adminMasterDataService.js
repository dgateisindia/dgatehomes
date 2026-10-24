const AppError = require('../utils/appError');
const adminMasterDataRepository = require('../repositories/adminMasterDataRepository');
const adminPropertyRepository = require('../repositories/adminPropertyRepository');

const VALID_SEGMENTS = ['residential', 'commercial', 'land'];
const VALID_PROJECT_STATUSES = ['draft', 'published', 'archived'];
const VALID_AREA_UNITS = ['sqft', 'sqm', 'acre', 'gunta'];

/**
 * Generates a clean URL slug from text.
 */
function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates integer ID parameter.
 */
function parseId(rawId, label = 'ID') {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(`${label} must be a valid positive integer.`, 400);
  }
  return id;
}

/**
 * Formats a Date or date string to YYYY-MM-DD.
 */
function toYmd(val) {
  if (!val) return null;
  if (val instanceof Date) {
    if (Number.isNaN(val.getTime())) return null;
    return val.toISOString().slice(0, 10);
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/**
 * Validates date string YYYY-MM-DD.
 */
function validateDateString(val, fieldName) {
  if (!val) return null;
  const ymd = toYmd(val);
  if (!ymd) {
    throw new AppError(`${fieldName} must be a valid date in YYYY-MM-DD format.`, 400);
  }
  return ymd;
}

/* ==========================================================================
   1. AMENITIES SERVICE
   ========================================================================== */

async function listAmenities(filters = {}) {
  return adminMasterDataRepository.findAmenities(filters);
}

async function createAmenity(payload = {}, adminContext) {
  const name = payload.name ? String(payload.name).trim() : '';
  if (!name || name.length < 2 || name.length > 150) {
    throw new AppError('Amenity name is required (between 2 and 150 characters).', 400);
  }

  const slug = payload.slug ? slugify(payload.slug) : slugify(name);
  if (!slug) {
    throw new AppError('Could not generate a valid slug for the amenity.', 400);
  }

  // Duplicate check
  const duplicate = await adminMasterDataRepository.findAmenityByNameOrSlug(name, slug);
  if (duplicate) {
    throw new AppError('An amenity with this name or slug already exists.', 409);
  }

  const amenity = await adminMasterDataRepository.insertAmenity({
    name,
    slug,
    category: payload.category ? String(payload.category).trim() : 'General',
    icon_key: payload.icon_key ? String(payload.icon_key).trim() : null,
    is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
    sort_order: Number.isInteger(Number(payload.sort_order)) ? Math.max(0, Number(payload.sort_order)) : 0,
  });

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'AMENITY_CREATE',
    entityType: 'amenity',
    entityId: amenity.id,
    newValues: amenity,
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return amenity;
}

async function updateAmenity(rawId, payload = {}, adminContext) {
  const id = parseId(rawId, 'Amenity ID');
  const existing = await adminMasterDataRepository.findAmenityById(id);
  if (!existing) {
    throw new AppError('Amenity not found.', 404);
  }

  const name = payload.name ? String(payload.name).trim() : existing.name;
  if (!name || name.length < 2 || name.length > 150) {
    throw new AppError('Amenity name must be between 2 and 150 characters.', 400);
  }

  const slug = payload.slug ? slugify(payload.slug) : (payload.name ? slugify(name) : existing.slug);
  if (!slug) {
    throw new AppError('Could not generate a valid slug for the amenity.', 400);
  }

  const duplicate = await adminMasterDataRepository.findAmenityByNameOrSlug(name, slug, id);
  if (duplicate) {
    throw new AppError('An amenity with this name or slug already exists.', 409);
  }

  const updated = await adminMasterDataRepository.updateAmenity(id, {
    name,
    slug,
    category: payload.category !== undefined ? String(payload.category).trim() : existing.category,
    icon_key: payload.icon_key !== undefined ? (payload.icon_key ? String(payload.icon_key).trim() : null) : existing.icon_key,
    is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : existing.is_active,
    sort_order: payload.sort_order !== undefined ? Math.max(0, Number(payload.sort_order) || 0) : existing.sort_order,
  });

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'AMENITY_UPDATE',
    entityType: 'amenity',
    entityId: id,
    oldValues: existing,
    newValues: updated,
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return updated;
}

async function toggleAmenityStatus(rawId, isActive, adminContext) {
  const id = parseId(rawId, 'Amenity ID');
  const existing = await adminMasterDataRepository.findAmenityById(id);
  if (!existing) {
    throw new AppError('Amenity not found.', 404);
  }

  const updated = await adminMasterDataRepository.updateAmenityStatus(id, Boolean(isActive));

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'AMENITY_STATUS_UPDATE',
    entityType: 'amenity',
    entityId: id,
    oldValues: { is_active: existing.is_active },
    newValues: { is_active: updated.is_active },
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return updated;
}

/* ==========================================================================
   2. PROPERTY TYPES SERVICE
   ========================================================================== */

async function listPropertyTypes(filters = {}) {
  return adminMasterDataRepository.findPropertyTypes(filters);
}

async function createPropertyType(payload = {}, adminContext) {
  const name = payload.name ? String(payload.name).trim() : '';
  if (!name || name.length < 2 || name.length > 120) {
    throw new AppError('Property type name is required (between 2 and 120 characters).', 400);
  }

  const slug = payload.slug ? slugify(payload.slug) : slugify(name);
  if (!slug) {
    throw new AppError('Could not generate a valid slug for the property type.', 400);
  }

  const segment = payload.segment ? String(payload.segment).toLowerCase().trim() : '';
  if (!VALID_SEGMENTS.includes(segment)) {
    throw new AppError(`Invalid segment "${segment}". Allowed values: ${VALID_SEGMENTS.join(', ')}.`, 400);
  }

  const duplicate = await adminMasterDataRepository.findPropertyTypeByNameOrSlug(name, slug);
  if (duplicate) {
    throw new AppError('A property type with this name or slug already exists.', 409);
  }

  const propertyType = await adminMasterDataRepository.insertPropertyType({
    name,
    slug,
    segment,
    is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
    sort_order: Number.isInteger(Number(payload.sort_order)) ? Math.max(0, Number(payload.sort_order)) : 0,
  });

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'PROPERTY_TYPE_CREATE',
    entityType: 'property_type',
    entityId: propertyType.id,
    newValues: propertyType,
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return propertyType;
}

async function updatePropertyType(rawId, payload = {}, adminContext) {
  const id = parseId(rawId, 'Property Type ID');
  const existing = await adminMasterDataRepository.findPropertyTypeById(id);
  if (!existing) {
    throw new AppError('Property type not found.', 404);
  }

  const name = payload.name ? String(payload.name).trim() : existing.name;
  if (!name || name.length < 2 || name.length > 120) {
    throw new AppError('Property type name must be between 2 and 120 characters.', 400);
  }

  const slug = payload.slug ? slugify(payload.slug) : (payload.name ? slugify(name) : existing.slug);
  if (!slug) {
    throw new AppError('Could not generate a valid slug for the property type.', 400);
  }

  const segment = payload.segment ? String(payload.segment).toLowerCase().trim() : existing.segment;
  if (!VALID_SEGMENTS.includes(segment)) {
    throw new AppError(`Invalid segment "${segment}". Allowed values: ${VALID_SEGMENTS.join(', ')}.`, 400);
  }

  const duplicate = await adminMasterDataRepository.findPropertyTypeByNameOrSlug(name, slug, id);
  if (duplicate) {
    throw new AppError('A property type with this name or slug already exists.', 409);
  }

  const updated = await adminMasterDataRepository.updatePropertyType(id, {
    name,
    slug,
    segment,
    is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : existing.is_active,
    sort_order: payload.sort_order !== undefined ? Math.max(0, Number(payload.sort_order) || 0) : existing.sort_order,
  });

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'PROPERTY_TYPE_UPDATE',
    entityType: 'property_type',
    entityId: id,
    oldValues: existing,
    newValues: updated,
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return updated;
}

async function togglePropertyTypeStatus(rawId, isActive, adminContext) {
  const id = parseId(rawId, 'Property Type ID');
  const existing = await adminMasterDataRepository.findPropertyTypeById(id);
  if (!existing) {
    throw new AppError('Property type not found.', 404);
  }

  const updated = await adminMasterDataRepository.updatePropertyTypeStatus(id, Boolean(isActive));

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'PROPERTY_TYPE_STATUS_UPDATE',
    entityType: 'property_type',
    entityId: id,
    oldValues: { is_active: existing.is_active },
    newValues: { is_active: updated.is_active },
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return updated;
}

/* ==========================================================================
   3. PROPERTY TAGS SERVICE
   ========================================================================== */

async function listTags(filters = {}) {
  return adminMasterDataRepository.findTags(filters);
}

async function createTag(payload = {}, adminContext) {
  const name = payload.name ? String(payload.name).trim() : '';
  if (!name || name.length < 2 || name.length > 120) {
    throw new AppError('Tag name is required (between 2 and 120 characters).', 400);
  }

  const slug = payload.slug ? slugify(payload.slug) : slugify(name);
  if (!slug) {
    throw new AppError('Could not generate a valid slug for the tag.', 400);
  }

  const duplicate = await adminMasterDataRepository.findTagByNameOrSlug(name, slug);
  if (duplicate) {
    throw new AppError('A tag with this name or slug already exists.', 409);
  }

  const tag = await adminMasterDataRepository.insertTag({
    name,
    slug,
    is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
    sort_order: Number.isInteger(Number(payload.sort_order)) ? Math.max(0, Number(payload.sort_order)) : 0,
  });

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'TAG_CREATE',
    entityType: 'tag',
    entityId: tag.id,
    newValues: tag,
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return tag;
}

async function updateTag(rawId, payload = {}, adminContext) {
  const id = parseId(rawId, 'Tag ID');
  const existing = await adminMasterDataRepository.findTagById(id);
  if (!existing) {
    throw new AppError('Tag not found.', 404);
  }

  const name = payload.name ? String(payload.name).trim() : existing.name;
  if (!name || name.length < 2 || name.length > 120) {
    throw new AppError('Tag name must be between 2 and 120 characters.', 400);
  }

  const slug = payload.slug ? slugify(payload.slug) : (payload.name ? slugify(name) : existing.slug);
  if (!slug) {
    throw new AppError('Could not generate a valid slug for the tag.', 400);
  }

  const duplicate = await adminMasterDataRepository.findTagByNameOrSlug(name, slug, id);
  if (duplicate) {
    throw new AppError('A tag with this name or slug already exists.', 409);
  }

  const updated = await adminMasterDataRepository.updateTag(id, {
    name,
    slug,
    is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : existing.is_active,
    sort_order: payload.sort_order !== undefined ? Math.max(0, Number(payload.sort_order) || 0) : existing.sort_order,
  });

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'TAG_UPDATE',
    entityType: 'tag',
    entityId: id,
    oldValues: existing,
    newValues: updated,
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return updated;
}

async function toggleTagStatus(rawId, isActive, adminContext) {
  const id = parseId(rawId, 'Tag ID');
  const existing = await adminMasterDataRepository.findTagById(id);
  if (!existing) {
    throw new AppError('Tag not found.', 404);
  }

  const updated = await adminMasterDataRepository.updateTagStatus(id, Boolean(isActive));

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'TAG_STATUS_UPDATE',
    entityType: 'tag',
    entityId: id,
    oldValues: { is_active: existing.is_active },
    newValues: { is_active: updated.is_active },
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return updated;
}

/* ==========================================================================
   4. PROJECTS SERVICE
   ========================================================================== */

async function listProjects(filters = {}) {
  if (filters.selector === 'true') {
    return adminPropertyRepository.findProjectsWithUnitTypes();
  }
  return adminMasterDataRepository.findProjects(filters);
}

async function getProjectById(rawId) {
  const id = parseId(rawId, 'Project ID');
  const project = await adminMasterDataRepository.findProjectById(id);
  if (!project) {
    throw new AppError('Project not found.', 404);
  }
  return project;
}

async function createProject(payload = {}, adminContext) {
  const name = payload.name ? String(payload.name).trim() : '';
  if (!name || name.length < 2 || name.length > 200) {
    throw new AppError('Project name is required (between 2 and 200 characters).', 400);
  }

  const location = payload.location ? String(payload.location).trim() : '';
  if (!location || location.length < 2 || location.length > 150) {
    throw new AppError('Project location is required (between 2 and 150 characters).', 400);
  }

  const launchDate = validateDateString(payload.launch_date, 'launch_date');
  const possessionDate = validateDateString(payload.possession_date, 'possession_date');

  if (launchDate && possessionDate && possessionDate < launchDate) {
    throw new AppError('Possession date cannot be earlier than launch date.', 400);
  }

  const status = payload.status ? String(payload.status).toLowerCase().trim() : 'draft';
  if (!VALID_PROJECT_STATUSES.includes(status)) {
    throw new AppError(`Invalid status "${status}". Allowed values: ${VALID_PROJECT_STATUSES.join(', ')}.`, 400);
  }

  const project = await adminMasterDataRepository.insertProject({
    name,
    description: payload.description ? String(payload.description).trim() : null,
    location,
    address: payload.address ? String(payload.address).trim() : null,
    launch_date: launchDate,
    possession_date: possessionDate,
    status,
  });

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'PROJECT_CREATE',
    entityType: 'project',
    entityId: project.id,
    newValues: project,
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return project;
}

async function updateProject(rawId, payload = {}, adminContext) {
  const id = parseId(rawId, 'Project ID');
  const existing = await adminMasterDataRepository.findProjectById(id);
  if (!existing) {
    throw new AppError('Project not found.', 404);
  }

  const name = payload.name ? String(payload.name).trim() : existing.name;
  if (!name || name.length < 2 || name.length > 200) {
    throw new AppError('Project name must be between 2 and 200 characters.', 400);
  }

  const location = payload.location ? String(payload.location).trim() : existing.location;
  if (!location || location.length < 2 || location.length > 150) {
    throw new AppError('Project location must be between 2 and 150 characters.', 400);
  }

  const launchDate = payload.launch_date !== undefined ? validateDateString(payload.launch_date, 'launch_date') : toYmd(existing.launch_date);
  const possessionDate = payload.possession_date !== undefined ? validateDateString(payload.possession_date, 'possession_date') : toYmd(existing.possession_date);

  if (launchDate && possessionDate && possessionDate < launchDate) {
    throw new AppError('Possession date cannot be earlier than launch date.', 400);
  }

  const updated = await adminMasterDataRepository.updateProject(id, {
    name,
    description: payload.description !== undefined ? (payload.description ? String(payload.description).trim() : null) : existing.description,
    location,
    address: payload.address !== undefined ? (payload.address ? String(payload.address).trim() : null) : existing.address,
    launch_date: launchDate,
    possession_date: possessionDate,
  });

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'PROJECT_UPDATE',
    entityType: 'project',
    entityId: id,
    oldValues: existing,
    newValues: updated,
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return updated;
}

async function updateProjectStatus(rawId, newStatus, adminContext) {
  const id = parseId(rawId, 'Project ID');
  const existing = await adminMasterDataRepository.findProjectById(id);
  if (!existing) {
    throw new AppError('Project not found.', 404);
  }

  const status = String(newStatus).toLowerCase().trim();
  if (!VALID_PROJECT_STATUSES.includes(status)) {
    throw new AppError(`Invalid status "${status}". Allowed values: ${VALID_PROJECT_STATUSES.join(', ')}.`, 400);
  }

  const updated = await adminMasterDataRepository.updateProjectStatus(id, status);

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'PROJECT_STATUS_UPDATE',
    entityType: 'project',
    entityId: id,
    oldValues: { status: existing.status },
    newValues: { status: updated.status },
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return updated;
}

/* ==========================================================================
   5. PROJECT UNIT TYPES SERVICE
   ========================================================================== */

async function listProjectUnitTypes(rawProjectId) {
  const projectId = parseId(rawProjectId, 'Project ID');
  const project = await adminMasterDataRepository.findProjectById(projectId);
  if (!project) {
    throw new AppError('Project not found.', 404);
  }
  return adminMasterDataRepository.findUnitTypesByProjectId(projectId);
}

async function createProjectUnitType(rawProjectId, payload = {}, adminContext) {
  const projectId = parseId(rawProjectId, 'Project ID');
  const project = await adminMasterDataRepository.findProjectById(projectId);
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  const name = payload.name ? String(payload.name).trim() : '';
  if (!name || name.length < 2 || name.length > 120) {
    throw new AppError('Unit type name is required (between 2 and 120 characters).', 400);
  }

  const bedrooms = payload.bedrooms !== undefined && payload.bedrooms !== '' ? Number(payload.bedrooms) : null;
  if (bedrooms !== null && (!Number.isInteger(bedrooms) || bedrooms < 0 || bedrooms > 100)) {
    throw new AppError('Bedrooms must be an integer between 0 and 100.', 400);
  }

  const bathrooms = payload.bathrooms !== undefined && payload.bathrooms !== '' ? Number(payload.bathrooms) : null;
  if (bathrooms !== null && (!Number.isInteger(bathrooms) || bathrooms < 0 || bathrooms > 100)) {
    throw new AppError('Bathrooms must be an integer between 0 and 100.', 400);
  }

  const area = payload.area !== undefined && payload.area !== '' ? Number(payload.area) : null;
  if (area !== null && (Number.isNaN(area) || area <= 0)) {
    throw new AppError('Area must be a positive number.', 400);
  }

  const areaUnit = payload.area_unit ? String(payload.area_unit).toLowerCase().trim() : 'sqft';
  if (!VALID_AREA_UNITS.includes(areaUnit)) {
    throw new AppError(`Invalid area unit "${areaUnit}". Allowed: ${VALID_AREA_UNITS.join(', ')}.`, 400);
  }

  const basePrice = payload.base_price !== undefined && payload.base_price !== '' ? Number(payload.base_price) : null;
  if (basePrice !== null && (Number.isNaN(basePrice) || basePrice < 0)) {
    throw new AppError('Base price must be a non-negative number.', 400);
  }

  const unitsTotal = payload.units_total !== undefined && payload.units_total !== '' ? Number(payload.units_total) : null;
  if (unitsTotal !== null && (!Number.isInteger(unitsTotal) || unitsTotal < 0)) {
    throw new AppError('Total units must be a non-negative integer.', 400);
  }

  const unitsAvailable = payload.units_available !== undefined && payload.units_available !== '' ? Number(payload.units_available) : null;
  if (unitsAvailable !== null && (!Number.isInteger(unitsAvailable) || unitsAvailable < 0)) {
    throw new AppError('Available units must be a non-negative integer.', 400);
  }

  if (unitsTotal !== null && unitsAvailable !== null && unitsAvailable > unitsTotal) {
    throw new AppError('Available units cannot exceed total units.', 400);
  }

  const possessionDate = validateDateString(payload.possession_date, 'possession_date');

  const unitType = await adminMasterDataRepository.insertUnitType({
    project_id: projectId,
    name,
    bedrooms,
    bathrooms,
    area,
    area_unit: areaUnit,
    base_price: basePrice,
    units_total: unitsTotal,
    units_available: unitsAvailable,
    possession_date: possessionDate,
  });

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'PROJECT_UNIT_TYPE_CREATE',
    entityType: 'project_unit_type',
    entityId: unitType.id,
    newValues: unitType,
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return unitType;
}

async function updateProjectUnitType(rawProjectId, rawUnitTypeId, payload = {}, adminContext) {
  const projectId = parseId(rawProjectId, 'Project ID');
  const unitTypeId = parseId(rawUnitTypeId, 'Unit Type ID');

  const existing = await adminMasterDataRepository.findUnitTypeByIdAndProjectId(unitTypeId, projectId);
  if (!existing) {
    throw new AppError('Project unit type not found for this project.', 404);
  }

  const name = payload.name ? String(payload.name).trim() : existing.name;
  if (!name || name.length < 2 || name.length > 120) {
    throw new AppError('Unit type name must be between 2 and 120 characters.', 400);
  }

  const bedrooms = payload.bedrooms !== undefined ? (payload.bedrooms !== '' ? Number(payload.bedrooms) : null) : existing.bedrooms;
  if (bedrooms !== null && (!Number.isInteger(bedrooms) || bedrooms < 0 || bedrooms > 100)) {
    throw new AppError('Bedrooms must be an integer between 0 and 100.', 400);
  }

  const bathrooms = payload.bathrooms !== undefined ? (payload.bathrooms !== '' ? Number(payload.bathrooms) : null) : existing.bathrooms;
  if (bathrooms !== null && (!Number.isInteger(bathrooms) || bathrooms < 0 || bathrooms > 100)) {
    throw new AppError('Bathrooms must be an integer between 0 and 100.', 400);
  }

  const area = payload.area !== undefined ? (payload.area !== '' ? Number(payload.area) : null) : existing.area;
  if (area !== null && (Number.isNaN(area) || area <= 0)) {
    throw new AppError('Area must be a positive number.', 400);
  }

  const areaUnit = payload.area_unit ? String(payload.area_unit).toLowerCase().trim() : existing.area_unit;
  if (!VALID_AREA_UNITS.includes(areaUnit)) {
    throw new AppError(`Invalid area unit "${areaUnit}". Allowed: ${VALID_AREA_UNITS.join(', ')}.`, 400);
  }

  const basePrice = payload.base_price !== undefined ? (payload.base_price !== '' ? Number(payload.base_price) : null) : existing.base_price;
  if (basePrice !== null && (Number.isNaN(basePrice) || basePrice < 0)) {
    throw new AppError('Base price must be a non-negative number.', 400);
  }

  const unitsTotal = payload.units_total !== undefined ? (payload.units_total !== '' ? Number(payload.units_total) : null) : existing.units_total;
  if (unitsTotal !== null && (!Number.isInteger(unitsTotal) || unitsTotal < 0)) {
    throw new AppError('Total units must be a non-negative integer.', 400);
  }

  const unitsAvailable = payload.units_available !== undefined ? (payload.units_available !== '' ? Number(payload.units_available) : null) : existing.units_available;
  if (unitsAvailable !== null && (!Number.isInteger(unitsAvailable) || unitsAvailable < 0)) {
    throw new AppError('Available units must be a non-negative integer.', 400);
  }

  if (unitsTotal !== null && unitsAvailable !== null && unitsAvailable > unitsTotal) {
    throw new AppError('Available units cannot exceed total units.', 400);
  }

  const possessionDate = payload.possession_date !== undefined ? validateDateString(payload.possession_date, 'possession_date') : toYmd(existing.possession_date);

  const updated = await adminMasterDataRepository.updateUnitType(unitTypeId, projectId, {
    name,
    bedrooms,
    bathrooms,
    area,
    area_unit: areaUnit,
    base_price: basePrice,
    units_total: unitsTotal,
    units_available: unitsAvailable,
    possession_date: possessionDate,
  });

  await adminMasterDataRepository.logMasterDataActivity({
    clerkUserId: adminContext.clerkUserId,
    action: 'PROJECT_UNIT_TYPE_UPDATE',
    entityType: 'project_unit_type',
    entityId: unitTypeId,
    oldValues: existing,
    newValues: updated,
    ipAddress: adminContext.ipAddress,
    userAgent: adminContext.userAgent,
  });

  return updated;
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
