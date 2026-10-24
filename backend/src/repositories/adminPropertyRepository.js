const { pool } = require('../config/db');

const SORT_MAPPINGS = {
  newest: 'p.created_at DESC, p.id DESC',
  oldest: 'p.created_at ASC, p.id ASC',
  price_asc: 'p.price ASC, p.id DESC',
  price_desc: 'p.price DESC, p.id DESC',
  updated_desc: 'p.updated_at DESC, p.id DESC',
};

/**
 * Builds parameterized WHERE clause for admin properties list.
 */
function buildAdminWhereClause(filters = {}) {
  const conditions = ['p.deleted_at IS NULL'];
  const params = [];

  if (filters.search) {
    const likePattern = `%${filters.search}%`;
    conditions.push('(p.title LIKE ? OR p.location LIKE ? OR p.address LIKE ?)');
    params.push(likePattern, likePattern, likePattern);
  }

  if (filters.status) {
    conditions.push('p.status = ?');
    params.push(filters.status);
  }

  if (filters.property_type_id !== undefined) {
    conditions.push('p.property_type_id = ?');
    params.push(filters.property_type_id);
  }

  if (filters.listing_type) {
    conditions.push('p.listing_type = ?');
    params.push(filters.listing_type);
  }

  if (filters.featured !== undefined) {
    conditions.push('p.is_featured = ?');
    params.push(filters.featured);
  }

  return {
    whereSql: `WHERE ${conditions.join(' AND ')}`,
    params,
  };
}

/**
 * Retrieves paginated admin properties with filters and sorting.
 */
async function findAdminProperties({ filters, pagination, sort }) {
  const { whereSql, params } = buildAdminWhereClause(filters);
  const orderBy = SORT_MAPPINGS[sort] || SORT_MAPPINGS.newest;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM properties p
    ${whereSql}
  `;

  const dataQuery = `
    SELECT
      p.id,
      p.title,
      p.slug,
      p.price,
      p.location,
      p.address,
      p.property_type,
      p.property_type_id,
      p.project_id,
      p.project_unit_type_id,
      p.listing_type,
      p.bedrooms,
      p.bathrooms,
      p.area,
      p.area_unit,
      p.units_available,
      p.status,
      p.is_featured,
      p.listing_date,
      p.published_at,
      p.possession_date,
      p.archived_at,
      p.expires_at,
      p.created_at,
      p.updated_at,
      pt.name AS property_type_name,
      pt.segment AS property_type_segment,
      pr.name AS project_name,
      (
        SELECT pi.image_url
        FROM property_images pi
        WHERE pi.property_id = p.id
        ORDER BY pi.is_cover DESC, pi.sort_order ASC, pi.id ASC
        LIMIT 1
      ) AS cover_image_url
    FROM properties p
    LEFT JOIN property_types pt ON p.property_type_id = pt.id
    LEFT JOIN projects pr ON p.project_id = pr.id
    ${whereSql}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const [[countRow], [rows]] = await Promise.all([
    pool.query(countQuery, params),
    pool.query(dataQuery, [...params, pagination.limit, pagination.offset]),
  ]);

  return {
    rows,
    total: Number(countRow[0]?.total) || 0,
  };
}

/**
 * Retrieves a single property by ID for admin management, including relations.
 */
