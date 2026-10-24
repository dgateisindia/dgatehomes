const { pool } = require('../config/db');

const PUBLIC_PROPERTY_COLUMNS = [
  'id',
  'title',
  'description',
  'price',
  'location',
  'address',
  'property_type',
  'property_type_id',
  'listing_type',
  'bedrooms',
  'bathrooms',
  'area',
  'area_unit',
  'units_available',
  'status',
  'listing_date',
  'published_at',
  'possession_date',
  'slug',
  'is_featured',
  'created_at',
  'updated_at',
];

const PUBLIC_SINGLE_PROPERTY_COLUMNS = [
  'p.id',
  'p.title',
  'p.description',
  'p.price',
  'p.location',
  'p.address',
  'p.property_type',
  'p.property_type_id',
  'p.project_id',
  'p.project_unit_type_id',
  'p.listing_type',
  'p.bedrooms',
  'p.bathrooms',
  'p.area',
  'p.area_unit',
  'p.units_available',
  'p.status',
  'p.listing_date',
  'p.published_at',
  'p.possession_date',
  'p.last_verified_at',
  'p.slug',
  'p.is_featured',
  'p.created_at',
  'p.updated_at',
  'pt.name AS property_type_name',
  'pt.slug AS property_type_slug',
  'pt.segment AS property_type_segment',
];

const SORT_MAPPINGS = {
  newest: 'created_at DESC, id DESC',
  price_asc: 'price ASC, id DESC',
  price_desc: 'price DESC, id DESC',
};

/**
 * Builds parameterized WHERE conditions from validated filters.
 * @param {Record<string, any>} filters
 * @returns {{ whereSql: string, params: any[] }}
 */
function buildWhereClause(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.location) {
    conditions.push('(location LIKE ? OR address LIKE ?)');
    params.push(`%${filters.location}%`, `%${filters.location}%`);
  }

  if (filters.property_type_id !== undefined && filters.property_type_id !== null) {
    conditions.push('property_type_id = ?');
    params.push(filters.property_type_id);
  }

  if (filters.listing_type) {
    conditions.push('listing_type = ?');
    params.push(filters.listing_type);
  }

  if (filters.min_price !== undefined && filters.min_price !== null) {
    conditions.push('price >= ?');
    params.push(filters.min_price);
  }

  if (filters.max_price !== undefined && filters.max_price !== null) {
    conditions.push('price <= ?');
    params.push(filters.max_price);
  }

  if (filters.bedrooms !== undefined && filters.bedrooms !== null) {
    conditions.push('bedrooms = ?');
    params.push(filters.bedrooms);
  }

  if (filters.bathrooms !== undefined && filters.bathrooms !== null) {
    conditions.push('bathrooms = ?');
    params.push(filters.bathrooms);
  }

  if (filters.featured !== undefined && filters.featured !== null) {
    conditions.push('is_featured = ?');
    params.push(filters.featured ? 1 : 0);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereSql, params };
}

/**
 * Queries published public properties from vw_public_properties using parameterized SQL.
 * @param {Record<string, any>} filters
 * @param {{ limit: number, offset: number }} pagination
 * @param {'newest' | 'price_asc' | 'price_desc'} sort
 * @returns {Promise<any[]>}
 */
async function findPublicProperties(filters = {}, pagination = { limit: 12, offset: 0 }, sort = 'newest') {
  const { whereSql, params } = buildWhereClause(filters);
  const sortClause = SORT_MAPPINGS[sort] || SORT_MAPPINGS.newest;

  const query = `
    SELECT ${PUBLIC_PROPERTY_COLUMNS.join(', ')}
    FROM vw_public_properties
    ${whereSql}
    ORDER BY ${sortClause}
    LIMIT ? OFFSET ?
  `;

  const queryParams = [...params, Number(pagination.limit), Number(pagination.offset)];
  const [rows] = await pool.query(query, queryParams);
  return rows;
}

/**
 * Counts the total published properties matching filters.
 * @param {Record<string, any>} filters
 * @returns {Promise<number>}
 */
