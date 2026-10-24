import { apiClient } from './apiClient';

/**
 * Service methods for amenities.
 */
export const amenityService = {
  /**
   * Fetches all active amenities from MySQL ordered by category ASC, sort_order ASC, name ASC.
   * @returns {Promise<Array<{ id: number, name: string, slug?: string, category?: string, icon_key?: string, sort_order?: number }>>}
   */
  async getAmenities() {
    try {
      const res = await apiClient('/amenities', {
        method: 'GET',
      });
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to load active amenities:', err);
      return [];
    }
  },
};
