const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// General API rate limiter
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
});

// Stricter anti-spam limiter specifically for public enquiry submissions
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 enquiry submissions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 'error',
    message: 'Too many enquiry submissions from this IP. Please try again later.',
  },
});

module.exports = rateLimiter;
module.exports.rateLimiter = rateLimiter;
module.exports.enquiryLimiter = enquiryLimiter;
