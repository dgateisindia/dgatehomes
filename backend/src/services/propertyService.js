const propertyRepository = require('../repositories/propertyRepository');

/**
 * Retrieves public properties with pagination, filters, and sorting.
 * @param {{ filters: Record<string, any>, pagination: { page: number, limit: number, offset: number }, sort: string }} params
 * @returns {Promise<{ data: any[], pagination: { page: number, limit: number, total: number, totalPages: number } }>}
 */
async function getPublicProperties({ filters, pagination, sort }) {
  const [properties, total] = await Promise.all([
    propertyRepository.findPublicProperties(filters, pagination, sort),
    propertyRepository.countPublicProperties(filters),
  ]);

  const totalPages = total > 0 ? Math.ceil(total / pagination.limit) : 0;

  return {
    data: properties,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
    },
  };
}

/**
 * Retrieves a single published property by its slug along with associated details.
 * Avoids duplicate rows by querying child tables separately.
 * @param {string} slug
 * @returns {Promise<{ property: any, images: any[], amenities: any[], tags: any[], project: any | null, unitType: any | null } | null>}
 */
async function getPropertyBySlug(slug) {
  const rawProperty = await propertyRepository.findPublicPropertyBySlug(slug);

  if (!rawProperty) {
    return null;
  }

  // Construct property type details
  const propertyType = rawProperty.property_type_id
    ? {
        id: rawProperty.property_type_id,
        name: rawProperty.property_type_name || rawProperty.property_type,
        slug: rawProperty.property_type_slug,
        segment: rawProperty.property_type_segment,
      }
    : null;

  // Clean public property core object (excludes admin clerk IDs and deleted_at)
  const property = {
    id: rawProperty.id,
    title: rawProperty.title,
    description: rawProperty.description,
    price: rawProperty.price,
    location: rawProperty.location,
    address: rawProperty.address,
    property_type: rawProperty.property_type,
    property_type_id: rawProperty.property_type_id,
    project_id: rawProperty.project_id,
    project_unit_type_id: rawProperty.project_unit_type_id,
    listing_type: rawProperty.listing_type,
    bedrooms: rawProperty.bedrooms,
    bathrooms: rawProperty.bathrooms,
    area: rawProperty.area,
    area_unit: rawProperty.area_unit,
    units_available: rawProperty.units_available,
    status: rawProperty.status,
    listing_date: rawProperty.listing_date,
    published_at: rawProperty.published_at,
    possession_date: rawProperty.possession_date,
    last_verified_at: rawProperty.last_verified_at,
    slug: rawProperty.slug,
    is_featured: Boolean(rawProperty.is_featured),
    created_at: rawProperty.created_at,
    updated_at: rawProperty.updated_at,
    propertyType,
  };

  // Fetch related child records in parallel
  const [images, amenities, tags, project, unitType] = await Promise.all([
    propertyRepository.getPropertyImages(rawProperty.id),
    propertyRepository.getPropertyAmenities(rawProperty.id),
    propertyRepository.getPropertyTags(rawProperty.id),
    rawProperty.project_id ? propertyRepository.getProjectById(rawProperty.project_id) : Promise.resolve(null),
    rawProperty.project_unit_type_id ? propertyRepository.getProjectUnitTypeById(rawProperty.project_unit_type_id) : Promise.resolve(null),
  ]);

  return {
    property,
    images: images || [],
    amenities: amenities || [],
    tags: tags || [],
    project: project || null,
    unitType: unitType || null,
  };
}

/**
 * Retrieves all active property types.
 * @returns {Promise<any[]>}
 */
async function getPropertyTypes() {
  return propertyRepository.findPropertyTypes();
}

module.exports = {
  getPublicProperties,
  getPropertyBySlug,
  getPropertyTypes,
};
