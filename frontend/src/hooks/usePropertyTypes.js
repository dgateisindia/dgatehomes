import { useState, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import { DEFAULT_PROPERTY_TYPES } from '../config/propertyTypes';

/**
 * Custom React hook to fetch and cache property types.
 * Returns propertyTypes array and loading state.
 */
export function usePropertyTypes() {
  const [propertyTypes, setPropertyTypes] = useState(DEFAULT_PROPERTY_TYPES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    propertyService
      .getPropertyTypes()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setPropertyTypes(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load property types hook:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { propertyTypes, loading };
}
