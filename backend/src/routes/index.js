const express = require('express');
const healthRoutes = require('./healthRoutes');
const propertyRoutes = require('./propertyRoutes');
const enquiryRoutes = require('./enquiryRoutes');
const propertyTypeRoutes = require('./propertyTypeRoutes');
const amenityRoutes = require('./amenityRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// Mount route modules
router.use('/', healthRoutes);
router.use('/properties', propertyRoutes);
router.use('/property-types', propertyTypeRoutes);
router.use('/amenities', amenityRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
