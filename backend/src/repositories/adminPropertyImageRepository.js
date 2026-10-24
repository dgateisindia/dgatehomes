const { pool } = require('../config/db');

/**
 * Formats a property_images row for safe API output (omits internal cloudinary_public_id).
 */
function sanitizeImageRow(row) {
  return {
    id: row.id,
    property_id: row.property_id,
    image_url: row.image_url,
    sort_order: Number(row.sort_order),
    is_cover: Boolean(row.is_cover),
    caption: row.caption || null,
    alt_text: row.alt_text || null,
    width_px: row.width_px != null ? Number(row.width_px) : null,
    height_px: row.height_px != null ? Number(row.height_px) : null,
    created_at: row.created_at,
  };
}

/**
 * Verifies a non-deleted property exists by ID.
 */
async function findActivePropertyById(propertyId) {
  const [rows] = await pool.query(
    'SELECT id, title, slug FROM properties WHERE id = ? AND deleted_at IS NULL LIMIT 1',
    [propertyId]
  );
  return rows[0] || null;
}

/**
 * Retrieves all images for a property ordered by is_cover DESC, sort_order ASC, id ASC.
 */
async function findImagesByPropertyId(propertyId) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        property_id,
        image_url,
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
    `,
    [propertyId]
  );
  return rows.map(sanitizeImageRow);
}

/**
 * Retrieves a single image record (including internal cloudinary_public_id) and verifies it belongs to propertyId.
 */
async function findImageByIdAndPropertyId(imageId, propertyId) {
  const [rows] = await pool.query(
    `
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
      WHERE id = ? AND property_id = ?
      LIMIT 1
    `,
    [imageId, propertyId]
  );
  return rows[0] || null;
}

/**
 * Inserts newly uploaded Cloudinary assets into property_images in a single transaction.
 * Automatically promotes the first uploaded image to cover if the property has no cover image.
 */
async function insertPropertyImagesTransaction(propertyId, uploadedAssets, adminContext) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Lock existing property images to compute sort_order and cover status safely
    const [statsRows] = await connection.query(
      `
        SELECT
          COUNT(*) AS totalCount,
          COALESCE(MAX(sort_order), 0) AS maxSortOrder,
          COALESCE(SUM(CASE WHEN is_cover = 1 THEN 1 ELSE 0 END), 0) AS coverCount
        FROM property_images
        WHERE property_id = ?
        FOR UPDATE
      `,
      [propertyId]
    );

    const stats = statsRows[0] || { totalCount: 0, maxSortOrder: 0, coverCount: 0 };
    const startSortOrder = Number(stats.maxSortOrder) + 1;
    const hasExistingCover = Number(stats.coverCount) > 0;

    const insertedIds = [];

    for (let i = 0; i < uploadedAssets.length; i += 1) {
      const asset = uploadedAssets[i];
      const sortOrder = startSortOrder + i;
      const isCover = !hasExistingCover && i === 0 ? 1 : 0;

      const [res] = await connection.query(
        `
          INSERT INTO property_images (
            property_id,
            image_url,
            cloudinary_public_id,
            sort_order,
            is_cover,
            caption,
            alt_text,
            width_px,
            height_px
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          propertyId,
          asset.secure_url,
          asset.public_id,
          sortOrder,
          isCover,
          asset.caption || null,
          asset.alt_text || null,
          asset.width || null,
          asset.height || null,
        ]
      );

      insertedIds.push(res.insertId);
    }

    // Write audit log: IMAGE_UPLOAD
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
        ) VALUES (?, 'IMAGE_UPLOAD', 'property', ?, NULL, ?, ?, ?)
      `,
      [
        adminContext.clerkUserId,
        propertyId,
        JSON.stringify({
          uploaded_count: uploadedAssets.length,
          image_ids: insertedIds,
          auto_assigned_cover: !hasExistingCover,
        }),
        adminContext.ipAddress || null,
        adminContext.userAgent || null,
      ]
    );

    await connection.commit();
    return insertedIds;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Sets a specific image as the single cover image for a property inside a MySQL transaction.
 */
async function setCoverImageTransaction(propertyId, imageId, adminContext) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verify target image belongs to propertyId
    const [targetRows] = await connection.query(
      'SELECT id, is_cover FROM property_images WHERE id = ? AND property_id = ? FOR UPDATE',
      [imageId, propertyId]
    );

    if (targetRows.length === 0) {
      await connection.rollback();
      return false;
    }

    // Find old cover image for audit logging
    const [oldCoverRows] = await connection.query(
      'SELECT id FROM property_images WHERE property_id = ? AND is_cover = 1 LIMIT 1',
      [propertyId]
    );
    const oldCoverId = oldCoverRows[0]?.id || null;

    // 1. Set all images for property to is_cover = 0
    await connection.query(
      'UPDATE property_images SET is_cover = 0 WHERE property_id = ?',
      [propertyId]
    );

    // 2. Set selected image to is_cover = 1
    await connection.query(
      'UPDATE property_images SET is_cover = 1 WHERE id = ? AND property_id = ?',
      [imageId, propertyId]
    );

    // 3. Write audit log: IMAGE_SET_COVER
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
        ) VALUES (?, 'IMAGE_SET_COVER', 'property', ?, ?, ?, ?, ?)
      `,
      [
        adminContext.clerkUserId,
        propertyId,
        JSON.stringify({ cover_image_id: oldCoverId }),
        JSON.stringify({ cover_image_id: Number(imageId) }),
        adminContext.ipAddress || null,
        adminContext.userAgent || null,
      ]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Reorders images for a property in a single MySQL transaction.
 */