async function countPublicProperties(filters = {}) {
  const { whereSql, params } = buildWhereClause(filters);

  const query = `
    SELECT COUNT(*) AS total
    FROM vw_public_properties
    ${whereSql}
  `;

  const [rows] = await pool.query(query, params);
  return rows[0] ? Number(rows[0].total) : 0;
}

/**
 * Finds a single public property by slug.
 * Filters strictly by status = 'published' and deleted_at IS NULL.
 * @param {string} slug
 * @returns {Promise<any | null>}
 */
async function findPublicPropertyBySlug(slug) {
  const query = `
    SELECT ${PUBLIC_SINGLE_PROPERTY_COLUMNS.join(', ')}
    FROM properties p
    LEFT JOIN property_types pt ON p.property_type_id = pt.id
    WHERE p.slug = ? AND p.status = 'published' AND p.deleted_at IS NULL
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [slug]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Retrieves property images ordered with cover image first, then sort_order, then id.
 * @param {number|string} propertyId
 * @returns {Promise<any[]>}
 */
async function getPropertyImages(propertyId) {
  const query = `
    SELECT
      id,
      property_id,
      image_url,
      cloudinary_public_id,
      sort_order,
      is_cover,
      caption,
      alt_text,
      width_px,
      height_px,
      created_at
    FROM property_images
    WHERE property_id = ?
    ORDER BY is_cover DESC, sort_order ASC, id ASC
  `;

  const [rows] = await pool.query(query, [propertyId]);
  return rows;
}

/**
 * Retrieves active amenities assigned to a property.
 * @param {number|string} propertyId
 * @returns {Promise<any[]>}
 */
async function getPropertyAmenities(propertyId) {
  const query = `
    SELECT
      a.id,
      a.name,
      a.slug,
      a.category,
      a.icon_key,
      a.sort_order
    FROM amenities a
    INNER JOIN property_amenities pa ON pa.amenity_id = a.id
    WHERE pa.property_id = ? AND a.is_active = 1
    ORDER BY a.sort_order ASC, a.name ASC
  `;

  const [rows] = await pool.query(query, [propertyId]);
  return rows;
}

/**
 * Retrieves active tags assigned to a property.
 * @param {number|string} propertyId
 * @returns {Promise<any[]>}
 */
async function getPropertyTags(propertyId) {
  const query = `
    SELECT
      pt.id,
      pt.name,
      pt.slug,
      pt.sort_order
    FROM property_tags pt
    INNER JOIN property_tag_mappings ptm ON ptm.tag_id = pt.id
    WHERE ptm.property_id = ? AND pt.is_active = 1
    ORDER BY pt.sort_order ASC, pt.name ASC
  `;

  const [rows] = await pool.query(query, [propertyId]);
  return rows;
}

/**
 * Retrieves project details by project_id.
 * @param {number|string} projectId
 * @returns {Promise<any | null>}
 */
async function getProjectById(projectId) {
  const query = `
    SELECT
      id,
      name,
      description,
      location,
      address,
      launch_date,
      possession_date,
      status,
      created_at,
      updated_at
    FROM projects
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [projectId]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Retrieves project unit type details by project_unit_type_id.
 * @param {number|string} unitTypeId
 * @returns {Promise<any | null>}
 */
async function getProjectUnitTypeById(unitTypeId) {
  const query = `
    SELECT
      id,
      project_id,
      name,
      bedrooms,
      bathrooms,
      area,
      area_unit,
      base_price,
      units_total,
      units_available,
      possession_date,
      created_at,
      updated_at
    FROM project_unit_types
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [unitTypeId]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Retrieves all property types.
 * @returns {Promise<any[]>}
 */
async function findPropertyTypes() {
  const query = `
    SELECT id, name, slug
    FROM property_types
    ORDER BY id ASC
  `;
  const [rows] = await pool.query(query);
  return rows;
}

module.exports = {
  findPublicProperties,
  countPublicProperties,
  findPublicPropertyBySlug,
  getPropertyImages,
  getPropertyAmenities,
  getPropertyTags,
  getProjectById,
  getProjectUnitTypeById,
  findPropertyTypes,
  SORT_MAPPINGS,
};
