/**
 * Utility helpers for query parameter construction, parsing, and URL synchronization.
 * Ensures consistent filter state handling across Home and Property Listing pages.
 */

/**
 * Builds a URLSearchParams instance from a filter object.
 * Removes empty, null, undefined, and default values to produce clean URLs.
 * 
 * @param {Record<string, any>} filters
 * @returns {URLSearchParams}
 */
export function buildPropertiesQuery(filters = {}) {
  const params = new URLSearchParams();

  if (filters.location && String(filters.location).trim()) {
    params.set('location', String(filters.location).trim());
  }

  if (filters.property_type_id !== undefined && filters.property_type_id !== null && filters.property_type_id !== '') {
    params.set('property_type_id', String(filters.property_type_id));
  }

  if (filters.listing_type && ['sale', 'rent'].includes(String(filters.listing_type).toLowerCase())) {
    params.set('listing_type', String(filters.listing_type).toLowerCase());
  }

  if (filters.min_price !== undefined && filters.min_price !== null && filters.min_price !== '') {
    const num = Number(filters.min_price);
    if (!Number.isNaN(num) && num >= 0) {
      params.set('min_price', String(num));
    }
  }

  if (filters.max_price !== undefined && filters.max_price !== null && filters.max_price !== '') {
    const num = Number(filters.max_price);
    if (!Number.isNaN(num) && num > 0) {
      params.set('max_price', String(num));
    }
  }

  if (filters.bedrooms !== undefined && filters.bedrooms !== null && filters.bedrooms !== '') {
    const num = Number(filters.bedrooms);
    if (!Number.isNaN(num) && num > 0) {
      params.set('bedrooms', String(num));
    }
  }

  if (filters.bathrooms !== undefined && filters.bathrooms !== null && filters.bathrooms !== '') {
    const num = Number(filters.bathrooms);
    if (!Number.isNaN(num) && num > 0) {
      params.set('bathrooms', String(num));
    }
  }

  if (filters.featured === true || filters.featured === 'true' || filters.featured === 1) {
    params.set('featured', 'true');
  }

  if (filters.sort && filters.sort !== 'newest') {
    params.set('sort', String(filters.sort));
  }

  if (filters.page && Number(filters.page) > 1) {
    params.set('page', String(filters.page));
  }

  return params;
}

/**
 * Constructs a full /properties URL with serialized query parameters.
 * 
 * @param {Record<string, any>} filters
 * @returns {string} e.g. "/properties?location=Bengaluru&listing_type=sale"
 */
export function buildPropertiesUrl(filters = {}) {
  const query = buildPropertiesQuery(filters).toString();
  return query ? `/properties?${query}` : '/properties';
}

/**
 * Parses URLSearchParams or a query string into a structured filter object.
 * 
 * @param {URLSearchParams | string} searchParams
 * @returns {Record<string, any>}
 */
export function parsePropertiesQuery(searchParams) {
  const params = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams || '');

  const parsed = {
    location: params.get('location')?.trim() || '',
    property_type_id: params.get('property_type_id') || '',
    listing_type: params.get('listing_type')?.toLowerCase() || '',
    min_price: params.get('min_price') || '',
    max_price: params.get('max_price') || '',
    bedrooms: params.get('bedrooms') || '',
    bathrooms: params.get('bathrooms') || '',
    featured: params.get('featured') === 'true',
    sort: params.get('sort') || 'newest',
    page: parseInt(params.get('page') || '1', 10) || 1,
  };

  return parsed;
}

/**
 * Implements immutable query parameter updating while preserving existing filters.
 * Optionally resets page to 1 unless resetPage is explicitly false.
 * 
 * @param {URLSearchParams} currentSearchParams
 * @param {Record<string, any>} newFilters
 * @param {boolean} [resetPage=true]
 * @returns {Record<string, string>} Object suitable for setSearchParams(...)
 */
export function updateQueryFilters(currentSearchParams, newFilters = {}, resetPage = true) {
  const current = Object.fromEntries(currentSearchParams.entries());
  const merged = { ...current, ...newFilters };

  if (resetPage) {
    delete merged.page;
  }

  // Remove empty or falsy values
  Object.keys(merged).forEach((key) => {
    if (merged[key] === '' || merged[key] === undefined || merged[key] === null) {
      delete merged[key];
    }
  });

  // Omit default sort
  if (merged.sort === 'newest') {
    delete merged.sort;
  }

  // Omit page 1
  if (merged.page === '1' || merged.page === 1) {
    delete merged.page;
  }

  return merged;
}