async function findAdminPropertyById(id) {
  const coreQuery = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.price,
      p.location,
      p.address,
      p.property_type,
      p.property_type_id,
      p.project_id,
      p.project_unit_type_id,
      p.listing_type,
      p.bedrooms,
      p.bathrooms,
      p.area,
      p.area_unit,
      p.units_available,
      p.status,
      p.listing_date,
      p.published_at,
      p.possession_date,
      p.archived_at,
      p.expires_at,
      p.last_verified_at,
      p.slug,
      p.is_featured,
      p.created_at,
      p.updated_at,
      pt.name AS property_type_name,
      pt.slug AS property_type_slug,
      pt.segment AS property_type_segment
    FROM properties p
    LEFT JOIN property_types pt ON p.property_type_id = pt.id
    WHERE p.id = ? AND p.deleted_at IS NULL
    LIMIT 1
  `;

  const [coreRows] = await pool.query(coreQuery, [id]);
  if (coreRows.length === 0) {
    return null;
  }

  const property = coreRows[0];

  // Fetch related collections in parallel
  const amenitiesPromise = pool.query(
    `
      SELECT a.id, a.name, a.slug, a.category, a.icon_key, a.sort_order
      FROM property_amenities pa
      INNER JOIN amenities a ON pa.amenity_id = a.id
      WHERE pa.property_id = ?
      ORDER BY a.category ASC, a.sort_order ASC, a.name ASC
    `,
    [id]
  );

  const tagsPromise = pool.query(
    `
      SELECT t.id, t.name, t.slug, t.sort_order
      FROM property_tag_mappings ptm
      INNER JOIN property_tags t ON ptm.tag_id = t.id
      WHERE ptm.property_id = ?
      ORDER BY t.sort_order ASC, t.name ASC
    `,
    [id]
  );

  const imagesPromise = pool.query(
    `
      SELECT id, image_url, is_cover, sort_order, caption, alt_text, width_px, height_px, created_at
      FROM property_images
      WHERE property_id = ?
      ORDER BY is_cover DESC, sort_order ASC, id ASC
    `,
    [id]
  );

  const projectPromise = property.project_id
    ? pool.query(
        `
          SELECT id, name, description, location, address, launch_date, possession_date, status
          FROM projects
          WHERE id = ?
          LIMIT 1
        `,
        [property.project_id]
      )
    : Promise.resolve([[]]);

  const unitTypePromise = property.project_unit_type_id
    ? pool.query(
        `
          SELECT id, project_id, name, bedrooms, bathrooms, area, area_unit, base_price, units_total, units_available, possession_date
          FROM project_unit_types
          WHERE id = ?
          LIMIT 1
        `,
        [property.project_unit_type_id]
      )
    : Promise.resolve([[]]);

  const [[amenities], [tags], [images], [projectRows], [unitTypeRows]] = await Promise.all([
    amenitiesPromise,
    tagsPromise,
    imagesPromise,
    projectPromise,
    unitTypePromise,
  ]);

  const propertyType = property.property_type_id
    ? {
        id: property.property_type_id,
        name: property.property_type_name || property.property_type,
        slug: property.property_type_slug || null,
        segment: property.property_type_segment || null,
      }
    : null;

  return {
    property,
    propertyType,
    project: projectRows[0] || null,
    unitType: unitTypeRows[0] || null,
    tags,
    amenities,
    images,
  };
}

/**
 * Validates and fetches an active property type by ID.
 */
async function findActivePropertyTypeById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, slug, segment FROM property_types WHERE id = ? AND is_active = 1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Validates and fetches a project by ID.
 */
async function findProjectById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, location, status FROM projects WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Validates and fetches a project unit type by ID.
 */
async function findProjectUnitTypeById(id) {
  const [rows] = await pool.query(
    'SELECT id, project_id, name FROM project_unit_types WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Validates that all provided amenity IDs exist and are active.
 */
async function findValidActiveAmenityIds(amenityIds = []) {
  if (!amenityIds || amenityIds.length === 0) return [];
  const placeholders = amenityIds.map(() => '?').join(', ');
  const [rows] = await pool.query(
    `SELECT id FROM amenities WHERE is_active = 1 AND id IN (${placeholders})`,
    amenityIds
  );
  return rows.map((r) => Number(r.id));
}

/**
 * Validates that all provided tag IDs exist and are active.
 */
async function findValidActiveTagIds(tagIds = []) {
  if (!tagIds || tagIds.length === 0) return [];
  const placeholders = tagIds.map(() => '?').join(', ');
  const [rows] = await pool.query(
    `SELECT id FROM property_tags WHERE is_active = 1 AND id IN (${placeholders})`,
    tagIds
  );
  return rows.map((r) => Number(r.id));
}

/**
 * Generates a unique slug in the properties table.
 */
async function generateUniqueSlug(baseSlug, excludePropertyId = null, connection = pool) {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    let query = 'SELECT id FROM properties WHERE slug = ?';
    const params = [candidate];

    if (excludePropertyId) {
      query += ' AND id != ?';
      params.push(excludePropertyId);
    }
    query += ' LIMIT 1';

    const [rows] = await connection.query(query, params);
    if (rows.length === 0) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

/**
 * Executes an atomic MySQL transaction to create a property, map amenities & tags,
 * record status history, and write an admin activity log.
 */
async function createPropertyTransaction(data, adminContext) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Ensure slug is unique within the transaction
    const uniqueSlug = await generateUniqueSlug(data.baseSlug, null, connection);

    // 1. Insert property (default status = 'draft')
    const insertPropertySql = `
      INSERT INTO properties (
        title,
        description,
        price,
        location,
        address,
        property_type,
        property_type_id,
        project_id,
        project_unit_type_id,
        listing_type,
        bedrooms,
        bathrooms,
        area,
        area_unit,
        units_available,
        status,
        listing_date,
        possession_date,
        expires_at,
        slug,
        is_featured,
        created_by_clerk_user_id,
        updated_by_clerk_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)
    `;

    const [propResult] = await connection.query(insertPropertySql, [
      data.title,
      data.description,
      data.price,
      data.location,
      data.address,
      data.property_type_name,
      data.property_type_id,
      data.project_id,
      data.project_unit_type_id,
      data.listing_type,
      data.bedrooms,
      data.bathrooms,
      data.area,
      data.area_unit,
      data.units_available,
      data.listing_date,
      data.possession_date,
      data.expires_at,
      uniqueSlug,
      data.is_featured,
      adminContext.clerkUserId,
      adminContext.clerkUserId,
    ]);

    const propertyId = propResult.insertId;

    // 2. Insert amenity mappings
    if (data.amenity_ids && data.amenity_ids.length > 0) {
      const amenityPlaceholders = data.amenity_ids.map(() => '(?, ?)').join(', ');
      const amenityParams = [];
      for (const amenityId of data.amenity_ids) {
        amenityParams.push(propertyId, amenityId);
      }
      await connection.query(
        `INSERT INTO property_amenities (property_id, amenity_id) VALUES ${amenityPlaceholders}`,
        amenityParams
      );
    }

    // 3. Insert tag mappings
    if (data.tag_ids && data.tag_ids.length > 0) {
      const tagPlaceholders = data.tag_ids.map(() => '(?, ?)').join(', ');
      const tagParams = [];
      for (const tagId of data.tag_ids) {
        tagParams.push(propertyId, tagId);
      }
      await connection.query(
        `INSERT INTO property_tag_mappings (property_id, tag_id) VALUES ${tagPlaceholders}`,
        tagParams
      );
    }

    // 4. Write initial status history
    await connection.query(
      `
        INSERT INTO property_status_history (
          property_id,
          old_status,
          new_status,
          changed_by_clerk_user_id,
          reason
        ) VALUES (?, NULL, 'draft', ?, 'Property created as draft')
      `,
      [propertyId, adminContext.clerkUserId]
    );

    // 5. Write admin_activity_logs
    const newValuesSnapshot = {
      title: data.title,
      slug: uniqueSlug,
      price: data.price,
      location: data.location,
      property_type_id: data.property_type_id,
      listing_type: data.listing_type,
      status: 'draft',
      is_featured: data.is_featured,
      amenity_ids: data.amenity_ids,
      tag_ids: data.tag_ids,
    };

    await connection.query(
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
        ) VALUES (?, 'create_property', 'property', ?, NULL, ?, ?, ?)
      `,
      [
        adminContext.clerkUserId,
        propertyId,
        JSON.stringify(newValuesSnapshot),
        adminContext.ipAddress || null,
        adminContext.userAgent || null,
      ]
    );

    await connection.commit();
    return propertyId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Executes an atomic MySQL transaction to update a property, sync amenities & tags,
 * record property_price_history if price changed, and log admin_activity_logs.
 */
