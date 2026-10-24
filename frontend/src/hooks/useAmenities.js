import { useState, useEffect } from 'react';
import { amenityService } from '../services/amenityService';

/**
 * Custom React hook to fetch all active amenities from MySQL.
 * Returns amenities list, loading state, error state, and refetch handler.
 */
export function useAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAmenities = () => {
    setLoading(true);
    setError(null);

    amenityService
      .getAmenities()
      .then((data) => {
        setAmenities(data || []);
      })
      .catch((err) => {
        console.error('Failed to load amenities in hook:', err);
        setError(err.message || 'Unable to load amenities');
        setAmenities([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  return { amenities, loading, error, refetch: fetchAmenities };
}
