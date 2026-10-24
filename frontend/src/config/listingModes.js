/**
 * Listing Modes and Feature Flags Configuration
 *
 * Controls whether Rent listings are exposed in the public interface.
 * When ENABLE_RENT_LISTINGS is false:
 * - Public search shows only Sale experience (no Buy/Rent toggle)
 * - Rent tabs and shortcuts are hidden
 * - Public searches automatically submit listing_type=sale
 * - Rent filters on /properties are hidden
 * - Public properties query defaults to sale listings
 *
 * When ENABLE_RENT_LISTINGS is toggled to true:
 * - Buy and Rent tabs are immediately restored in HeroSearch
 * - Rent filters are restored on PropertiesPage (desktop sidebar & mobile drawer)
 * - Rent shortcut chips and navigation links are restored
 */

export const ENABLE_RENT_LISTINGS = false;

export const PUBLIC_LISTING_MODES = ENABLE_RENT_LISTINGS ? ['sale', 'rent'] : ['sale'];

export const DEFAULT_PUBLIC_LISTING_TYPE = 'sale';

export const isRentEnabled = () => ENABLE_RENT_LISTINGS;
