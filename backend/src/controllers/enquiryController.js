const enquiryService = require('../services/enquiryService');
const { validateEnquiryPayload } = require('../utils/enquiryValidator');

/**
 * POST /api/enquiries
 * Public endpoint to submit an enquiry for a published property.
 */
async function createEnquiry(req, res, next) {
  try {
    const validation = validateEnquiryPayload(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${validation.errors.join('; ')}`,
      });
    }

    const result = await enquiryService.submitEnquiry(validation.data);

    if (!result.propertyFound) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or is not available for enquiries',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: {
        enquiryId: result.enquiryId,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEnquiry,
};
