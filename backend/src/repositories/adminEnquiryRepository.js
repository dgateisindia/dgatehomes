const { pool } = require('../config/db');

/**
 * Helper to insert an audit record into admin_activity_logs inside an active transaction.
 */
async function insertAdminAuditLog(connection, {
  clerkUserId,
  action,
  entityType = 'enquiry',
  entityId,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  userAgent = null,
}) {
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
}

/**
 * Retrieves paginated, filtered, and sorted enquiries for admin management.
 */
async function findAdminEnquiries(filters = {}) {
  const {
    search = '',
    status = '',
    assigned_to = '',
    property_id = null,
    date_from = '',
    date_to = '',
    sort = 'newest',
    page = 1,
    limit = 15,
  } = filters;

  const conditions = [];
  const params = [];

  if (search) {
    const likeTerm = `%${search}%`;
    conditions.push('(e.name LIKE ? OR e.phone LIKE ? OR e.email LIKE ?)');
    params.push(likeTerm, likeTerm, likeTerm);
  }

  if (status) {
    conditions.push('e.status = ?');
    params.push(status);
  }

  if (assigned_to) {
    if (assigned_to === 'unassigned') {
      conditions.push('e.assigned_to_clerk_user_id IS NULL');
    } else {
      conditions.push('e.assigned_to_clerk_user_id = ?');
      params.push(assigned_to);
    }
  }

  if (property_id) {
    conditions.push('e.property_id = ?');
    params.push(Number(property_id));
  }

  if (date_from) {
    conditions.push('e.created_at >= ?');
    params.push(`${date_from} 00:00:00`);
  }

  if (date_to) {
    conditions.push('e.created_at <= ?');
    params.push(`${date_to} 23:59:59`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderByClause = 'ORDER BY e.created_at DESC, e.id DESC';
  if (sort === 'next_follow_up') {
    orderByClause = `
      ORDER BY
        CASE WHEN e.next_follow_up_at IS NULL THEN 1 ELSE 0 END ASC,
        e.next_follow_up_at ASC,
        e.created_at DESC,
        e.id DESC
    `;
  }

  const offset = (page - 1) * limit;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM enquiries e
    ${whereClause}
  `;

  const dataSql = `
    SELECT
      e.id,
      e.property_id,
      e.name,
      e.phone,
      e.email,
      e.message,
      e.source,
      e.status,
      e.assigned_to_clerk_user_id,
      e.first_contacted_at,
      e.next_follow_up_at,
      e.closed_at,
      e.last_activity_at,
      e.created_at,
      e.updated_at,
      p.title AS property_title,
      p.location AS property_location,
      p.slug AS property_slug,
      ap.display_name AS admin_display_name,
      ap.role AS admin_role
    FROM enquiries e
    LEFT JOIN properties p ON e.property_id = p.id
    LEFT JOIN admin_profiles ap ON e.assigned_to_clerk_user_id = ap.clerk_user_id
    ${whereClause}
    ${orderByClause}
    LIMIT ? OFFSET ?
  `;

  const [[countResult], [rows]] = await Promise.all([
    pool.query(countSql, params),
    pool.query(dataSql, [...params, Number(limit), Number(offset)]),
  ]);

  const total = Number(countResult[0]?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || null,
    message: row.message || null,
    status: row.status,
    source: row.source || 'website',
    property_id: row.property_id,
    property_title: row.property_title || null,
    property_location: row.property_location || null,
    property_slug: row.property_slug || null,
    assigned_to_clerk_user_id: row.assigned_to_clerk_user_id || null,
    assigned_admin: row.assigned_to_clerk_user_id
      ? {
          clerk_user_id: row.assigned_to_clerk_user_id,
          display_name: row.admin_display_name || 'Administrator',
          role: row.admin_role || 'admin',
        }
      : null,
    next_follow_up_at: row.next_follow_up_at,
    first_contacted_at: row.first_contacted_at,
    closed_at: row.closed_at,
    last_activity_at: row.last_activity_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
  };
}

/**
 * Retrieves full enquiry details including property summary, assigned admin, and activity timeline.
 */
async function findAdminEnquiryById(enquiryId) {
  const enquirySql = `
    SELECT
      e.id,
      e.property_id,
      e.name,
      e.phone,
      e.email,
      e.message,
      e.source,
      e.status,
      e.assigned_to_clerk_user_id,
      e.first_contacted_at,
      e.next_follow_up_at,
      e.closed_at,
      e.last_activity_at,
      e.created_at,
      e.updated_at,
      p.id AS prop_id,
      p.title AS prop_title,
      p.slug AS prop_slug,
      p.location AS prop_location,
      p.address AS prop_address,
      p.price AS prop_price,
      p.listing_type AS prop_listing_type,
      p.status AS prop_status,
      p.bedrooms AS prop_bedrooms,
      p.bathrooms AS prop_bathrooms,
      p.area AS prop_area,
      p.area_unit AS prop_area_unit,
      pt.name AS prop_type_name,
      ap.id AS admin_id,
      ap.display_name AS admin_display_name,
      ap.role AS admin_role,
      ap.is_active AS admin_is_active
    FROM enquiries e
    LEFT JOIN properties p ON e.property_id = p.id
    LEFT JOIN property_types pt ON p.property_type_id = pt.id
    LEFT JOIN admin_profiles ap ON e.assigned_to_clerk_user_id = ap.clerk_user_id
    WHERE e.id = ?
    LIMIT 1
  `;

  const activitySql = `
    SELECT
      ea.id,
      ea.enquiry_id,
      ea.actor_clerk_user_id,
      ea.activity_type,
      ea.note,
      ea.old_status,
      ea.new_status,
      ea.next_follow_up_at,
      ea.created_at,
      ap.display_name AS actor_display_name,
      ap.role AS actor_role
    FROM enquiry_activity ea
    LEFT JOIN admin_profiles ap ON ea.actor_clerk_user_id = ap.clerk_user_id
    WHERE ea.enquiry_id = ?
    ORDER BY ea.created_at DESC, ea.id DESC
  `;

  const [[enquiryRows], [activityRows]] = await Promise.all([
    pool.query(enquirySql, [enquiryId]),
    pool.query(activitySql, [enquiryId]),
  ]);

  const row = enquiryRows[0];
  if (!row) {
    return null;
  }

  return {
    enquiry: {
      id: row.id,
      property_id: row.property_id,
      name: row.name,
      phone: row.phone,
      email: row.email || null,
      message: row.message || null,
      source: row.source || 'website',
      status: row.status,
      assigned_to_clerk_user_id: row.assigned_to_clerk_user_id || null,
      first_contacted_at: row.first_contacted_at,
      next_follow_up_at: row.next_follow_up_at,
      closed_at: row.closed_at,
      last_activity_at: row.last_activity_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    property: row.prop_id
      ? {
          id: row.prop_id,
          title: row.prop_title,
          slug: row.prop_slug,
          location: row.prop_location,
          address: row.prop_address,
          price: row.prop_price != null ? Number(row.prop_price) : null,
          listing_type: row.prop_listing_type,
          status: row.prop_status,
          property_type: row.prop_type_name || null,
          bedrooms: row.prop_bedrooms,
          bathrooms: row.prop_bathrooms,
          area: row.prop_area != null ? Number(row.prop_area) : null,
          area_unit: row.prop_area_unit,
        }
      : null,
    assignedAdmin: row.assigned_to_clerk_user_id
      ? {
          id: row.admin_id || null,
          clerk_user_id: row.assigned_to_clerk_user_id,
          display_name: row.admin_display_name || 'Administrator',
          role: row.admin_role || 'admin',
          is_active: row.admin_is_active != null ? Boolean(row.admin_is_active) : true,
        }
      : null,
    activities: activityRows.map((act) => ({
      id: act.id,
      enquiry_id: act.enquiry_id,
      actor_clerk_user_id: act.actor_clerk_user_id || null,
      actor_display_name:
        act.actor_display_name ||
        (act.actor_clerk_user_id ? 'Administrator' : 'Public Website'),
      actor_role: act.actor_role || null,
      activity_type: act.activity_type,
      note: act.note || null,
      old_status: act.old_status || null,
      new_status: act.new_status || null,
      next_follow_up_at: act.next_follow_up_at || null,
      created_at: act.created_at,
    })),
  };
}

/**
 * Lists all active administrators from admin_profiles.
 */
async function findActiveAdmins() {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        clerk_user_id,
        display_name,
        role
      FROM admin_profiles
      WHERE is_active = 1
      ORDER BY role DESC, display_name ASC, id ASC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    clerk_user_id: row.clerk_user_id,
    display_name: row.display_name || `Admin (${row.clerk_user_id.slice(-6)})`,
    role: row.role,
  }));
}

/**
 * Finds an admin profile by clerk_user_id.
 */
async function findAdminByClerkUserId(clerkUserId) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        clerk_user_id,
        display_name,
        role,
        is_active
      FROM admin_profiles
      WHERE clerk_user_id = ?
      LIMIT 1
    `,
    [clerkUserId]
  );

  return rows[0] || null;
}

/**
 * Updates enquiry status inside a MySQL transaction.
 * Rules:
 * - write enquiry_activity with old_status and new_status
 * - set first_contacted_at when moving to contacted for the first time
 * - set closed_at when status becomes closed
 * - clear closed_at if reopening from closed
 * - update last_activity_at
 * - write admin_activity_logs (ENQUIRY_STATUS_UPDATE)
 */
async function updateEnquiryStatusTransaction(enquiryId, newStatus, note, adminContext) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT
          id,
          status,
          first_contacted_at,
          closed_at
        FROM enquiries
        WHERE id = ?
        FOR UPDATE
      `,
      [enquiryId]
    );

    const existing = rows[0];
    if (!existing) {
      await connection.rollback();
      return null;
    }

    const oldStatus = existing.status;

    // Update enquiry record with conditional timestamp rules
    await connection.query(
      `
        UPDATE enquiries
        SET
          status = ?,
          first_contacted_at = CASE
            WHEN ? = 'contacted' AND first_contacted_at IS NULL THEN NOW()
            ELSE first_contacted_at
          END,
          closed_at = CASE
            WHEN ? = 'closed' THEN NOW()
            WHEN ? <> 'closed' THEN NULL
            ELSE closed_at
          END,
          last_activity_at = NOW()
        WHERE id = ?
      `,
      [newStatus, newStatus, newStatus, newStatus, enquiryId]
    );

    // Determine activity_type: 'closed' when closing, 'status_changed' otherwise
    const activityType = newStatus === 'closed' ? 'closed' : 'status_changed';
    const defaultNote =
      newStatus === 'closed'
        ? `Enquiry closed (previous status: ${oldStatus}).`
        : `Status changed from ${oldStatus} to ${newStatus}.`;

    await connection.query(
      `
        INSERT INTO enquiry_activity (
          enquiry_id,
          actor_clerk_user_id,
          activity_type,
          note,
          old_status,
          new_status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        enquiryId,
        adminContext.clerkUserId,
        activityType,
        note || defaultNote,
        oldStatus,
        newStatus,
      ]
    );

    await insertAdminAuditLog(connection, {
      clerkUserId: adminContext.clerkUserId,
      action: 'ENQUIRY_STATUS_UPDATE',
      entityId: enquiryId,
      oldValues: { status: oldStatus, closed_at: existing.closed_at },
      newValues: { status: newStatus, note: note || null },
      ipAddress: adminContext.ipAddress,
      userAgent: adminContext.userAgent,
    });

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return findAdminEnquiryById(enquiryId);
}

