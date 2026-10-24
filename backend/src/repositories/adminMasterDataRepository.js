const { pool } = require('../config/db');

/**
 * Logs an administrative action into admin_activity_logs.
 */
async function logMasterDataActivity({
  clerkUserId,
  action,
  entityType,
  entityId,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    await pool.query(
      `
        INSERT INTO admin_activity_logs (
          clerk_user_id,
          action,
          entity_type,
          entity_id,
          old_values,
          new_values,
          ip_address,
          user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        clerkUserId,
        action,
        entityType,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent ? String(userAgent).slice(0, 500) : null,
      ]
    );
  } catch (err) {
    console.error('[AdminMasterDataRepo] Failed to write audit log:', err.message);
  }
}

/* ==========================================================================
   1. AMENITIES REPOSITORY
   ========================================================================== */

async function findAmenities(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(name LIKE ? OR slug LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }

  if (filters.is_active !== undefined && filters.is_active !== '') {
    conditions.push('is_active = ?');
    params.push(filters.is_active === 'true' || filters.is_active === 1 || filters.is_active === true ? 1 : 0);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT
      id,
      name,
      slug,
      category,
      icon_key,
      is_active,
      sort_order,
      created_at
    FROM amenities
    ${whereClause}
    ORDER BY category ASC, sort_order ASC, name ASC
  `;

  const [rows] = await pool.query(sql, params);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category || 'General',
    icon_key: r.icon_key || null,
    is_active: Boolean(r.is_active),
    sort_order: Number(r.sort_order),
    created_at: r.created_at,
  }));
}

async function findAmenityById(id) {
  const [rows] = await pool.query('SELECT * FROM amenities WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category || 'General',
    icon_key: r.icon_key || null,
    is_active: Boolean(r.is_active),
    sort_order: Number(r.sort_order),
    created_at: r.created_at,
  };
}

