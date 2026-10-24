const ALLOWED_SORT_VALUES = ['newest', 'price_asc', 'price_desc'];
const ALLOWED_LISTING_TYPES = ['sale', 'rent'];

/**
 * Validates and sanitizes query parameters for public properties listing.
 * @param {Record<string, any>} query
 * @returns {{ isValid: boolean, errors?: string[], data?: { filters: Record<string, any>, pagination: { page: number, limit: number, offset: number }, sort: string } }}
 */
function validatePropertyQueryParams(query) {
  const errors = [];
  const filters = {};
  const pagination = {
    page: 1,
    limit: 12,
    offset: 0,
  };
  let sort = 'newest';

  // 1. Pagination: page (default: 1)
  if (query.page !== undefined && query.page !== '') {
    const parsedPage = Number(query.page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      errors.push('page must be an integer greater than or equal to 1');
    } else {
      pagination.page = parsedPage;
    }
  }

  // 2. Pagination: limit (default: 12, max: 50)
  if (query.limit !== undefined && query.limit !== '') {
    const parsedLimit = Number(query.limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      errors.push('limit must be an integer between 1 and 50');
    } else {
      pagination.limit = parsedLimit;
    }
  }

  pagination.offset = (pagination.page - 1) * pagination.limit;

  // 3. Sorting: sort (default: newest)
  if (query.sort !== undefined && query.sort !== '') {
    const sortVal = String(query.sort).toLowerCase().trim();
    if (!ALLOWED_SORT_VALUES.includes(sortVal)) {
      errors.push(`sort must be one of: ${ALLOWED_SORT_VALUES.join(', ')}`);
    } else {
      sort = sortVal;
    }
  }

  // 4. Filter: location
  if (query.location !== undefined && query.location !== '') {
    const loc = String(query.location).trim();
    if (loc.length > 0) {
      if (loc.length > 150) {
        errors.push('location filter must not exceed 150 characters');
      } else {
        filters.location = loc;
      }
    }
  }

  // 5. Filter: property_type_id
  if (query.property_type_id !== undefined && query.property_type_id !== '') {
    const ptId = Number(query.property_type_id);
    if (!Number.isInteger(ptId) || ptId < 1) {
      errors.push('property_type_id must be a positive integer');
    } else {
      filters.property_type_id = ptId;
    }
  }

  // 6. Filter: listing_type ('sale' | 'rent')
  if (query.listing_type !== undefined && query.listing_type !== '') {
    const lt = String(query.listing_type).toLowerCase().trim();
    if (!ALLOWED_LISTING_TYPES.includes(lt)) {
      errors.push("listing_type must be either 'sale' or 'rent'");
    } else {
      filters.listing_type = lt;
    }
  }

  // 7. Filter: min_price
  let minPrice = null;
  if (query.min_price !== undefined && query.min_price !== '') {
    const parsedMin = Number(query.min_price);
    if (Number.isNaN(parsedMin) || parsedMin < 0) {
      errors.push('min_price must be a non-negative number');
    } else {
      minPrice = parsedMin;
      filters.min_price = parsedMin;
    }
  }

  // 8. Filter: max_price
  let maxPrice = null;
  if (query.max_price !== undefined && query.max_price !== '') {
    const parsedMax = Number(query.max_price);
    if (Number.isNaN(parsedMax) || parsedMax < 0) {
      errors.push('max_price must be a non-negative number');
    } else {
      maxPrice = parsedMax;
      filters.max_price = parsedMax;
    }
  }

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    errors.push('min_price cannot be greater than max_price');
  }

  // 9. Filter: bedrooms
  if (query.bedrooms !== undefined && query.bedrooms !== '') {
    const beds = Number(query.bedrooms);
    if (!Number.isInteger(beds) || beds < 0) {
      errors.push('bedrooms must be a non-negative integer');
    } else {
      filters.bedrooms = beds;
    }
  }

  // 10. Filter: bathrooms
  if (query.bathrooms !== undefined && query.bathrooms !== '') {
    const baths = Number(query.bathrooms);
    if (!Number.isInteger(baths) || baths < 0) {
      errors.push('bathrooms must be a non-negative integer');
    } else {
      filters.bathrooms = baths;
    }
  }

  // 11. Filter: featured
  if (query.featured !== undefined && query.featured !== '') {
    const featStr = String(query.featured).toLowerCase().trim();
    if (featStr === 'true' || featStr === '1') {
      filters.featured = true;
    } else if (featStr === 'false' || featStr === '0') {
      filters.featured = false;
    } else {
      errors.push('featured must be a boolean (true, false, 1, or 0)');
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    data: {
      filters,
      pagination,
      sort,
    },
  };
}

module.exports = {
  validatePropertyQueryParams,
  ALLOWED_SORT_VALUES,
  ALLOWED_LISTING_TYPES,
};
