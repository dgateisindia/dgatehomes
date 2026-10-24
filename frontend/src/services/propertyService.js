import { apiClient } from './apiClient';
import { propertyTypeService } from './propertyTypeService';

/**
 * Service methods for properties.
 */
export const propertyService = {
  /**
   * Fetches all available property types via propertyTypeService.
   * @returns {Promise<Array<{ id: number, name: string, slug?: string }>>}
   */
  async getPropertyTypes() {
    return propertyTypeService.getPropertyTypes();
  },

  /**
   * Fetches featured public properties for the home page.
   * @param {number} [limit=6]
   * @returns {Promise<{ success: boolean, data: any[], pagination: any }>}
   */
  async getFeaturedProperties(limit = 6) {
    return apiClient('/properties', {
      method: 'GET',
      params: {
        featured: true,
        limit,
      },
    });
  },

  /**
   * Fetches properties with optional search filters, sorting, and pagination.
   * @param {Record<string, any>} [filters={}]
   * @returns {Promise<{ success: boolean, data: any[], pagination: any }>}
   */
  async getProperties(filters = {}) {
    return apiClient('/properties', {
      method: 'GET',
      params: filters,
    });
  },

  /**
   * Fetches single property details by slug.
   * @param {string} slug
   * @returns {Promise<{ success: boolean, data: any }>}
   */
  async getPropertyBySlug(slug) {
    return apiClient(`/properties/${encodeURIComponent(slug)}`, {
      method: 'GET',
    });
  },
};
