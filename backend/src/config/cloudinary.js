const cloudinary = require('cloudinary').v2;
const config = require('./env');
const AppError = require('../utils/appError');

/**
 * Configure Cloudinary Node SDK using credentials from environment variables.
 * Never logs or exposes CLOUDINARY_API_SECRET.
 */
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

/**
 * Checks if all required Cloudinary credentials are present in configuration.
 * @returns {boolean}
 */
function isCloudinaryConfigured() {
  return Boolean(
    config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret
  );
}

/**
 * Validates Cloudinary configuration on startup.
 * Logs status safely without exposing CLOUDINARY_API_SECRET.
 * @returns {boolean}
 */
function validateCloudinaryConfig() {
  const missing = [];
  if (!config.cloudinary.cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!config.cloudinary.apiKey) missing.push('CLOUDINARY_API_KEY');
  if (!config.cloudinary.apiSecret) missing.push('CLOUDINARY_API_SECRET');

  if (missing.length > 0) {
    console.warn(
      `[Cloudinary Warning] Missing environment variable(s): ${missing.join(', ')}. Property image uploads will be unavailable until configured.`
    );
    return false;
  }

  // Mask API key for log display (e.g. ***1234), never log the secret
  const apiKeyStr = String(config.cloudinary.apiKey);
  const maskedKey =
    apiKeyStr.length > 4 ? `***${apiKeyStr.slice(-4)}` : '***';

  console.log(
    `[Cloudinary] Successfully configured for cloud: "${config.cloudinary.cloudName}" (API Key: ${maskedKey}, Secret: [PROTECTED])`
  );
  return true;
}

/**
 * Uploads an image buffer to Cloudinary under the specified folder.
 * Target folder format: dgate-homes/properties/{propertyId}
 *
 * @param {Buffer} buffer - File binary buffer from multer memoryStorage
 * @param {string} folder - Target folder (e.g. 'dgate-homes/properties/12')
 * @returns {Promise<{ secure_url: string, public_id: string, width: number|null, height: number|null }>}
 */
function uploadBufferToCloudinary(buffer, folder) {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(
      new AppError(
        'Media storage service (Cloudinary) is not configured on the server.',
        503
      )
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Upload error:', error.message);
          return reject(
            new AppError('Failed to upload image to media storage.', 502)
          );
        }
        return resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width || null,
          height: result.height || null,
        });
      }
    );

    stream.end(buffer);
  });
}

/**
 * Deletes an image asset from Cloudinary by public_id.
 *
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<{ result: string }>}
 */
async function deleteFromCloudinary(publicId) {
  if (!publicId) {
    return { result: 'not_found' };
  }

  if (!isCloudinaryConfigured()) {
    throw new AppError(
      'Media storage service (Cloudinary) is not configured on the server.',
      503
    );
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });
    return res;
  } catch (error) {
    console.error('[Cloudinary] Delete error:', error.message);
    throw new AppError('Failed to delete image from media storage.', 502);
  }
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  validateCloudinaryConfig,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
};
