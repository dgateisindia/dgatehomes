const multer = require('multer');
const path = require('path');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per file
const MAX_FILES_PER_REQUEST = 10;

const storage = multer.memoryStorage();

const multerUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES_PER_REQUEST,
  },
  fileFilter: (req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const ext = path.extname(file.originalname || '').toLowerCase();

    if (!ALLOWED_MIME_TYPES.includes(mime) || !ALLOWED_EXTENSIONS.includes(ext)) {
      const err = new Error(
        'Unsupported file type. Only JPEG, PNG, WebP, and AVIF images are allowed.'
      );
      err.statusCode = 400;
      err.isOperational = true;
      return cb(err, false);
    }

    return cb(null, true);
  },
});

/**
 * Middleware to handle multipart/form-data image uploads under field name "images".
 * Converts Multer errors into safe HTTP 400 responses.
 */
function uploadPropertyImagesMiddleware(req, res, next) {
  const uploadHandler = multerUpload.array('images', MAX_FILES_PER_REQUEST);

  uploadHandler(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 10 MB per-image limit.',
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: `You can upload at most ${MAX_FILES_PER_REQUEST} images per request (field name: "images").`,
        });
      }
      return res.status(400).json({
        success: false,
        message: `Image upload error: ${err.message}`,
      });
    }

    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Invalid image upload request.',
    });
  });
}

module.exports = {
  uploadPropertyImagesMiddleware,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_REQUEST,
};
