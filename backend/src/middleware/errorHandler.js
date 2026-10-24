const config = require('../config/env');

/**
 * Handle 404 - Not Found for unhandled routes
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    status: 'error',
    message: `Not Found - Cannot ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Centralized error handler middleware.
 * Ensures internal credentials, SQL errors, and sensitive stack traces are never leaked.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  // Safe server-side error logging
  console.error(`[Error] ${req.method} ${req.originalUrl} - status: ${statusCode}:`, err.message);
  if (config.nodeEnv === 'development' && err.stack) {
    console.error(err.stack);
  }

  // Safe client response: only expose client-facing message if operational and < 500
  const isSafeClientError = Boolean(err.isOperational && statusCode < 500);
  const clientMessage = isSafeClientError
    ? err.message
    : (statusCode === 404 ? err.message : 'An unexpected server error occurred.');

  res.status(statusCode).json({
    success: false,
    status: 'error',
    message: clientMessage,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
