import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  X,
  Search,
  MapPin,
  Home,
  IndianRupee,
  Bed,
  Bath,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Building2,
} from 'lucide-react';
import Container from '../components/common/Container';
import PropertyCard from '../components/property/PropertyCard';
import PrimaryButton from '../components/common/PrimaryButton';
import EnquiryModal from '../components/common/EnquiryModal';
import { propertyService } from '../services/propertyService';
import { parsePropertiesQuery, updateQueryFilters } from '../utils/queryHelper';
import { usePropertyTypes } from '../hooks/usePropertyTypes';
import { ENABLE_RENT_LISTINGS } from '../config/listingModes';

const BEDROOM_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '1 BHK', value: '1' },
  { label: '2 BHK', value: '2' },
  { label: '3 BHK', value: '3' },
  { label: '4 BHK', value: '4' },
  { label: '5+ BHK', value: '5' },
];

const BATHROOM_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4+', value: '4' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export default function PropertiesPage({ enquiryModalOpen, setEnquiryModalOpen }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { propertyTypes, loading: propertyTypesLoading } = usePropertyTypes();

  // Local filter state parsed from searchParams via queryHelper
  const parsedFilters = useMemo(() => parsePropertiesQuery(searchParams), [searchParams]);

  const {
    location: locationParam,
    property_type_id: propertyTypeIdParam,
    listing_type: listingTypeParam,
    min_price: minPriceParam,
    max_price: maxPriceParam,
    bedrooms: bedroomsParam,
    bathrooms: bathroomsParam,
    featured: featuredParam,
    sort: sortParam,
    page: pageParam,
  } = parsedFilters;

  // Filter input states
  const [locationInput, setLocationInput] = useState(locationParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data fetching state
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPropertyForEnquiry, setSelectedPropertyForEnquiry] = useState(null);

  // Sync location input when searchParams change externally (e.g. back/forward button)
  useEffect(() => {
    setLocationInput(locationParam);
  }, [locationParam]);

  // Compute active filters count (excluding sort and page)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (locationParam) count++;
    if (propertyTypeIdParam) count++;
    if (ENABLE_RENT_LISTINGS && listingTypeParam) count++;
    if (minPriceParam) count++;
    if (maxPriceParam) count++;
    if (bedroomsParam) count++;
    if (bathroomsParam) count++;
    if (featuredParam) count++;
    return count;
  }, [
    locationParam,
    propertyTypeIdParam,
    listingTypeParam,
    minPriceParam,
    maxPriceParam,
    bedroomsParam,
    bathroomsParam,
    featuredParam,
  ]);

  // Helper to update URL searchParams cleanly while preserving existing filters
  const updateFilters = useCallback(
    (newFilters, resetPage = true) => {
      const updated = updateQueryFilters(searchParams, newFilters, resetPage);
      setSearchParams(updated);
    },
    [searchParams, setSearchParams]
  );

  // Clear all filters
  const handleClearAllFilters = () => {
    setLocationInput('');
    setSearchParams({});
  };

  // Fetch properties whenever query parameters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const apiParams = {
      page: pageParam || 1,
      limit: 12,
      sort: sortParam || 'newest',
    };

    if (locationParam) apiParams.location = locationParam;
    if (propertyTypeIdParam) apiParams.property_type_id = Number(propertyTypeIdParam);
    // Public site defaults to sale listings when rent listings are disabled
    apiParams.listing_type = ENABLE_RENT_LISTINGS
      ? (listingTypeParam || undefined)
      : 'sale';
    if (minPriceParam) apiParams.min_price = Number(minPriceParam);
    if (maxPriceParam) apiParams.max_price = Number(maxPriceParam);
    if (bedroomsParam) apiParams.bedrooms = Number(bedroomsParam);
    if (bathroomsParam) apiParams.bathrooms = Number(bathroomsParam);
    if (featuredParam) apiParams.featured = true;

    propertyService
      .getProperties(apiParams)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success) {
          setProperties(res.data || []);
          setPagination(res.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 });
        } else {
          setProperties([]);
          setPagination({ page: 1, limit: 12, total: 0, totalPages: 0 });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load properties:', err);
        setError(err.message || 'Unable to load properties. Please try again.');
        setProperties([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    locationParam,
    propertyTypeIdParam,
    listingTypeParam,
    minPriceParam,
    maxPriceParam,
    bedroomsParam,
    bathroomsParam,
    featuredParam,
    sortParam,
    pageParam,
  ]);

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      updateFilters({ page: newPage > 1 ? String(newPage) : undefined }, false);
      window.scrollTo({ top: 220, behavior: 'smooth' });
    }
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    updateFilters({ location: locationInput.trim() });
  };

  const handleOpenEnquiry = (property = null) => {
    setSelectedPropertyForEnquiry(property);
    setEnquiryModalOpen(true);
  };

  const handleCloseEnquiry = () => {
    setEnquiryModalOpen(false);
    setSelectedPropertyForEnquiry(null);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. Page Header with Breadcrumbs */}
      <section
        style={{
          backgroundColor: '#0a0a0a',
          color: 'var(--color-white)',
          padding: '3.5rem 0 3rem',
          borderBottom: '1px solid #1f2937',
          position: 'relative',
        }}
      >
        <Container>
          {/* Breadcrumb */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: '#9ca3af',
              marginBottom: '1rem',
            }}
          >
            <Link to="/" style={{ color: '#9ca3af', transition: 'color 0.15s' }}>
              Home
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--color-yellow-primary)', fontWeight: '600' }}>Properties</span>
          </nav>

          <div style={{ maxWidth: '780px' }}>
            <h1
              style={{
                fontSize: 'clamp(2.15rem, 4vw, 3rem)',
                fontWeight: '800',
                color: 'var(--color-white)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              Verified Luxury Properties in <span style={{ color: 'var(--color-yellow-primary)' }}>Bangalore</span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#d1d5db', lineHeight: 1.6 }}>
              Explore premium gated communities, bespoke villas, and modern residential developments with 100% verified legal clearance.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Listing Section */}
      <Container style={{ paddingTop: '2.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '2.5rem',
          }}
          className="properties-layout-grid"
        >
          {/* Left / Desktop Filter Sidebar */}
          <aside className="properties-filter-sidebar">
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-card)',
                position: 'sticky',
                top: '95px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {/* Filter Top Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={18} style={{ color: 'var(--color-yellow-primary)' }} />
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-black)' }}>
                    Filter Listings
                  </span>
                  {activeFiltersCount > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--color-yellow-primary)',
                        color: 'var(--color-black)',
                        fontWeight: '800',
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {activeFiltersCount}
                    </span>
                  )}
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: 'var(--color-text-muted)',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                )}
              </div>

              {/* 1. Listing Type (Buy / Rent) - Preserved & restored via ENABLE_RENT_LISTINGS */}
              {ENABLE_RENT_LISTINGS && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                    Listing Purpose
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                    {[
                      { label: 'All', value: '' },
                      { label: 'Buy', value: 'sale' },
                      { label: 'Rent', value: 'rent' },
                    ].map((t) => {
                      const isActive = listingTypeParam === t.value;
                      return (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => updateFilters({ listing_type: t.value })}
                          style={{
                            padding: '0.55rem 0.25rem',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            borderRadius: 'var(--radius-md)',
                            border: isActive ? '1.5px solid var(--color-brand-sage)' : '1px solid var(--color-border)',
                            backgroundColor: isActive ? 'var(--color-brand-sage)' : 'var(--color-bg-subtle)',
                            color: isActive ? '#ffffff' : 'var(--color-text-main)',
                            textAlign: 'center',
                            transition: 'all 0.15s',
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Location Search */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  Location / Locality
                </label>
                <form onSubmit={handleLocationSubmit} style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-yellow-primary)' }} />
                  <input
                    type="text"
                    placeholder="e.g. Whitefield, Indiranagar"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--color-border)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-yellow-primary)')}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      if (locationInput.trim() !== locationParam) {
                        updateFilters({ location: locationInput.trim() });
                      }
                    }}
                  />
                  {locationInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocationInput('');
                        updateFilters({ location: undefined });
                      }}
                      style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </form>
              </div>

              {/* 3. Property Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  Property Type
                </label>
                <select
                  value={propertyTypeIdParam}
                  onChange={(e) => updateFilters({ property_type_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    backgroundColor: 'var(--color-white)',
                    outline: 'none',
                    cursor: propertyTypesLoading ? 'not-allowed' : 'pointer',
                    opacity: propertyTypesLoading ? 0.7 : 1,
                  }}
                  disabled={propertyTypesLoading}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-yellow-primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                >
                  <option value="">{propertyTypesLoading ? 'Loading Property Types...' : 'All Property Types'}</option>
                  {propertyTypes.map((pt) => (
                    <option key={pt.id} value={String(pt.id)}>
                      {pt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Bedrooms Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  Bedrooms
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                  {BEDROOM_OPTIONS.map((opt) => {
                    const isActive = bedroomsParam === opt.value;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => updateFilters({ bedrooms: opt.value })}
                        style={{
                          padding: '0.5rem 0.2rem',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          borderRadius: 'var(--radius-md)',
                          border: isActive ? '1.5px solid var(--color-brand-sage)' : '1px solid var(--color-border)',
                          backgroundColor: isActive ? 'var(--color-brand-sage)' : 'var(--color-bg-subtle)',
                          color: isActive ? '#ffffff' : 'var(--color-text-main)',
                          textAlign: 'center',
                          transition: 'all 0.15s',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Bathrooms Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  Bathrooms
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
                  {BATHROOM_OPTIONS.map((opt) => {
                    const isActive = bathroomsParam === opt.value;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => updateFilters({ bathrooms: opt.value })}
                        style={{
                          padding: '0.5rem 0.2rem',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          borderRadius: 'var(--radius-md)',
                          border: isActive ? '1.5px solid var(--color-brand-sage)' : '1px solid var(--color-border)',
                          backgroundColor: isActive ? 'var(--color-brand-sage)' : 'var(--color-bg-subtle)',
                          color: isActive ? '#ffffff' : 'var(--color-text-main)',
                          textAlign: 'center',
                          transition: 'all 0.15s',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Budget Range */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  Price Range (₹)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={minPriceParam}
                      onChange={(e) => updateFilters({ min_price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-border)',
                        fontSize: '0.82rem',
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-yellow-primary)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={maxPriceParam}
                      onChange={(e) => updateFilters({ max_price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-border)',
                        fontSize: '0.82rem',
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-yellow-primary)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                    />
                  </div>
                </div>
              </div>

              {/* 7. Featured Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--color-yellow-primary)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Featured Only</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(featuredParam)}
                  onChange={(e) => updateFilters({ featured: e.target.checked ? 'true' : undefined })}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--color-yellow-primary)',
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>
          </aside>

          {/* Right Column: Results & Pagination */}
          <main style={{ minWidth: 0 }}>
            {/* Results Control Bar */}
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: '1.15rem 1.5rem',
                marginBottom: '1.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Mobile Filter Drawer Button */}
                <button
                  type="button"
                  className="mobile-filter-btn"
                  onClick={() => setMobileFilterOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: 'var(--color-black)',
                    color: 'var(--color-white)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                  }}
                >
                  <Filter size={15} style={{ color: 'var(--color-yellow-primary)' }} />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--color-yellow-primary)',
                        color: 'var(--color-black)',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                      }}
                    >
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <div>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-black-heading)' }}>
                    {loading ? 'Searching properties...' : `${pagination.total} Properties Found`}
                  </span>
                  {pagination.total > 0 && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                      (Page {pagination.page} of {pagination.totalPages})
                    </span>
                  )}
                </div>
              </div>

              {/* Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                  Sort By:
                </span>
                <div style={{ position: 'relative' }}>
                  <select
                    value={sortParam}
                    onChange={(e) => updateFilters({ sort: e.target.value }, false)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--color-border)',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      backgroundColor: 'var(--color-white)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-yellow-primary)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Chips Bar */}
            {activeFiltersCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.5rem',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>
                  Active Filters:
                </span>

                {ENABLE_RENT_LISTINGS && listingTypeParam && (
                  <span className="filter-chip" onClick={() => updateFilters({ listing_type: undefined })}>
                    Listing: {listingTypeParam === 'sale' ? 'Sale' : 'Rent'} <X size={12} />
                  </span>
                )}

                {locationParam && (
                  <span className="filter-chip" onClick={() => updateFilters({ location: undefined })}>
                    Location: {locationParam} <X size={12} />
                  </span>
                )}

                {propertyTypeIdParam && (
                  <span className="filter-chip" onClick={() => updateFilters({ property_type_id: undefined })}>
                    Type: {propertyTypes.find((p) => String(p.id) === propertyTypeIdParam)?.name || 'Custom'} <X size={12} />
                  </span>
                )}

                {bedroomsParam && (
                  <span className="filter-chip" onClick={() => updateFilters({ bedrooms: undefined })}>
                    {bedroomsParam} BHK <X size={12} />
                  </span>
                )}

                {bathroomsParam && (
                  <span className="filter-chip" onClick={() => updateFilters({ bathrooms: undefined })}>
                    {bathroomsParam} Baths <X size={12} />
                  </span>
                )}

                {(minPriceParam || maxPriceParam) && (
                  <span
                    className="filter-chip"
                    onClick={() => updateFilters({ min_price: undefined, max_price: undefined })}
                  >
                    Budget: ₹{minPriceParam || '0'} - ₹{maxPriceParam || 'Any'} <X size={12} />
                  </span>
                )}

                {featuredParam && (
                  <span className="filter-chip" onClick={() => updateFilters({ featured: undefined })}>
                    Featured Only <X size={12} />
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: '#dc2626',
                    textDecoration: 'underline',
                    marginLeft: '0.5rem',
                  }}
                >
                  Clear All
                </button>
              </div>
            )}

            {/* 4. Results Area: Loading Skeletons */}
            {loading && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: '1.75rem',
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: 'var(--color-white)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                      overflow: 'hidden',
                      height: '420px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ height: '240px', backgroundColor: '#e5e7eb', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                      <div style={{ width: '40%', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
                      <div style={{ width: '80%', height: '20px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
                      <div style={{ width: '60%', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
                      <div style={{ marginTop: 'auto', width: '100%', height: '38px', backgroundColor: '#f3f4f6', borderRadius: '8px' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Error State */}
            {!loading && error && (
              <div
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid #fed7aa',
                  padding: '3.5rem 2rem',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-yellow-light)',
                    color: 'var(--color-yellow-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <AlertCircle size={30} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                  Unable to Load Properties
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                  {error}
                </p>
                <PrimaryButton variant="primary" onClick={() => updateFilters({})}>
                  Retry Search
                </PrimaryButton>
              </div>
            )}

            {/* 4. Empty State */}
            {!loading && !error && properties.length === 0 && (
              <div
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-yellow-light)',
                    color: 'var(--color-yellow-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <Building2 size={32} />
                </div>

                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-black-heading)', marginBottom: '0.75rem' }}>
                  No Matching Properties Found
                </h3>

                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 2rem' }}>
                  We couldn&apos;t find any properties matching your current filter criteria. Try expanding your search location, clearing specific filters, or requesting an off-market consultation.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <PrimaryButton variant="primary" onClick={handleClearAllFilters}>
                    Clear All Filters
                  </PrimaryButton>
                  <PrimaryButton variant="outline" onClick={() => handleOpenEnquiry(null)}>
                    Request Custom Property Match
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* 4. Property Grid */}
            {!loading && !error && properties.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: '1.75rem',
                }}
              >
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
              </div>
            )}

            {/* 5. Pagination Controls */}
            {!loading && !error && pagination.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '3.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'var(--color-white)',
                    color: pagination.page <= 1 ? '#9ca3af' : 'var(--color-black)',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                    opacity: pagination.page <= 1 ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {/* Page Number Pills */}
                {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((pNum) => {
                  const isCurrent = pNum === pagination.page;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => handlePageChange(pNum)}
                      style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        border: isCurrent ? '1.5px solid var(--color-yellow-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isCurrent ? 'var(--color-yellow-primary)' : 'var(--color-white)',
                        color: 'var(--color-black)',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'var(--color-white)',
                    color: pagination.page >= pagination.totalPages ? '#9ca3af' : 'var(--color-black)',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                    opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </main>
        </div>
      </Container>

      {/* Mobile Slide-Over Filter Drawer */}
      {mobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              width: '100%',
              maxWidth: '380px',
              height: '100%',
              overflowY: 'auto',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} style={{ color: 'var(--color-yellow-primary)' }} />
                <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>Filters</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                style={{ padding: '0.3rem', color: '#6b7280' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Purpose - Preserved & restored via ENABLE_RENT_LISTINGS */}
            {ENABLE_RENT_LISTINGS && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Purpose</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                  {['', 'sale', 'rent'].map((v) => (
                    <button
                      key={v || 'all'}
                      type="button"
                      onClick={() => updateFilters({ listing_type: v })}
                      style={{
                        padding: '0.55rem',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: listingTypeParam === v ? 'var(--color-brand-sage)' : 'var(--color-bg-subtle)',
                        color: listingTypeParam === v ? '#ffffff' : 'var(--color-text-main)',
                        border: listingTypeParam === v ? '1px solid var(--color-brand-sage)' : '1px solid var(--color-border)',
                      }}
                    >
                      {v === '' ? 'All' : v === 'sale' ? 'Buy' : 'Rent'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Property Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Property Type</label>
              <select
                value={propertyTypeIdParam}
                onChange={(e) => updateFilters({ property_type_id: e.target.value })}
                disabled={propertyTypesLoading}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontWeight: '600',
                  opacity: propertyTypesLoading ? 0.7 : 1,
                  cursor: propertyTypesLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="">{propertyTypesLoading ? 'Loading Property Types...' : 'All Property Types'}</option>
                {propertyTypes.map((pt) => (
                  <option key={pt.id} value={String(pt.id)}>{pt.name}</option>
                ))}
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Bedrooms</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                {BEDROOM_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => updateFilters({ bedrooms: opt.value })}
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: bedroomsParam === opt.value ? 'var(--color-brand-sage)' : 'var(--color-bg-subtle)',
                      color: bedroomsParam === opt.value ? '#ffffff' : 'var(--color-text-main)',
                      border: bedroomsParam === opt.value ? '1px solid var(--color-brand-sage)' : '1px solid var(--color-border)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Only */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Featured Residences Only</span>
              <input
                type="checkbox"
                checked={Boolean(featuredParam)}
                onChange={(e) => updateFilters({ featured: e.target.checked ? 'true' : undefined })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-yellow-primary)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <PrimaryButton variant="outline" fullWidth onClick={handleClearAllFilters}>
                Reset
              </PrimaryButton>
              <PrimaryButton variant="primary" fullWidth onClick={() => setMobileFilterOpen(false)}>
                Apply Filters
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Global Enquiry Modal */}
      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={handleCloseEnquiry}
        property={selectedPropertyForEnquiry}
      />

      {/* Embedded Responsive Styles */}
      <style>{`
        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background-color: var(--color-brand-sage-light);
          color: var(--color-brand-sage-text);
          border: 1px solid var(--color-brand-sage-border);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .filter-chip:hover {
          background-color: #e2edd9;
        }

        .mobile-filter-btn {
          display: none !important;
        }

        @media (min-width: 1024px) {
          .properties-layout-grid {
            grid-template-columns: 290px minmax(0, 1fr) !important;
          }
          .properties-filter-sidebar {
            display: block !important;
          }
        }

        @media (max-width: 1023px) {
          .properties-filter-sidebar {
            display: none !important;
          }
          .mobile-filter-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}