async function findAmenityByNameOrSlug(name, slug, excludeId = null) {
  let sql = 'SELECT id, name, slug FROM amenities WHERE (LOWER(name) = LOWER(?) OR LOWER(slug) = LOWER(?))';
  const params = [name, slug];
  if (excludeId) {
    sql += ' AND id <> ?';
    params.push(excludeId);
  }
  sql += ' LIMIT 1';
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

async function insertAmenity(data) {
  const [result] = await pool.query(
    `
      INSERT INTO amenities (
        name,
        slug,
        category,
        icon_key,
        is_active,
        sort_order
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      data.name,
      data.slug,
      data.category || 'General',
      data.icon_key || null,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      Number(data.sort_order) || 0,
    ]
  );
  return findAmenityById(result.insertId);
}

async function updateAmenity(id, data) {
  await pool.query(
    `
      UPDATE amenities
      SET
        name = ?,
        slug = ?,
        category = ?,
        icon_key = ?,
        is_active = ?,
        sort_order = ?
      WHERE id = ?
    `,
    [
      data.name,
      data.slug,
      data.category || 'General',
      data.icon_key || null,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      Number(data.sort_order) || 0,
      id,
    ]
  );
  return findAmenityById(id);
}

async function updateAmenityStatus(id, isActive) {
  await pool.query('UPDATE amenities SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  return findAmenityById(id);
}

/* ==========================================================================
   2. PROPERTY TYPES REPOSITORY
   ========================================================================== */

async function findPropertyTypes(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(name LIKE ? OR slug LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.segment) {
    conditions.push('segment = ?');
    params.push(filters.segment);
  }

  if (filters.is_active !== undefined && filters.is_active !== '') {
    conditions.push('is_active = ?');
    params.push(filters.is_active === 'true' || filters.is_active === 1 || filters.is_active === true ? 1 : 0);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT
      id,
      name,
      slug,
      segment,
      is_active,
      sort_order,
      created_at,
      updated_at
    FROM property_types
    ${whereClause}
    ORDER BY sort_order ASC, name ASC
  `;

  const [rows] = await pool.query(sql, params);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    segment: r.segment,
    is_active: Boolean(r.is_active),
    sort_order: Number(r.sort_order),
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

async function findPropertyTypeById(id) {
  const [rows] = await pool.query('SELECT * FROM property_types WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    segment: r.segment,
    is_active: Boolean(r.is_active),
    sort_order: Number(r.sort_order),
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

async function findPropertyTypeByNameOrSlug(name, slug, excludeId = null) {
  let sql = 'SELECT id, name, slug FROM property_types WHERE (LOWER(name) = LOWER(?) OR LOWER(slug) = LOWER(?))';
  const params = [name, slug];
  if (excludeId) {
    sql += ' AND id <> ?';
    params.push(excludeId);
  }
  sql += ' LIMIT 1';
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

async function countPropertiesUsingType(propertyTypeId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM properties WHERE property_type_id = ? AND deleted_at IS NULL',
    [propertyTypeId]
  );
  return Number(rows[0]?.total || 0);
}

async function insertPropertyType(data) {
  const [result] = await pool.query(
    `
      INSERT INTO property_types (
        name,
        slug,
        segment,
        is_active,
        sort_order
      ) VALUES (?, ?, ?, ?, ?)
    `,
    [
      data.name,
      data.slug,
      data.segment,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      Number(data.sort_order) || 0,
    ]
  );
  return findPropertyTypeById(result.insertId);
}

async function updatePropertyType(id, data) {
  await pool.query(
    `
      UPDATE property_types
      SET
        name = ?,
        slug = ?,
        segment = ?,
        is_active = ?,
        sort_order = ?
      WHERE id = ?
    `,
    [
      data.name,
      data.slug,
      data.segment,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      Number(data.sort_order) || 0,
      id,
    ]
  );
  return findPropertyTypeById(id);
}

async function updatePropertyTypeStatus(id, isActive) {
  await pool.query('UPDATE property_types SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  return findPropertyTypeById(id);
}

/* ==========================================================================
   3. PROPERTY TAGS REPOSITORY
   ========================================================================== */

async function findTags(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(name LIKE ? OR slug LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.is_active !== undefined && filters.is_active !== '') {
    conditions.push('is_active = ?');
    params.push(filters.is_active === 'true' || filters.is_active === 1 || filters.is_active === true ? 1 : 0);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT
      id,
      name,
      slug,
      is_active,
      sort_order,
      created_at,
      updated_at
    FROM property_tags
    ${whereClause}
    ORDER BY sort_order ASC, name ASC
  `;

  const [rows] = await pool.query(sql, params);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    is_active: Boolean(r.is_active),
    sort_order: Number(r.sort_order),
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

async function findTagById(id) {
  const [rows] = await pool.query('SELECT * FROM property_tags WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    is_active: Boolean(r.is_active),
    sort_order: Number(r.sort_order),
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

async function findTagByNameOrSlug(name, slug, excludeId = null) {
  let sql = 'SELECT id, name, slug FROM property_tags WHERE (LOWER(name) = LOWER(?) OR LOWER(slug) = LOWER(?))';
  const params = [name, slug];
  if (excludeId) {
    sql += ' AND id <> ?';
    params.push(excludeId);
  }
  sql += ' LIMIT 1';
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

async function insertTag(data) {
  const [result] = await pool.query(
    `
      INSERT INTO property_tags (
        name,
        slug,
        is_active,
        sort_order
      ) VALUES (?, ?, ?, ?)
    `,
    [
      data.name,
      data.slug,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      Number(data.sort_order) || 0,
    ]
  );
  return findTagById(result.insertId);
}

async function updateTag(id, data) {
  await pool.query(
    `
      UPDATE property_tags
      SET
        name = ?,
        slug = ?,
        is_active = ?,
        sort_order = ?
      WHERE id = ?
    `,
    [
      data.name,
      data.slug,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      Number(data.sort_order) || 0,
      id,
    ]
  );
  return findTagById(id);
}

async function updateTagStatus(id, isActive) {
  await pool.query('UPDATE property_tags SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  return findTagById(id);
}

/* ==========================================================================
   4. PROJECTS REPOSITORY
   ========================================================================== */

async function findProjects(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(p.name LIKE ? OR p.location LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.status) {
    conditions.push('p.status = ?');
    params.push(filters.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT
      p.id,
      p.name,
      p.description,
      p.location,
      p.address,
      p.launch_date,
      p.possession_date,
      p.status,
      p.created_at,
      p.updated_at,
      COUNT(DISTINCT put.id) AS unit_types_count,
      COUNT(DISTINCT prop.id) AS properties_count
    FROM projects p
    LEFT JOIN project_unit_types put ON p.id = put.project_id
    LEFT JOIN properties prop ON p.id = prop.project_id AND prop.deleted_at IS NULL
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC, p.id DESC
  `;

  const [rows] = await pool.query(sql, params);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description || null,
    location: r.location,
    address: r.address || null,
    launch_date: r.launch_date,
    possession_date: r.possession_date,
    status: r.status,
    unit_types_count: Number(r.unit_types_count || 0),
    properties_count: Number(r.properties_count || 0),
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

async function findProjectById(id) {
  const projectSql = `
    SELECT
      p.id,
      p.name,
      p.description,
      p.location,
      p.address,
      p.launch_date,
      p.possession_date,
      p.status,
      p.created_at,
      p.updated_at,
      COUNT(DISTINCT prop.id) AS properties_count
    FROM projects p
    LEFT JOIN properties prop ON p.id = prop.project_id AND prop.deleted_at IS NULL
    WHERE p.id = ?
    GROUP BY p.id
    LIMIT 1
  `;

  const unitTypesSql = `
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
    WHERE project_id = ?
    ORDER BY bedrooms ASC, area ASC, id ASC
  `;

  const [[projectRows], [unitTypeRows]] = await Promise.all([
    pool.query(projectSql, [id]),
    pool.query(unitTypesSql, [id]),
  ]);

  const p = projectRows[0];
  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    description: p.description || null,
    location: p.location,
    address: p.address || null,
    launch_date: p.launch_date,
    possession_date: p.possession_date,
    status: p.status,
    properties_count: Number(p.properties_count || 0),
    created_at: p.created_at,
    updated_at: p.updated_at,
    unitTypes: unitTypeRows.map((u) => ({
      id: u.id,
      project_id: u.project_id,
      name: u.name,
      bedrooms: u.bedrooms != null ? Number(u.bedrooms) : null,
      bathrooms: u.bathrooms != null ? Number(u.bathrooms) : null,
      area: u.area != null ? Number(u.area) : null,
      area_unit: u.area_unit,
      base_price: u.base_price != null ? Number(u.base_price) : null,
      units_total: u.units_total != null ? Number(u.units_total) : null,
      units_available: u.units_available != null ? Number(u.units_available) : null,
      possession_date: u.possession_date,
      created_at: u.created_at,
      updated_at: u.updated_at,
    })),
  };
}

async function insertProject(data) {
  const [result] = await pool.query(
    `
      INSERT INTO projects (
        name,
        description,
        location,
        address,
        launch_date,
        possession_date,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.name,
      data.description || null,
      data.location,
      data.address || null,
      data.launch_date || null,
      data.possession_date || null,
      data.status || 'draft',
    ]
  );
  return findProjectById(result.insertId);
}

async function updateProject(id, data) {
  await pool.query(
    `
      UPDATE projects
      SET
        name = ?,
        description = ?,
        location = ?,
        address = ?,
        launch_date = ?,
        possession_date = ?
      WHERE id = ?
    `,
    [
      data.name,
      data.description || null,
      data.location,
      data.address || null,
      data.launch_date || null,
      data.possession_date || null,
      id,
    ]
  );
  return findProjectById(id);
}

async function updateProjectStatus(id, status) {
  await pool.query('UPDATE projects SET status = ? WHERE id = ?', [status, id]);
  return findProjectById(id);
}

/* ==========================================================================
   5. PROJECT UNIT TYPES REPOSITORY
   ========================================================================== */

async function findUnitTypesByProjectId(projectId) {
  const [rows] = await pool.query(
    `
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
      WHERE project_id = ?
      ORDER BY bedrooms ASC, area ASC, id ASC
    `,
    [projectId]
  );

  return rows.map((u) => ({
    id: u.id,
    project_id: u.project_id,
    name: u.name,
    bedrooms: u.bedrooms != null ? Number(u.bedrooms) : null,
    bathrooms: u.bathrooms != null ? Number(u.bathrooms) : null,
    area: u.area != null ? Number(u.area) : null,
    area_unit: u.area_unit,
    base_price: u.base_price != null ? Number(u.base_price) : null,
    units_total: u.units_total != null ? Number(u.units_total) : null,
    units_available: u.units_available != null ? Number(u.units_available) : null,
    possession_date: u.possession_date,
    created_at: u.created_at,
    updated_at: u.updated_at,
  }));
}

async function findUnitTypeByIdAndProjectId(unitTypeId, projectId) {
  const [rows] = await pool.query(
    'SELECT * FROM project_unit_types WHERE id = ? AND project_id = ? LIMIT 1',
    [unitTypeId, projectId]
  );
  if (!rows[0]) return null;
  const u = rows[0];
  return {
    id: u.id,
    project_id: u.project_id,
    name: u.name,
    bedrooms: u.bedrooms != null ? Number(u.bedrooms) : null,
    bathrooms: u.bathrooms != null ? Number(u.bathrooms) : null,
    area: u.area != null ? Number(u.area) : null,
    area_unit: u.area_unit,
    base_price: u.base_price != null ? Number(u.base_price) : null,
    units_total: u.units_total != null ? Number(u.units_total) : null,
    units_available: u.units_available != null ? Number(u.units_available) : null,
    possession_date: u.possession_date,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}

async function insertUnitType(data) {
  const [result] = await pool.query(
    `
      INSERT INTO project_unit_types (
        project_id,
        name,
        bedrooms,
        bathrooms,
        area,
        area_unit,
        base_price,
        units_total,
        units_available,
        possession_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.project_id,
      data.name,
      data.bedrooms != null ? Number(data.bedrooms) : null,
      data.bathrooms != null ? Number(data.bathrooms) : null,
      data.area != null ? Number(data.area) : null,
      data.area_unit || 'sqft',
      data.base_price != null ? Number(data.base_price) : null,
      data.units_total != null ? Number(data.units_total) : null,
      data.units_available != null ? Number(data.units_available) : null,
      data.possession_date || null,
    ]
  );
  return findUnitTypeByIdAndProjectId(result.insertId, data.project_id);
}

async function updateUnitType(unitTypeId, projectId, data) {
  await pool.query(
    `
      UPDATE project_unit_types
      SET
        name = ?,
        bedrooms = ?,
        bathrooms = ?,
        area = ?,
        area_unit = ?,
        base_price = ?,
        units_total = ?,
        units_available = ?,
        possession_date = ?
      WHERE id = ? AND project_id = ?
    `,
    [
      data.name,
      data.bedrooms != null ? Number(data.bedrooms) : null,
      data.bathrooms != null ? Number(data.bathrooms) : null,
      data.area != null ? Number(data.area) : null,
      data.area_unit || 'sqft',
      data.base_price != null ? Number(data.base_price) : null,
      data.units_total != null ? Number(data.units_total) : null,
      data.units_available != null ? Number(data.units_available) : null,
      data.possession_date || null,
      unitTypeId,
      projectId,
    ]
  );
  return findUnitTypeByIdAndProjectId(unitTypeId, projectId);
}

module.exports = {
  logMasterDataActivity,
  // Amenities
  findAmenities,
  findAmenityById,
  findAmenityByNameOrSlug,
  insertAmenity,
  updateAmenity,
  updateAmenityStatus,
  // Property Types
  findPropertyTypes,
  findPropertyTypeById,
  findPropertyTypeByNameOrSlug,
  countPropertiesUsingType,
  insertPropertyType,
  updatePropertyType,
  updatePropertyTypeStatus,
  // Property Tags
  findTags,
  findTagById,
  findTagByNameOrSlug,
  insertTag,
  updateTag,
  updateTagStatus,
  // Projects
  findProjects,
  findProjectById,
  insertProject,
  updateProject,
  updateProjectStatus,
  // Project Unit Types
  findUnitTypesByProjectId,
  findUnitTypeByIdAndProjectId,
  insertUnitType,
  updateUnitType,
};
