const AppError = require('../utils/appError');
const {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require('../config/cloudinary');
const adminPropertyImageRepository = require('../repositories/adminPropertyImageRepository');

/**
 * Validates propertyId parameter and ensures the property exists.
 */
async function ensurePropertyExists(rawPropertyId) {
  const propertyId = Number(rawPropertyId);
  if (!Number.isInteger(propertyId) || propertyId < 1) {
    throw new AppError('propertyId must be a valid positive integer', 400);
  }

  const property = await adminPropertyImageRepository.findActivePropertyById(propertyId);
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  return { propertyId, property };
}

/**
 * Uploads one or more images to Cloudinary and persists references in MySQL.
 * Implements compensation cleanup if any upload or DB insert fails.
 */
async function uploadPropertyImages(rawPropertyId, files, rawBody = {}, adminContext) {
  const { propertyId, property } = await ensurePropertyExists(rawPropertyId);

  if (!Array.isArray(files) || files.length === 0) {
    throw new AppError('At least one image file is required for upload', 400);
  }

  // Parse optional per-file captions / alt_texts if provided
  let captions = [];
  let altTexts = [];
  try {
    if (typeof rawBody.captions === 'string') {
      captions = JSON.parse(rawBody.captions);
    } else if (Array.isArray(rawBody.captions)) {
      captions = rawBody.captions;
    }
  } catch {
    captions = [];
  }

  try {
    if (typeof rawBody.alt_texts === 'string') {
      altTexts = JSON.parse(rawBody.alt_texts);
    } else if (Array.isArray(rawBody.alt_texts)) {
      altTexts = rawBody.alt_texts;
    }
  } catch {
    altTexts = [];
  }

  const folder = `dgate-homes/properties/${propertyId}`;
  const newlyUploadedPublicIds = [];
  const uploadedAssets = [];

  try {
    // 1. Upload each file to Cloudinary sequentially to track every created public_id
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const uploaded = await uploadBufferToCloudinary(file.buffer, folder);
      newlyUploadedPublicIds.push(uploaded.public_id);

      const rawCaption =
        captions[i] !== undefined
          ? String(captions[i]).trim()
          : rawBody.caption
          ? String(rawBody.caption).trim()
          : '';
      const rawAlt =
        altTexts[i] !== undefined
          ? String(altTexts[i]).trim()
          : rawBody.alt_text
          ? String(rawBody.alt_text).trim()
          : property.title;

      uploadedAssets.push({
        secure_url: uploaded.secure_url,
        public_id: uploaded.public_id,
        width: uploaded.width,
        height: uploaded.height,
        caption: rawCaption ? rawCaption.slice(0, 255) : null,
        alt_text: rawAlt ? rawAlt.slice(0, 255) : null,
      });
    }

    // 2. Persist references in MySQL within a transaction
    await adminPropertyImageRepository.insertPropertyImagesTransaction(
      propertyId,
      uploadedAssets,
      adminContext
    );

    return adminPropertyImageRepository.findImagesByPropertyId(propertyId);
  } catch (error) {
    // Compensation logic: clean up newly uploaded Cloudinary assets from this failed request
    if (newlyUploadedPublicIds.length > 0) {
      console.warn(
        `[Image Upload Compensation] Cleaning up ${newlyUploadedPublicIds.length} newly uploaded Cloudinary asset(s) for propertyId=${propertyId}`
      );
      await Promise.allSettled(
        newlyUploadedPublicIds.map((pubId) => deleteFromCloudinary(pubId))
      );
    }

    throw error;
  }
}

/**
 * Sets an image as the single cover image for a property.
 */
async function setPropertyCoverImage(rawPropertyId, rawImageId, adminContext) {
  const { propertyId } = await ensurePropertyExists(rawPropertyId);
  const imageId = Number(rawImageId);
  if (!Number.isInteger(imageId) || imageId < 1) {
    throw new AppError('imageId must be a valid positive integer', 400);
  }

  const existingImage = await adminPropertyImageRepository.findImageByIdAndPropertyId(
    imageId,
    propertyId
  );
  if (!existingImage) {
    throw new AppError('Image not found for this property', 404);
  }

  await adminPropertyImageRepository.setCoverImageTransaction(
    propertyId,
    imageId,
    adminContext
  );

  return adminPropertyImageRepository.findImagesByPropertyId(propertyId);
}

/**
 * Reorders images for a property inside a transaction.
 */
