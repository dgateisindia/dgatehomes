const express = require('express');
const enquiryController = require('../controllers/enquiryController');
const { enquiryLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/enquiries (protected by anti-spam rate limiter)
router.post('/', enquiryLimiter, enquiryController.createEnquiry);

module.exports = router;
