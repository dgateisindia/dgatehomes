import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  ArrowLeft,
  Save,
  Building,
  IndianRupee,
  Maximize2,
  Landmark,
  Sparkles,
  Tag as TagIcon,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  Archive,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  getAdminPropertyById,
  createAdminProperty,
  updateAdminProperty,
  updateAdminPropertyStatus,
  getAdminTags,
  getAdminProjects,
} from '../../services/adminPropertyService';
import { usePropertyTypes } from '../../hooks/usePropertyTypes';
import { useAmenities } from '../../hooks/useAmenities';
import { formatPrice } from '../../utils/formatters';
import PrimaryButton from '../../components/common/PrimaryButton';
import PropertyImageManager from '../../components/admin/PropertyImageManager';

function toDateInputValue(val) {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export default function AdminPropertyFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const { propertyTypes, loading: loadingTypes } = usePropertyTypes();
  const { amenities, loading: loadingAmenities } = useAmenities();

  const [availableTags, setAvailableTags] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    address: '',
    property_type_id: '',
    listing_type: 'sale',
    bedrooms: '',
    bathrooms: '',
    area: '',
    area_unit: 'sqft',
    units_available: '',
    listing_date: '',
    possession_date: '',
    expires_at: '',
    is_featured: false,
    project_id: '',
    project_unit_type_id: '',
    amenity_ids: [],
    tag_ids: [],
  });

  const [propertyMeta, setPropertyMeta] = useState({
    status: 'draft',
    slug: '',
    published_at: null,
    archived_at: null,
    images: [],
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load tags, projects, and (if edit mode) existing property record
  const loadFormDependencies = useCallback(async () => {
    setInitialLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token is required.');
      }

      const [tagsData, projectsData, propertyBundle] = await Promise.all([
        getAdminTags(token).catch(() => []),
        getAdminProjects(token).catch(() => []),
        isEditMode ? getAdminPropertyById(token, id) : Promise.resolve(null),
      ]);

      setAvailableTags(tagsData);
      setAvailableProjects(projectsData);

      if (isEditMode && propertyBundle && propertyBundle.property) {
        const p = propertyBundle.property;
        setFormData({
          title: p.title || '',
          description: p.description || '',
          price: p.price != null ? String(Number(p.price)) : '',
          location: p.location || '',
          address: p.address || '',
          property_type_id: p.property_type_id ? String(p.property_type_id) : '',
          listing_type: p.listing_type || 'sale',
          bedrooms: p.bedrooms != null ? String(p.bedrooms) : '',
          bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
          area: p.area != null ? String(Number(p.area)) : '',
          area_unit: p.area_unit || 'sqft',
          units_available: p.units_available != null ? String(p.units_available) : '',
          listing_date: toDateInputValue(p.listing_date),
          possession_date: toDateInputValue(p.possession_date),
          expires_at: toDateInputValue(p.expires_at),
          is_featured: Boolean(p.is_featured),
          project_id: p.project_id ? String(p.project_id) : '',
          project_unit_type_id: p.project_unit_type_id ? String(p.project_unit_type_id) : '',
          amenity_ids: (propertyBundle.amenities || []).map((a) => Number(a.id)),
          tag_ids: (propertyBundle.tags || []).map((t) => Number(t.id)),
        });

        setPropertyMeta({
          status: p.status || 'draft',
          slug: p.slug || '',
          published_at: p.published_at,
          archived_at: p.archived_at,
          images: propertyBundle.images || [],
        });
      }
    } catch (err) {
      console.error('[AdminPropertyFormPage] Failed to load form data:', err);
      setError(err.message || 'Failed to load property details.');
    } finally {
      setInitialLoading(false);
    }
  }, [getToken, id, isEditMode]);

  useEffect(() => {
    loadFormDependencies();
  }, [loadFormDependencies]);

  // Group amenities by category
  const amenitiesByCategory = useMemo(() => {
    const groups = {};
    for (const amenity of amenities) {
      const cat = amenity.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(amenity);
    }
    return groups;
  }, [amenities]);

  // Filter unit types based on selected project_id
  const selectedProjectUnitTypes = useMemo(() => {
    if (!formData.project_id) return [];
    const proj = availableProjects.find((p) => String(p.id) === String(formData.project_id));
    return proj?.unitTypes || [];
  }, [availableProjects, formData.project_id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      // Reset unit type if project changes
      if (name === 'project_id') {
        next.project_unit_type_id = '';
      }
      return next;
    });
  };

  const handleToggleAmenity = (amenityId) => {
    const numId = Number(amenityId);
    setFormData((prev) => {
      const exists = prev.amenity_ids.includes(numId);
      return {
        ...prev,
        amenity_ids: exists
          ? prev.amenity_ids.filter((item) => item !== numId)
          : [...prev.amenity_ids, numId],
      };
    });
  };

  const handleToggleTag = (tagId) => {
    const numId = Number(tagId);
    setFormData((prev) => {
      const exists = prev.tag_ids.includes(numId);
      return {
        ...prev,
        tag_ids: exists
          ? prev.tag_ids.filter((item) => item !== numId)
          : [...prev.tag_ids, numId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getToken();
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        location: formData.location.trim(),
        address: formData.address.trim(),
        property_type_id: Number(formData.property_type_id),
        listing_type: formData.listing_type,
        bedrooms: formData.bedrooms !== '' ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms !== '' ? Number(formData.bathrooms) : null,
        area: formData.area !== '' ? Number(formData.area) : null,
        area_unit: formData.area_unit || 'sqft',
        units_available: formData.units_available !== '' ? Number(formData.units_available) : null,
        listing_date: formData.listing_date || null,
        possession_date: formData.possession_date || null,
        expires_at: formData.expires_at || null,
        is_featured: Boolean(formData.is_featured),
        project_id: formData.project_id ? Number(formData.project_id) : null,
        project_unit_type_id: formData.project_unit_type_id
          ? Number(formData.project_unit_type_id)
          : null,
        amenity_ids: formData.amenity_ids,
        tag_ids: formData.tag_ids,
      };

      if (isEditMode) {
        const res = await updateAdminProperty(token, id, payload);
        if (res.data?.property) {
          setPropertyMeta((prev) => ({
            ...prev,
            status: res.data.property.status,
            slug: res.data.property.slug,
          }));
        }
        setSuccessMessage('Property changes saved and activity logged.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const res = await createAdminProperty(token, payload);
        const createdId = res.data?.property?.id;
        if (createdId) {
          navigate(`/admin/properties/${createdId}/edit`, { replace: true });
        } else {
          navigate('/admin/properties');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save property.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusTransition = async (newStatus) => {
    if (!isEditMode) return;
    setStatusUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getToken();
      const res = await updateAdminPropertyStatus(
        token,
        id,
        newStatus,
        `Status changed to ${newStatus} from property editor`
      );
      if (res.data?.property) {
        setPropertyMeta((prev) => ({
          ...prev,
          status: res.data.property.status,
          published_at: res.data.property.published_at,
          archived_at: res.data.property.archived_at,
        }));
      }
      setSuccessMessage(`Property status updated to ${newStatus.toUpperCase()}.`);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.85rem' }}>
        <Loader2 size={32} style={{ color: 'var(--color-yellow-primary)', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>
          {isEditMode ? 'Loading property configuration...' : 'Preparing property form...'}
        </span>
      </div>
    );
  }

  const sectionCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    padding: '1.5rem 1.75rem',
    marginBottom: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '0.4rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    fontSize: '0.88rem',
    color: 'var(--color-black)',
    backgroundColor: '#ffffff',
    outline: 'none',
  };

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Top Action Header */}
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
          <Link
            to="/admin/properties"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#64748b',
              textDecoration: 'none',
              marginBottom: '0.35rem',
            }}
          >
            <ArrowLeft size={14} /> Back to Properties List
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
              {isEditMode ? `Edit Property #${id}` : 'Create New Property'}
            </h1>
            {isEditMode && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '0.22rem 0.65rem',
                  borderRadius: '100px',
                  textTransform: 'uppercase',
                  backgroundColor:
                    propertyMeta.status === 'published'
                      ? '#dcfce7'
                      : propertyMeta.status === 'draft'
                      ? '#fef8eb'
                      : '#f1f5f9',
                  color:
                    propertyMeta.status === 'published'
                      ? '#15803d'
                      : propertyMeta.status === 'draft'
                      ? '#855302'
                      : '#64748b',
                }}
              >
                {propertyMeta.status}
              </span>
            )}
          </div>
        </div>

        {/* Status Quick Controls (Edit Mode) */}
        {isEditMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {propertyMeta.status === 'published' && propertyMeta.slug && (
              <Link
                to={`/properties/${propertyMeta.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.48rem 0.85rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#334155',
                  textDecoration: 'none',
                }}
              >
                View Live <ExternalLink size={13} />
              </Link>
            )}

            {propertyMeta.status !== 'published' && (
              <button
                type="button"
                onClick={() => handleStatusTransition('published')}
                disabled={statusUpdating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.48rem 0.9rem',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: statusUpdating ? 'not-allowed' : 'pointer',
                }}
              >
                <CheckCircle2 size={14} /> Publish Listing
              </button>
            )}

            {propertyMeta.status !== 'draft' && (
              <button
                type="button"
                onClick={() => handleStatusTransition('draft')}
                disabled={statusUpdating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.48rem 0.85rem',
                  backgroundColor: '#fef8eb',
                  color: '#855302',
                  border: '1px solid #fde68a',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: statusUpdating ? 'not-allowed' : 'pointer',
                }}
              >
                <FileText size={14} /> Move to Draft
              </button>
            )}

            {propertyMeta.status !== 'archived' && (
              <button
                type="button"
                onClick={() => handleStatusTransition('archived')}
                disabled={statusUpdating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.48rem 0.85rem',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: statusUpdating ? 'not-allowed' : 'pointer',
                }}
              >
                <Archive size={14} /> Archive
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.95rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            fontSize: '0.88rem',
            fontWeight: '600',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '0.95rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem',
            fontWeight: '600',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: '800' }}
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 1. Basic Information */}
        <div style={sectionCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <Building size={18} style={{ color: 'var(--color-yellow-primary)' }} />
            <h2 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
              1. Basic Information
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>
                Property Title <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                minLength={3}
                maxLength={200}
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Dgate Aurelia 4 BHK Luxury Villa in Whitefield"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Property Type <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="property_type_id"
                required
                value={formData.property_type_id}
                onChange={handleInputChange}
                disabled={loadingTypes}
                style={inputStyle}
              >
                <option value="">Select Property Type</option>
                {propertyTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name} ({pt.segment})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Listing Type <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="listing_type"
                required
                value={formData.listing_type}
                onChange={handleInputChange}
                style={inputStyle}
              >
                <option value="sale">For Sale (Buy)</option>
                <option value="rent">For Rent (Lease)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Location / Micro-market <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="location"
                required
                maxLength={150}
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Whitefield, Indiranagar, Hebbal"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Full Street Address <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="address"
                required
                maxLength={500}
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g. Plot 42, ITPL Main Road, Whitefield, Bengaluru 560066"
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>
                Detailed Property Description <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                name="description"
                required
                minLength={10}
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe architectural highlights, connectivity, specifications, and investment potential..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>
          </div>
        </div>

        {/* 2. Pricing */}
        <div style={sectionCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <IndianRupee size={18} style={{ color: 'var(--color-yellow-primary)' }} />
            <h2 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
              2. Pricing
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem', alignItems: 'center' }}>
            <div>
              <label style={labelStyle}>
                Price (in INR) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="number"
                name="price"
                required
                min="1"
                step="any"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g. 14500000"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '0.85rem 1.15rem',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Formatted Display Preview
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--color-black-heading)', marginTop: '0.2rem' }}>
                {formData.price ? formatPrice(formData.price, formData.listing_type) : '₹ —'}
              </div>
              {isEditMode && (
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Note: Modifying price automatically records an audit entry in <code>property_price_history</code>.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Property Details */}
        <div style={sectionCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <Maximize2 size={18} style={{ color: 'var(--color-yellow-primary)' }} />
            <h2 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
              3. Property Details &amp; Specifications
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.15rem' }}>
            <div>
              <label style={labelStyle}>Bedrooms (BHK)</label>
              <input
                type="number"
                name="bedrooms"
                min="0"
                max="100"
                value={formData.bedrooms}
                onChange={handleInputChange}
                placeholder="e.g. 3"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                min="0"
                max="100"
                value={formData.bathrooms}
                onChange={handleInputChange}
                placeholder="e.g. 3"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Area</label>
              <input
                type="number"
                name="area"
                min="1"
                step="any"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="e.g. 2150"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Area Unit</label>
              <select
                name="area_unit"
                value={formData.area_unit}
                onChange={handleInputChange}
                style={inputStyle}
              >
                <option value="sqft">Square Feet (sq.ft)</option>
                <option value="sqm">Square Meters (sq.m)</option>
                <option value="acre">Acres</option>
                <option value="gunta">Guntas</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Units Available</label>
              <input
                type="number"
                name="units_available"
                min="0"
                value={formData.units_available}
                onChange={handleInputChange}
                placeholder="e.g. 5"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* 4. Project Information */}
        <div style={sectionCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <Landmark size={18} style={{ color: 'var(--color-yellow-primary)' }} />
            <h2 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
              4. Project Information (Optional)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem' }}>
            <div>
              <label style={labelStyle}>Associated Project</label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleInputChange}
                style={inputStyle}
              >
                <option value="">Standalone Property (No Project)</option>
                {availableProjects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name} — {proj.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Project Unit Type</label>
              <select
                name="project_unit_type_id"
                value={formData.project_unit_type_id}
                onChange={handleInputChange}
                disabled={!formData.project_id || selectedProjectUnitTypes.length === 0}
                style={{
                  ...inputStyle,
                  backgroundColor:
                    !formData.project_id || selectedProjectUnitTypes.length === 0
                      ? '#f8fafc'
                      : '#ffffff',
                }}
              >
                <option value="">
                  {!formData.project_id
                    ? 'Select a project first'
                    : selectedProjectUnitTypes.length === 0
                    ? 'No unit types defined for this project'
                    : 'Select Unit Type (Optional)'}
                </option>
                {selectedProjectUnitTypes.map((ut) => (
                  <option key={ut.id} value={ut.id}>
                    {ut.name} ({ut.bedrooms ? `${ut.bedrooms} BHK, ` : ''}
                    {ut.area} {ut.area_unit})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 5. Amenities */}
        <div style={sectionCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Sparkles size={18} style={{ color: 'var(--color-yellow-primary)' }} />
              <h2 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
                5. Amenities ({formData.amenity_ids.length} selected)
              </h2>
            </div>

            {amenities.length > 0 && (
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      amenity_ids: amenities.map((a) => Number(a.id)),
                    }))
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    color: '#0284c7',
                    cursor: 'pointer',
                  }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, amenity_ids: [] }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {loadingAmenities ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading amenities from MySQL...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {Object.entries(amenitiesByCategory).map(([category, items]) => (
                <div key={category}>
                  <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
                    {category}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.6rem' }}>
                    {items.map((amenity) => {
                      const isChecked = formData.amenity_ids.includes(Number(amenity.id));
                      return (
                        <label
                          key={amenity.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.55rem',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '6px',
                            border: isChecked
                              ? '1px solid var(--color-brand-accent)'
                              : '1px solid var(--color-border)',
                            backgroundColor: isChecked
                              ? 'rgba(249, 179, 24, 0.12)'
                              : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.83rem',
                            fontWeight: isChecked ? '700' : '500',
                            color: 'var(--color-black)',
                            transition: 'all 0.15s',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAmenity(amenity.id)}
                            style={{ accentColor: 'var(--color-brand-amber)' }}
                          />
                          <span>{amenity.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Tags */}
        <div style={sectionCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <TagIcon size={18} style={{ color: 'var(--color-yellow-primary)' }} />
            <h2 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
              6. Property Tags ({formData.tag_ids.length} selected)
            </h2>
          </div>

          {availableTags.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>No active tags available.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {availableTags.map((tag) => {
                const isSelected = formData.tag_ids.includes(Number(tag.id));
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.id)}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '100px',
                      border: isSelected
                        ? '1px solid var(--color-brand-accent)'
                        : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-brand-walnut)' : '#ffffff',
                      color: isSelected ? 'var(--color-brand-amber)' : 'var(--color-text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 7. Listing Settings */}
        <div style={sectionCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <Calendar size={18} style={{ color: 'var(--color-yellow-primary)' }} />
            <h2 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
              7. Listing Settings &amp; Schedule
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.15rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Listing Date</label>
              <input
                type="date"
                name="listing_date"
                value={formData.listing_date}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Possession Date</label>
              <input
                type="date"
                name="possession_date"
                value={formData.possession_date}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Listing Expiry Date</label>
              <input
                type="date"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
          </div>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.85rem 1.15rem',
              backgroundColor: formData.is_featured ? 'rgba(249, 179, 24, 0.14)' : '#f8fafc',
              border: formData.is_featured
                ? '1px solid var(--color-brand-accent)'
                : '1px solid var(--color-border)',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleInputChange}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-brand-amber)' }}
            />
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--color-black-heading)' }}>
                Mark as Featured Property
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Featured listings are showcased prominently on the Dgate Homes homepage and highlighted with a gold badge.
              </div>
            </div>
          </label>
        </div>

        {/* 8. Property Media & Cloudinary Gallery */}
        {isEditMode ? (
          <PropertyImageManager
            propertyId={id}
            initialImages={propertyMeta.images}
            onImagesChange={(updatedImages) =>
              setPropertyMeta((prev) => ({
                ...prev,
                images: updatedImages,
              }))
            }
          />
        ) : (
          <div
            style={{
              ...sectionCardStyle,
              backgroundColor: '#f8fafc',
              borderStyle: 'dashed',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.55rem' }}>
              <ImageIcon size={18} style={{ color: 'var(--color-yellow-hover)' }} />
              <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
                8. Property Media &amp; Cloudinary Gallery
              </h2>
            </div>

            <p style={{ color: '#475569', fontSize: '0.86rem', margin: 0, lineHeight: 1.5 }}>
              Click <strong>Create Property (Draft)</strong> below to generate this listing&apos;s ID first. You will be redirected immediately to the editor where you can upload multiple images to Cloudinary, set the cover photo, and sort the gallery.
            </p>
          </div>
        )}

        {/* Submit Footer Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.85rem',
            paddingTop: '0.5rem',
            paddingBottom: '2.5rem',
          }}
        >
          <Link
            to="/admin/properties"
            style={{
              padding: '0.68rem 1.25rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              color: '#475569',
              fontSize: '0.88rem',
              fontWeight: '700',
              textDecoration: 'none',
            }}
          >
            Cancel
          </Link>

          <PrimaryButton
            type="submit"
            disabled={submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.7rem 1.65rem',
              fontSize: '0.9rem',
            }}
          >
            <Save size={16} />
            {submitting
              ? 'Saving Property...'
              : isEditMode
              ? 'Save Property Changes'
              : 'Create Property (Draft)'}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
