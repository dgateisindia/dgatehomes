import { useState, useEffect, useCallback } from 'react';
import { propertyService } from '../services/propertyService';

/**
 * Hook to fetch and manage featured properties.
 * @param {number} [limit=6]
 */
export function useFeaturedProperties(limit = 6) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeatured = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await propertyService.getFeaturedProperties(limit);
      if (response && response.success) {
        setProperties(response.data || []);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error('Failed to load featured properties:', err);
      setError(err.message || 'Failed to fetch featured properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return {
    properties,
    loading,
    error,
    refetch: fetchFeatured,
  };
}
