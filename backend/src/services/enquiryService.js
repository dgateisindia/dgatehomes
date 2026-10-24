const enquiryRepository = require('../repositories/enquiryRepository');

/**
 * Handles public enquiry submission.
 * Verifies property availability and executes transactional database insertion.
 * @param {{ property_id: number, name: string, phone: string, email: string | null, message: string | null, source: string }} enquiryData
 * @returns {Promise<{ propertyFound: boolean, enquiryId?: number }>}
 */
async function submitEnquiry(enquiryData) {
  // Confirm property exists, is published, and not deleted
  const isPropertyAvailable = await enquiryRepository.findPublicPropertyById(enquiryData.property_id);

  if (!isPropertyAvailable) {
    return {
      propertyFound: false,
    };
  }

  // Create enquiry and activity in single transaction
  const enquiryId = await enquiryRepository.createEnquiryWithActivity(enquiryData);

  return {
    propertyFound: true,
    enquiryId,
  };
}

module.exports = {
  submitEnquiry,
};
