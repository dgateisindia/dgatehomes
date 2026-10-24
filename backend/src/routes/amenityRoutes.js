const express = require('express');
const amenityController = require('../controllers/amenityController');

const router = express.Router();

// GET /api/amenities
router.get('/', amenityController.getAmenities);

module.exports = router;