/**
 * Assigns an enquiry to an active admin inside a MySQL transaction.
 */
async function assignEnquiryTransaction(enquiryId, targetAdmin, note, adminContext) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT id, assigned_to_clerk_user_id
        FROM enquiries
        WHERE id = ?
        FOR UPDATE
      `,
      [enquiryId]
    );

    const existing = rows[0];
    if (!existing) {
      await connection.rollback();
      return null;
    }

    const previousAssignee = existing.assigned_to_clerk_user_id || null;
    const newAssignee = targetAdmin.clerk_user_id;

    await connection.query(
      `
        UPDATE enquiries
        SET
          assigned_to_clerk_user_id = ?,
          last_activity_at = NOW()
        WHERE id = ?
      `,
      [newAssignee, enquiryId]
    );

    const adminLabel = targetAdmin.display_name || targetAdmin.clerk_user_id;
    const activityNote = note || `Assigned enquiry to ${adminLabel}.`;

    await connection.query(
      `
        INSERT INTO enquiry_activity (
          enquiry_id,
          actor_clerk_user_id,
          activity_type,
          note
        ) VALUES (?, ?, 'assigned', ?)
      `,
      [enquiryId, adminContext.clerkUserId, activityNote]
    );

    await insertAdminAuditLog(connection, {
      clerkUserId: adminContext.clerkUserId,
      action: 'ENQUIRY_ASSIGN',
      entityId: enquiryId,
      oldValues: { assigned_to_clerk_user_id: previousAssignee },
      newValues: {
        assigned_to_clerk_user_id: newAssignee,
        assigned_display_name: targetAdmin.display_name || null,
        note: note || null,
      },
      ipAddress: adminContext.ipAddress,
      userAgent: adminContext.userAgent,
    });

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return findAdminEnquiryById(enquiryId);
}

/**
 * Schedules a follow-up for an enquiry inside a MySQL transaction.
 */
async function addFollowUpTransaction(enquiryId, nextFollowUpMysqlDatetime, note, adminContext) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT id, next_follow_up_at
        FROM enquiries
        WHERE id = ?
        FOR UPDATE
      `,
      [enquiryId]
    );

    const existing = rows[0];
    if (!existing) {
      await connection.rollback();
      return null;
    }

    const previousFollowUp = existing.next_follow_up_at || null;

    await connection.query(
      `
        UPDATE enquiries
        SET
          next_follow_up_at = ?,
          last_activity_at = NOW()
        WHERE id = ?
      `,
      [nextFollowUpMysqlDatetime, enquiryId]
    );

    const activityNote = note || `Scheduled follow-up for ${nextFollowUpMysqlDatetime}.`;

    await connection.query(
      `
        INSERT INTO enquiry_activity (
          enquiry_id,
          actor_clerk_user_id,
          activity_type,
          note,
          next_follow_up_at
        ) VALUES (?, ?, 'follow_up_added', ?, ?)
      `,
      [
        enquiryId,
        adminContext.clerkUserId,
        activityNote,
        nextFollowUpMysqlDatetime,
      ]
    );

    await insertAdminAuditLog(connection, {
      clerkUserId: adminContext.clerkUserId,
      action: 'ENQUIRY_FOLLOW_UP',
      entityId: enquiryId,
      oldValues: { next_follow_up_at: previousFollowUp },
      newValues: { next_follow_up_at: nextFollowUpMysqlDatetime, note: note || null },
      ipAddress: adminContext.ipAddress,
      userAgent: adminContext.userAgent,
    });

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return findAdminEnquiryById(enquiryId);
}

