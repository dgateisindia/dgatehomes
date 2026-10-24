const express = require('express');
const propertyController = require('../controllers/propertyController');

const router = express.Router();

// GET /api/properties/types
router.get('/types', propertyController.getPropertyTypes);

// GET /api/properties
router.get('/', propertyController.getProperties);

// GET /api/properties/:slug
router.get('/:slug', propertyController.getPropertyBySlug);

module.exports = router;