async function reorderPropertyImages(rawPropertyId, rawBody = {}, adminContext) {
  const { propertyId } = await ensurePropertyExists(rawPropertyId);

  if (!rawBody || !Array.isArray(rawBody.images) || rawBody.images.length === 0) {
    throw new AppError('images array is required and must not be empty', 400);
  }

  const seenIds = new Set();
  const seenSortOrders = new Set();
  const parsedItems = [];

  for (const item of rawBody.images) {
    if (!item || typeof item !== 'object') {
      throw new AppError('Each entry in images must be an object with id and sort_order', 400);
    }

    const id = Number(item.id);
    const sortOrder = Number(item.sort_order);

    if (!Number.isInteger(id) || id < 1) {
      throw new AppError('All image IDs in reorder payload must be positive integers', 400);
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      throw new AppError('All sort_order values must be non-negative integers', 400);
    }

    if (seenIds.has(id)) {
      throw new AppError(`Duplicate image id (${id}) in reorder request`, 400);
    }
    if (seenSortOrders.has(sortOrder)) {
      throw new AppError(
        `Duplicate sort_order (${sortOrder}) in reorder request is not allowed`,
        400
      );
    }

    seenIds.add(id);
    seenSortOrders.add(sortOrder);
    parsedItems.push({ id, sort_order: sortOrder });
  }

  // Sort by requested sort_order and normalize to 1..N sequence
  parsedItems.sort((a, b) => a.sort_order - b.sort_order);
  const normalizedItems = parsedItems.map((item, idx) => ({
    id: item.id,
    sort_order: idx + 1,
  }));

  try {
    await adminPropertyImageRepository.reorderImagesTransaction(
      propertyId,
      normalizedItems,
      adminContext
    );
  } catch (err) {
    if (err.code === 'INVALID_IMAGE_OWNERSHIP') {
      throw new AppError(err.message, 400);
    }
    throw err;
  }

  return adminPropertyImageRepository.findImagesByPropertyId(propertyId);
}

/**
 * Updates image metadata (caption and alt_text only).
 */
async function updatePropertyImageMetadata(
  rawPropertyId,
  rawImageId,
  rawBody = {},
  adminContext
) {
  const { propertyId } = await ensurePropertyExists(rawPropertyId);
  const imageId = Number(rawImageId);
  if (!Number.isInteger(imageId) || imageId < 1) {
    throw new AppError('imageId must be a valid positive integer', 400);
  }

  if (!rawBody || typeof rawBody !== 'object') {
    throw new AppError('Invalid request body', 400);
  }

  // Reject attempts to modify immutable image reference fields
  const forbiddenFields = ['cloudinary_public_id', 'image_url', 'property_id'];
  for (const field of forbiddenFields) {
    if (rawBody[field] !== undefined) {
      throw new AppError(`Modifying ${field} is not permitted`, 400);
    }
  }

  const existingImage = await adminPropertyImageRepository.findImageByIdAndPropertyId(
    imageId,
    propertyId
  );
  if (!existingImage) {
    throw new AppError('Image not found for this property', 404);
  }

  let caption = existingImage.caption;
  if (rawBody.caption !== undefined) {
    if (rawBody.caption === null || String(rawBody.caption).trim() === '') {
      caption = null;
    } else {
      const capStr = String(rawBody.caption).trim();
      if (capStr.length > 255) {
        throw new AppError('caption must not exceed 255 characters', 400);
      }
      caption = capStr;
    }
  }

  let altText = existingImage.alt_text;
  if (rawBody.alt_text !== undefined) {
    if (rawBody.alt_text === null || String(rawBody.alt_text).trim() === '') {
      altText = null;
    } else {
      const altStr = String(rawBody.alt_text).trim();
      if (altStr.length > 255) {
        throw new AppError('alt_text must not exceed 255 characters', 400);
      }
      altText = altStr;
    }
  }

  await adminPropertyImageRepository.updateImageMetadataTransaction(
    propertyId,
    imageId,
    { caption, alt_text: altText },
    existingImage,
    adminContext
  );

  return adminPropertyImageRepository.findImagesByPropertyId(propertyId);
}

/**
 * Deletes a property image from Cloudinary and MySQL.
 * Promotes the lowest sort_order remaining image if the cover image was deleted.
 */
async function deletePropertyImage(rawPropertyId, rawImageId, adminContext) {
  const { propertyId } = await ensurePropertyExists(rawPropertyId);
  const imageId = Number(rawImageId);
  if (!Number.isInteger(imageId) || imageId < 1) {
    throw new AppError('imageId must be a valid positive integer', 400);
  }

  const existingImage = await adminPropertyImageRepository.findImageByIdAndPropertyId(
    imageId,
    propertyId
  );
  if (!existingImage) {
    throw new AppError('Image not found for this property', 404);
  }

  // 1. Delete asset from Cloudinary using DB-stored cloudinary_public_id
  await deleteFromCloudinary(existingImage.cloudinary_public_id);

  // 2. Delete MySQL row and promote replacement cover image if needed
  try {
    await adminPropertyImageRepository.deleteImageTransaction(
      propertyId,
      existingImage,
      adminContext
    );
  } catch (dbError) {
    console.error(
      '[CRITICAL INCONSISTENCY] Cloudinary asset deleted but MySQL deletion failed:',
      JSON.stringify({
        propertyId,
        imageId,
        cloudinaryPublicId: existingImage.cloudinary_public_id,
        imageUrl: existingImage.image_url,
        error: dbError.message,
      })
    );

    throw new AppError(
      'Image was removed from media storage, but database update failed. This inconsistency has been logged for manual recovery.',
      500
    );
  }

  return adminPropertyImageRepository.findImagesByPropertyId(propertyId);
}

module.exports = {
  uploadPropertyImages,
  setPropertyCoverImage,
  reorderPropertyImages,
  updatePropertyImageMetadata,
  deletePropertyImage,
};
