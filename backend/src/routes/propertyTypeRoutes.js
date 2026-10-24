const express = require('express');
const propertyTypeController = require('../controllers/propertyTypeController');

const router = express.Router();

// GET /api/property-types
router.get('/', propertyTypeController.getPropertyTypes);

module.exports = router;
