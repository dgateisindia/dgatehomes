/**
 * Formats property price into Indian currency format (Lakhs / Crores).
 * @param {number|string} price - Numeric or string price
 * @param {'sale'|'rent'} [listingType='sale'] - Listing type to add /mo if rent
 * @returns {string} - Formatted price string (e.g. ₹1.45 Cr, ₹75 L, ₹45,000/mo)
 */
export function formatPrice(price, listingType = 'sale') {
  if (price === undefined || price === null || price === '') {
    return 'Price on Request';
  }

  const num = typeof price === 'string' ? parseFloat(price) : Number(price);

  if (Number.isNaN(num) || num <= 0) {
    return 'Price on Request';
  }

  const suffix = listingType === 'rent' ? '/mo' : '';

  // 1 Crore = 10,000,000
  if (num >= 10000000) {
    const inCrores = num / 10000000;
    return `₹${inCrores.toFixed(2).replace(/\.00$/, '')} Cr${suffix}`;
  }

  // 1 Lakh = 100,000
  if (num >= 100000) {
    const inLakhs = num / 100000;
    return `₹${inLakhs.toFixed(2).replace(/\.00$/, '')} L${suffix}`;
  }

  // Standard thousands
  return `₹${num.toLocaleString('en-IN')}${suffix}`;
}

/**
 * Formats property area with units.
 * @param {number|string} area
 * @param {string} [unit='sqft']
 * @returns {string}
 */
export function formatArea(area, unit = 'sqft') {
  if (!area) return 'N/A';
  const num = typeof area === 'string' ? parseFloat(area) : Number(area);
  if (Number.isNaN(num)) return `${area} ${unit}`;

  const unitMap = {
    sqft: 'sq.ft',
    sqm: 'sq.m',
    acre: 'Acres',
    gunta: 'Guntas',
  };

  const label = unitMap[unit] || unit;
  return `${num.toLocaleString('en-IN')} ${label}`;
}

/**
 * Formats bedroom and bathroom counters into clean tags.
 * @param {number} bedrooms
 * @param {number} bathrooms
 * @returns {string}
 */
export function formatBhk(bedrooms, propertyType) {
  if (bedrooms) {
    return `${bedrooms} BHK`;
  }
  return propertyType || 'Property';
}
