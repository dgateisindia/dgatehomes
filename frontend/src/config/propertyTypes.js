/**
 * Centralized property types configuration and helper mappings.
 * Aligns with the dgate_home_db property_types schema.
 */

export const DEFAULT_PROPERTY_TYPES = [
  { id: 1, name: 'Apartment', slug: 'apartment', segment: 'residential', sort_order: 1, description: 'Modern 2, 3 & 4 BHK residences in premier communities' },
  { id: 2, name: 'Villa', slug: 'villa', segment: 'residential', sort_order: 2, description: 'Independent gated villas with private gardens' },
  { id: 3, name: 'Independent House', slug: 'independent-house', segment: 'residential', sort_order: 3, description: 'European row houses & individual homes' },
  { id: 4, name: 'Farm House', slug: 'farm-house', segment: 'residential', sort_order: 4, description: 'Serene weekend retreats & farm plots' },
  { id: 5, name: 'Plot', slug: 'plot', segment: 'land', sort_order: 5, description: 'BMRDA & BDA approved freehold residential plots' },
  { id: 6, name: 'Land', slug: 'land', segment: 'land', sort_order: 6, description: 'Investment & development parcels' },
  { id: 7, name: 'Commercial Site', slug: 'commercial-site', segment: 'commercial', sort_order: 7, description: 'Prime commercial plots & development lands' },
  { id: 8, name: 'Commercial Building', slug: 'commercial-building', segment: 'commercial', sort_order: 8, description: 'Grade-A office suites & retail spaces' },
];

/**
 * Maps home page category titles or slugs to property type IDs.
 * Matches against exact names, slugs, or common synonyms.
 * 
 * @param {string} categoryTitleOrSlug
 * @param {Array<{ id: number, name: string, slug?: string }>} [customTypesList]
 * @returns {number | null}
 */
export function resolvePropertyTypeId(categoryTitleOrSlug, customTypesList = DEFAULT_PROPERTY_TYPES) {
  if (!categoryTitleOrSlug) return null;
  const input = String(categoryTitleOrSlug).trim().toLowerCase();

  // Direct match by ID if already numeric
  const numeric = Number(input);
  if (!Number.isNaN(numeric) && numeric > 0) {
    return numeric;
  }

  // Common synonym map to handle category cards
  const synonymMap = {
    // Apartments
    apartment: 1,
    apartments: 1,
    'high-rise apartments': 1,
    'sky penthouses': 1,
    penthouse: 1,
    flat: 1,

    // Villas
    villa: 2,
    villas: 2,
    'luxury villas': 2,

    // Independent House / Row Houses
    'independent house': 3,
    'independent houses': 3,
    'luxury row houses': 3,
    'row houses': 3,
    house: 3,

    // Farm Houses
    'farm house': 4,
    'farm houses': 4,

    // Plots
    plot: 5,
    plots: 5,
    'gated plots': 5,
    residential_plot: 5,

    // Land
    land: 6,

    // Commercial
    'commercial site': 7,
    'commercial spaces': 8,
    'commercial building': 8,
    commercial: 8,
  };

  if (synonymMap[input]) {
    return synonymMap[input];
  }

  // Fallback search in provided types list
  const match = customTypesList.find(
    (pt) =>
      pt.name.toLowerCase() === input ||
      (pt.slug && pt.slug.toLowerCase() === input) ||
      input.includes(pt.name.toLowerCase())
  );

  return match ? match.id : null;
}
