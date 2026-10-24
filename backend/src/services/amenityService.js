const amenityRepository = require('../repositories/amenityRepository');

/**
 * Retrieves all active amenities.
 * @returns {Promise<any[]>}
 */
async function getActiveAmenities() {
  return amenityRepository.findActiveAmenities();
}

module.exports = {
  getActiveAmenities,
};