async function reorderImagesTransaction(propertyId, orderedItems, adminContext) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      'SELECT id, sort_order FROM property_images WHERE property_id = ? FOR UPDATE',
      [propertyId]
    );

    const existingIdSet = new Set(existingRows.map((r) => Number(r.id)));
    for (const item of orderedItems) {
      if (!existingIdSet.has(Number(item.id))) {
        const notOwnedErr = new Error(
          `Image ID ${item.id} does not belong to property ${propertyId}`
        );
        notOwnedErr.code = 'INVALID_IMAGE_OWNERSHIP';
        throw notOwnedErr;
      }
    }

    const oldOrderSnapshot = existingRows.map((r) => ({
      id: Number(r.id),
      sort_order: Number(r.sort_order),
    }));

    // Update each image's sort_order
    for (const item of orderedItems) {
      await connection.query(
        'UPDATE property_images SET sort_order = ? WHERE id = ? AND property_id = ?',
        [item.sort_order, item.id, propertyId]
      );
    }

    // Write audit log: IMAGE_REORDER
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
        ) VALUES (?, 'IMAGE_REORDER', 'property', ?, ?, ?, ?, ?)
      `,
      [
        adminContext.clerkUserId,
        propertyId,
        JSON.stringify({ images: oldOrderSnapshot }),
        JSON.stringify({ images: orderedItems }),
        adminContext.ipAddress || null,
        adminContext.userAgent || null,
      ]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Updates only caption and alt_text for a property image in a transaction.
 */
async function updateImageMetadataTransaction(
  propertyId,
  imageId,
  { caption, alt_text },
  existingImage,
  adminContext
) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `
        UPDATE property_images
        SET caption = ?, alt_text = ?
        WHERE id = ? AND property_id = ?
      `,
      [caption, alt_text, imageId, propertyId]
    );

    // Write audit log: IMAGE_METADATA_UPDATE
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
        ) VALUES (?, 'IMAGE_METADATA_UPDATE', 'property', ?, ?, ?, ?, ?)
      `,
      [
        adminContext.clerkUserId,
        propertyId,
        JSON.stringify({
          image_id: Number(imageId),
          caption: existingImage.caption || null,
          alt_text: existingImage.alt_text || null,
        }),
        JSON.stringify({
          image_id: Number(imageId),
          caption: caption || null,
          alt_text: alt_text || null,
        }),
        adminContext.ipAddress || null,
        adminContext.userAgent || null,
      ]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Deletes an image row from MySQL and promotes the lowest sort_order remaining image
 * as the new cover if the deleted image was the cover image.
 */
async function deleteImageTransaction(propertyId, imageToDelete, adminContext) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      'DELETE FROM property_images WHERE id = ? AND property_id = ?',
      [imageToDelete.id, propertyId]
    );

    let newCoverImageId = null;

    // If deleted image was the cover image, promote the lowest sort_order remaining image
    if (Number(imageToDelete.is_cover) === 1) {
      const [remainingRows] = await connection.query(
        `
          SELECT id
          FROM property_images
          WHERE property_id = ?
          ORDER BY sort_order ASC, id ASC
          LIMIT 1
          FOR UPDATE
        `,
        [propertyId]
      );

      if (remainingRows.length > 0) {
        newCoverImageId = remainingRows[0].id;
        await connection.query(
          'UPDATE property_images SET is_cover = 1 WHERE id = ? AND property_id = ?',
          [newCoverImageId, propertyId]
        );
      }
    }

    // Write audit log: IMAGE_DELETE
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
        ) VALUES (?, 'IMAGE_DELETE', 'property', ?, ?, ?, ?, ?)
      `,
      [
        adminContext.clerkUserId,
        propertyId,
        JSON.stringify({
          deleted_image_id: Number(imageToDelete.id),
          image_url: imageToDelete.image_url,
          was_cover: Boolean(imageToDelete.is_cover),
        }),
        JSON.stringify({
          promoted_cover_image_id: newCoverImageId,
        }),
        adminContext.ipAddress || null,
        adminContext.userAgent || null,
      ]
    );

    await connection.commit();
    return { newCoverImageId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  sanitizeImageRow,
  findActivePropertyById,
  findImagesByPropertyId,
  findImageByIdAndPropertyId,
  insertPropertyImagesTransaction,
  setCoverImageTransaction,
  reorderImagesTransaction,
  updateImageMetadataTransaction,
  deleteImageTransaction,
};
