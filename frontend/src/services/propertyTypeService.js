import { apiClient } from './apiClient';
import { DEFAULT_PROPERTY_TYPES } from '../config/propertyTypes';

/**
 * Service methods for property types.
 */
export const propertyTypeService = {
  /**
   * Fetches all active property types from MySQL ordered by sort_order ASC, name ASC.
   * Falls back to default config if network is temporarily unreachable.
   * @returns {Promise<Array<{ id: number, name: string, slug: string, segment: string, sort_order: number }>>}
   */
  async getPropertyTypes() {
    try {
      const res = await apiClient('/property-types', {
        method: 'GET',
      });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('Property types endpoint unreachable, using local fallback:', err);
    }
    return DEFAULT_PROPERTY_TYPES;
  },
};
