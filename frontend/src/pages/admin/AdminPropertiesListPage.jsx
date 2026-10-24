import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  Building,
  Plus,
  Search,
  Edit3,
  CheckCircle2,
  Archive,
  FileText,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
  RotateCcw,
  MapPin,
} from 'lucide-react';
import {
  getAdminProperties,
  updateAdminPropertyStatus,
} from '../../services/adminPropertyService';
import { usePropertyTypes } from '../../hooks/usePropertyTypes';
import { formatPrice, formatArea } from '../../utils/formatters';
import PrimaryButton from '../../components/common/PrimaryButton';

export default function AdminPropertiesListPage() {
  const { getToken } = useAuth();
  const { propertyTypes } = usePropertyTypes();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states initialized from URL search params
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    property_type_id: searchParams.get('property_type_id') || '',
    listing_type: searchParams.get('listing_type') || '',
    featured: searchParams.get('featured') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  });

  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [bannerMessage, setBannerMessage] = useState(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token is required.');
      }

      const res = await getAdminProperties(token, filters);
      setProperties(res.data || []);
      setPagination(
        res.pagination || {
          page: filters.page,
          limit: filters.limit,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      console.error('[AdminPropertiesListPage] Failed to fetch properties:', err);
      setError(err.message || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, [getToken, filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Sync URL query params when filters change
  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (filters.search) nextParams.set('search', filters.search);
    if (filters.status) nextParams.set('status', filters.status);
    if (filters.property_type_id) nextParams.set('property_type_id', filters.property_type_id);
    if (filters.listing_type) nextParams.set('listing_type', filters.listing_type);
    if (filters.featured !== '') nextParams.set('featured', filters.featured);
    if (filters.sort && filters.sort !== 'newest') nextParams.set('sort', filters.sort);
    if (filters.page > 1) nextParams.set('page', String(filters.page));
    setSearchParams(nextParams, { replace: true });
  }, [filters, setSearchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      search: searchInput.trim(),
      page: 1,
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      status: '',
      property_type_id: '',
      listing_type: '',
      featured: '',
      sort: 'newest',
      page: 1,
      limit: 12,
    });
  };

  const handleStatusChange = async (property, newStatus) => {
    try {
      setActionLoadingId(property.id);
      setBannerMessage(null);
      const token = await getToken();
      await updateAdminPropertyStatus(
        token,
        property.id,
        newStatus,
        `Status changed to ${newStatus} from admin property list`
      );

      setBannerMessage({
        type: 'success',
        text: `"${property.title}" status updated to ${newStatus.toUpperCase()}.`,
      });
      await fetchProperties();
    } catch (err) {
      setBannerMessage({
        type: 'error',
        text: err.message || 'Failed to update property status.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.property_type_id ||
      filters.listing_type ||
      filters.featured !== '' ||
      filters.sort !== 'newest'
  );

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
            Property Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
            Manage listings, update pricing, control publish states, and configure property metadata.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchProperties}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.58rem 0.95rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: 'var(--color-black)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <Link to="/admin/properties/new" style={{ textDecoration: 'none' }}>
            <PrimaryButton style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.15rem', fontSize: '0.85rem' }}>
              <Plus size={16} /> Add New Property
            </PrimaryButton>
          </Link>
        </div>
      </div>

      {/* Status Action Banner */}
      {bannerMessage && (
        <div
          style={{
            backgroundColor: bannerMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${bannerMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: bannerMessage.type === 'success' ? '#166534' : '#991b1b',
            padding: '0.85rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
            fontWeight: '600',
          }}
        >
          <span>{bannerMessage.text}</span>
          <button
            onClick={() => setBannerMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '800',
              color: 'inherit',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Search & Filters Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
            gap: '0.85rem',
            alignItems: 'end',
          }}
        >
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ gridColumn: 'span 2', minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Search Title or Location
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. Whitefield, Sky Villa..."
                  style={{
                    width: '100%',
                    padding: '0.52rem 0.75rem 0.52rem 2.15rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '0.52rem 0.9rem',
                  backgroundColor: 'var(--color-brand-walnut)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '0.52rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Property Type
            </label>
            <select
              value={filters.property_type_id}
              onChange={(e) => handleFilterChange('property_type_id', e.target.value)}
              style={{
                width: '100%',
                padding: '0.52rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">All Property Types</option>
              {propertyTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Listing Type Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Listing Type
            </label>
            <select
              value={filters.listing_type}
              onChange={(e) => handleFilterChange('listing_type', e.target.value)}
              style={{
                width: '100%',
                padding: '0.52rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">Buy &amp; Rent</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Featured
            </label>
            <select
              value={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.value)}
              style={{
                width: '100%',
                padding: '0.52rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">All Properties</option>
              <option value="true">Featured Only</option>
              <option value="false">Standard Only</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Sort By
            </label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              style={{
                width: '100%',
                padding: '0.52rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="newest">Newest Created</option>
              <option value="updated_desc">Recently Updated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Active filter bar summary */}
        {hasActiveFilters && (
          <div
            style={{
              marginTop: '0.9rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ color: '#64748b' }}>
              Showing <strong>{pagination.total}</strong> matching properties
            </span>
            <button
              onClick={handleResetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#991b1b',
            fontSize: '0.88rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchProperties}
            style={{
              backgroundColor: '#991b1b',
              color: '#ffffff',
              border: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Properties Table Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ height: '48px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
              <Building size={42} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-black-heading)', marginBottom: '0.35rem' }}>
                No Properties Found
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
                {hasActiveFilters
                  ? 'No properties match your current filter selection. Try resetting filters.'
                  : 'Get started by creating your first real estate property listing.'}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={handleResetFilters}
                  style={{
                    padding: '0.55rem 1.15rem',
                    backgroundColor: 'var(--color-brand-walnut)',
                    color: '#ffffff',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Clear All Filters
                </button>
              ) : (
                <Link to="/admin/properties/new" style={{ textDecoration: 'none' }}>
                  <PrimaryButton>Create First Property</PrimaryButton>
                </Link>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '0.85rem 1.15rem', fontWeight: '700', color: '#475569' }}>Property</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#475569' }}>Type &amp; Listing</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#475569' }}>Specs</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#475569' }}>Price</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#475569' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.15rem', fontWeight: '700', color: '#475569', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => {
                  const statusBadge = {
                    published: { bg: '#dcfce7', text: '#15803d', label: 'Published' },
                    draft: { bg: '#fef8eb', text: '#855302', label: 'Draft' },
                    archived: { bg: '#f1f5f9', text: '#64748b', label: 'Archived' },
                  }[prop.status] || { bg: '#f1f5f9', text: '#64748b', label: prop.status };

                  const isActionBusy = actionLoadingId === prop.id;

                  return (
                    <tr
                      key={prop.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {/* Property Title & Location */}
                      <td style={{ padding: '0.95rem 1.15rem', maxWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '800', color: 'var(--color-black-heading)', fontSize: '0.9rem' }}>
                            {prop.title}
                          </span>
                          {Boolean(prop.is_featured) && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                backgroundColor: 'rgba(249, 179, 24, 0.16)',
                                color: '#825a05',
                                padding: '0.12rem 0.45rem',
                                borderRadius: '100px',
                                fontSize: '0.68rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                              }}
                            >
                              <Sparkles size={10} /> Featured
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <MapPin size={12} style={{ color: 'var(--color-yellow-hover)', flexShrink: 0 }} />
                          <span>{prop.location}</span>
                          {prop.project_name && (
                            <>
                              <span>•</span>
                              <span style={{ color: '#0284c7', fontWeight: '600' }}>{prop.project_name}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Type & Listing */}
                      <td style={{ padding: '0.95rem 1rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-black)' }}>
                          {prop.property_type_name || prop.property_type}
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '0.2rem',
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: prop.listing_type === 'rent' ? '#ede9fe' : '#e0f2fe',
                            color: prop.listing_type === 'rent' ? '#6d28d9' : '#0369a1',
                          }}
                        >
                          For {prop.listing_type}
                        </span>
                      </td>

                      {/* Specs */}
                      <td style={{ padding: '0.95rem 1rem', color: '#475569', fontSize: '0.8rem' }}>
                        <div>
                          {prop.bedrooms != null ? `${prop.bedrooms} BHK` : '—'} •{' '}
                          {prop.bathrooms != null ? `${prop.bathrooms} Bath` : '—'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                          {prop.area ? formatArea(prop.area, prop.area_unit) : 'Area N/A'}
                        </div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '0.95rem 1rem', fontWeight: '800', color: 'var(--color-black)', fontSize: '0.9rem' }}>
                        {formatPrice(prop.price, prop.listing_type)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.95rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            padding: '0.22rem 0.55rem',
                            borderRadius: '100px',
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.text,
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.95rem 1.15rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          {/* Edit Button */}
                          <Link
                            to={`/admin/properties/${prop.id}/edit`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.38rem 0.65rem',
                              backgroundColor: '#f8fafc',
                              color: '#0f172a',
                              border: '1px solid var(--color-border)',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: '700',
                              textDecoration: 'none',
                            }}
                          >
                            <Edit3 size={13} /> Edit
                          </Link>

                          {/* Publish Action */}
                          {prop.status !== 'published' && (
                            <button
                              onClick={() => handleStatusChange(prop, 'published')}
                              disabled={isActionBusy}
                              title="Publish Property"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.38rem 0.65rem',
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: '700',
                                cursor: isActionBusy ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <CheckCircle2 size={13} /> Publish
                            </button>
                          )}

                          {/* Draft Action */}
                          {prop.status === 'published' && (
                            <button
                              onClick={() => handleStatusChange(prop, 'draft')}
                              disabled={isActionBusy}
                              title="Revert to Draft"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.38rem 0.65rem',
                                backgroundColor: '#fef8eb',
                                color: '#855302',
                                border: '1px solid #fde68a',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: '700',
                                cursor: isActionBusy ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <FileText size={13} /> Unpublish
                            </button>
                          )}

                          {/* Archive Action */}
                          {prop.status !== 'archived' && (
                            <button
                              onClick={() => handleStatusChange(prop, 'archived')}
                              disabled={isActionBusy}
                              title="Archive Property"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.38rem 0.65rem',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: '700',
                                cursor: isActionBusy ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <Archive size={13} /> Archive
                            </button>
                          )}

                          {/* View Public Link if Published */}
                          {prop.status === 'published' && prop.slug && (
                            <Link
                              to={`/properties/${prop.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View Live Public Page"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.38rem',
                                color: '#64748b',
                                borderRadius: '6px',
                                border: '1px solid var(--color-border)',
                              }}
                            >
                              <ExternalLink size={13} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && pagination.totalPages > 1 && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              fontSize: '0.82rem',
            }}
          >
            <span style={{ color: '#64748b', fontWeight: '600' }}>
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total}{' '}
              total properties)
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                }
                disabled={pagination.page <= 1}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.4rem 0.75rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page <= 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.min(pagination.totalPages, prev.page + 1),
                  }))
                }
                disabled={pagination.page >= pagination.totalPages}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.4rem 0.75rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