async function updatePropertyTransaction(id, data, existingBundle, adminContext) {
  const connection = await pool.getConnection();
  const existing = existingBundle.property;

  try {
    await connection.beginTransaction();

    // Update slug only if title changed significantly or if slug was missing
    let updatedSlug = existing.slug;
    if (!updatedSlug) {
      updatedSlug = await generateUniqueSlug(data.baseSlug, id, connection);
    }

    // 1. Update properties row
    const updatePropertySql = `
      UPDATE properties
      SET
        title = ?,
        description = ?,
        price = ?,
        location = ?,
        address = ?,
        property_type = ?,
        property_type_id = ?,
        project_id = ?,
        project_unit_type_id = ?,
        listing_type = ?,
        bedrooms = ?,
        bathrooms = ?,
        area = ?,
        area_unit = ?,
        units_available = ?,
        listing_date = ?,
        possession_date = ?,
        expires_at = ?,
        slug = ?,
        is_featured = ?,
        updated_by_clerk_user_id = ?
      WHERE id = ? AND deleted_at IS NULL
    `;

    await connection.query(updatePropertySql, [
      data.title,
      data.description,
      data.price,
      data.location,
      data.address,
      data.property_type_name,
      data.property_type_id,
      data.project_id,
      data.project_unit_type_id,
      data.listing_type,
      data.bedrooms,
      data.bathrooms,
      data.area,
      data.area_unit,
      data.units_available,
      data.listing_date,
      data.possession_date,
      data.expires_at,
      updatedSlug,
      data.is_featured,
      adminContext.clerkUserId,
      id,
    ]);

    // 2. Sync amenity mappings
    await connection.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
    if (data.amenity_ids && data.amenity_ids.length > 0) {
      const amenityPlaceholders = data.amenity_ids.map(() => '(?, ?)').join(', ');
      const amenityParams = [];
      for (const amenityId of data.amenity_ids) {
        amenityParams.push(id, amenityId);
      }
      await connection.query(
        `INSERT INTO property_amenities (property_id, amenity_id) VALUES ${amenityPlaceholders}`,
        amenityParams
      );
    }

    // 3. Sync tag mappings
    await connection.query('DELETE FROM property_tag_mappings WHERE property_id = ?', [id]);
    if (data.tag_ids && data.tag_ids.length > 0) {
      const tagPlaceholders = data.tag_ids.map(() => '(?, ?)').join(', ');
      const tagParams = [];
      for (const tagId of data.tag_ids) {
        tagParams.push(id, tagId);
      }
      await connection.query(
        `INSERT INTO property_tag_mappings (property_id, tag_id) VALUES ${tagPlaceholders}`,
        tagParams
      );
    }

    // 4. If price changed, insert into property_price_history
    const oldPriceNum = Number(existing.price);
    const newPriceNum = Number(data.price);
    if (oldPriceNum !== newPriceNum) {
      await connection.query(
        `
          INSERT INTO property_price_history (
            property_id,
            old_price,
            new_price,
            changed_by_clerk_user_id
          ) VALUES (?, ?, ?, ?)
        `,
        [id, oldPriceNum, newPriceNum, adminContext.clerkUserId]
      );
    }

    // 5. Write admin_activity_logs with old_values and new_values
    const oldValuesSnapshot = {
      title: existing.title,
      price: oldPriceNum,
      location: existing.location,
      address: existing.address,
      property_type_id: existing.property_type_id,
      listing_type: existing.listing_type,
      bedrooms: existing.bedrooms,
      bathrooms: existing.bathrooms,
      area: existing.area ? Number(existing.area) : null,
      area_unit: existing.area_unit,
      units_available: existing.units_available,
      is_featured: existing.is_featured,
      project_id: existing.project_id,
      project_unit_type_id: existing.project_unit_type_id,
      amenity_ids: (existingBundle.amenities || []).map((a) => a.id),
      tag_ids: (existingBundle.tags || []).map((t) => t.id),
    };

    const newValuesSnapshot = {
      title: data.title,
      price: newPriceNum,
      location: data.location,
      address: data.address,
      property_type_id: data.property_type_id,
      listing_type: data.listing_type,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      area_unit: data.area_unit,
      units_available: data.units_available,
      is_featured: data.is_featured,
      project_id: data.project_id,
      project_unit_type_id: data.project_unit_type_id,
      amenity_ids: data.amenity_ids,
      tag_ids: data.tag_ids,
    };

    await connection.query(
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
        ) VALUES (?, 'update_property', 'property', ?, ?, ?, ?, ?)
      `,
      [
        adminContext.clerkUserId,
        id,
        JSON.stringify(oldValuesSnapshot),
        JSON.stringify(newValuesSnapshot),
        adminContext.ipAddress || null,
        adminContext.userAgent || null,
      ]
    );

    await connection.commit();
    return id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Executes an atomic MySQL transaction to update property status,
 * set published_at or archived_at, record property_status_history, and log admin_activity_logs.
 */
async function updatePropertyStatusTransaction(id, newStatus, reason, existingProperty, adminContext) {
  const connection = await pool.getConnection();
  const oldStatus = existingProperty.status;

  try {
    await connection.beginTransaction();

    // 1. Update status and lifecycle timestamps
    if (newStatus === 'published') {
      await connection.query(
        `
          UPDATE properties
          SET
            status = 'published',
            published_at = COALESCE(published_at, NOW()),
            updated_by_clerk_user_id = ?
          WHERE id = ? AND deleted_at IS NULL
        `,
        [adminContext.clerkUserId, id]
      );
    } else if (newStatus === 'archived') {
      await connection.query(
        `
          UPDATE properties
          SET
            status = 'archived',
            archived_at = NOW(),
            updated_by_clerk_user_id = ?
          WHERE id = ? AND deleted_at IS NULL
        `,
        [adminContext.clerkUserId, id]
      );
    } else {
      await connection.query(
        `
          UPDATE properties
          SET
            status = 'draft',
            updated_by_clerk_user_id = ?
          WHERE id = ? AND deleted_at IS NULL
        `,
        [adminContext.clerkUserId, id]
      );
    }

    // 2. Insert property_status_history
    await connection.query(
      `
        INSERT INTO property_status_history (
          property_id,
          old_status,
          new_status,
          changed_by_clerk_user_id,
          reason
        ) VALUES (?, ?, ?, ?, ?)
      `,
      [id, oldStatus, newStatus, adminContext.clerkUserId, reason || null]
    );

    // 3. Insert admin_activity_logs
    await connection.query(
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
        ) VALUES (?, 'update_property_status', 'property', ?, ?, ?, ?, ?)
      `,
      [
        adminContext.clerkUserId,
        id,
        JSON.stringify({ status: oldStatus }),
        JSON.stringify({ status: newStatus, reason: reason || null }),
        adminContext.ipAddress || null,
        adminContext.userAgent || null,
      ]
    );

    await connection.commit();
    return id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Retrieves all active property tags for form selectors.
 */
async function findActiveTags() {
  const [rows] = await pool.query(
    `
      SELECT id, name, slug, sort_order
      FROM property_tags
      WHERE is_active = 1
      ORDER BY sort_order ASC, name ASC
    `
  );
  return rows;
}

/**
 * Retrieves all projects and their unit types for form selectors.
 */
async function findProjectsWithUnitTypes() {
  const [[projects], [unitTypes]] = await Promise.all([
    pool.query(
      `
        SELECT id, name, location, status, launch_date, possession_date
        FROM projects
        ORDER BY name ASC
      `
    ),
    pool.query(
      `
        SELECT id, project_id, name, bedrooms, bathrooms, area, area_unit, base_price, units_available
        FROM project_unit_types
        ORDER BY project_id ASC, name ASC
      `
    ),
  ]);

  const unitsByProject = {};
  for (const unit of unitTypes) {
    if (!unitsByProject[unit.project_id]) {
      unitsByProject[unit.project_id] = [];
    }
    unitsByProject[unit.project_id].push(unit);
  }

  return projects.map((proj) => ({
    ...proj,
    unitTypes: unitsByProject[proj.id] || [],
  }));
}

module.exports = {
  findAdminProperties,
  findAdminPropertyById,
  findActivePropertyTypeById,
  findProjectById,
  findProjectUnitTypeById,
  findValidActiveAmenityIds,
  findValidActiveTagIds,
  createPropertyTransaction,
  updatePropertyTransaction,
  updatePropertyStatusTransaction,
  findActiveTags,
  findProjectsWithUnitTypes,
};