/**
 * Adds a note to an enquiry inside a MySQL transaction.
 */
async function addNoteTransaction(enquiryId, note, adminContext) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT id
        FROM enquiries
        WHERE id = ?
        FOR UPDATE
      `,
      [enquiryId]
    );

    const existing = rows[0];
    if (!existing) {
      await connection.rollback();
      return null;
    }

    await connection.query(
      `
        UPDATE enquiries
        SET last_activity_at = NOW()
        WHERE id = ?
      `,
      [enquiryId]
    );

    await connection.query(
      `
        INSERT INTO enquiry_activity (
          enquiry_id,
          actor_clerk_user_id,
          activity_type,
          note
        ) VALUES (?, ?, 'note_added', ?)
      `,
      [enquiryId, adminContext.clerkUserId, note]
    );

    await insertAdminAuditLog(connection, {
      clerkUserId: adminContext.clerkUserId,
      action: 'ENQUIRY_NOTE',
      entityId: enquiryId,
      oldValues: null,
      newValues: { note },
      ipAddress: adminContext.ipAddress,
      userAgent: adminContext.userAgent,
    });

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return findAdminEnquiryById(enquiryId);
}

module.exports = {
  findAdminEnquiries,
  findAdminEnquiryById,
  findActiveAdmins,
  findAdminByClerkUserId,
  updateEnquiryStatusTransaction,
  assignEnquiryTransaction,
  addFollowUpTransaction,
  addNoteTransaction,
};
