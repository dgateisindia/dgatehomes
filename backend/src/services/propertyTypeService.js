const propertyTypeRepository = require('../repositories/propertyTypeRepository');

/**
 * Retrieves all active property types.
 * @returns {Promise<any[]>}
 */
async function getActivePropertyTypes() {
  return propertyTypeRepository.findActivePropertyTypes();
}

module.exports = {
  getActivePropertyTypes,
};
