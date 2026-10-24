import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Sparkles,
  Building2,
  Phone,
  MessageCircle,
  AlertCircle,
  ArrowLeft,
  Tag,
  Layers,
  CheckCircle2,
  ChevronRight,
  Send,
  Home,
  RefreshCw,
  X,
  ShieldCheck,
} from 'lucide-react';
import Container from '../components/common/Container';
import PrimaryButton from '../components/common/PrimaryButton';
import PropertyGallery from '../components/property/PropertyGallery';
import PropertyEnquiryForm from '../components/property/PropertyEnquiryForm';
import EnquiryModal from '../components/common/EnquiryModal';
import { propertyService } from '../services/propertyService';
import { formatPrice, formatArea, formatBhk } from '../utils/formatters';
import { getAmenityIcon } from '../utils/amenityIcons';
import { CONTACT_CONFIG } from '../config/contact';
import { ENABLE_RENT_LISTINGS } from '../config/listingModes';

export default function PropertyDetailPage({
  property: propProperty,
  enquiryModalOpen: propEnquiryModalOpen,
  setEnquiryModalOpen: propSetEnquiryModalOpen,
}) {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(propProperty || location.state?.property || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localModalOpen, setLocalModalOpen] = useState(false);

  const enquiryModalOpen = propEnquiryModalOpen !== undefined ? propEnquiryModalOpen : localModalOpen;
  const setEnquiryModalOpen = propSetEnquiryModalOpen || setLocalModalOpen;

  // Active property context: dynamically resolved from props, API data, or navigation state
  const currentProperty = propProperty || data?.property || selectedProperty;

  const fetchProperty = () => {
    setLoading(true);
    setError(null);

    propertyService
      .getPropertyBySlug(slug)
      .then((res) => {
        if (res && res.success && res.data) {
          setData(res.data);
          if (res.data.property) {
            setSelectedProperty(res.data.property);
          }
        } else {
          setError('Property not found');
        }
      })
      .catch((err) => {
        console.error('Failed to load property details:', err);
        setError(err.message || 'Property not found');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Clear/reset modal and property state when changing properties so old property data is never submitted accidentally
    setEnquiryModalOpen(false);
    setData(null);
    setSelectedProperty(propProperty || location.state?.property || null);
    fetchProperty();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, propProperty]);

  // Once property data has loaded, automatically open the enquiry popup if openEnquiry flag was passed
  useEffect(() => {
    if (location.state?.openEnquiry && !loading && (data?.property || selectedProperty)) {
      setEnquiryModalOpen(true);
      // Clear/replace navigation state so refreshing the page does not keep reopening the popup unintentionally
      navigate(location.pathname, {
        replace: true,
        state: { ...location.state, openEnquiry: false },
      });
    }
  }, [location.state?.openEnquiry, loading, data, selectedProperty, location.pathname, navigate, setEnquiryModalOpen]);

  // 11. Loading State
  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '85vh', padding: '3rem 0 6rem' }}>
        <Container>
          <div style={{ width: '220px', height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '2rem' }} />
          <div style={{ height: '440px', backgroundColor: '#e5e7eb', borderRadius: 'var(--radius-xl)', marginBottom: '2.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ width: '60%', height: '36px', backgroundColor: '#e5e7eb', borderRadius: '6px' }} />
              <div style={{ width: '40%', height: '24px', backgroundColor: '#e5e7eb', borderRadius: '6px' }} />
              <div style={{ width: '100%', height: '120px', backgroundColor: '#f3f4f6', borderRadius: '12px' }} />
              {/* Amenities Skeleton Block */}
              <div style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
                <div style={{ width: '35%', height: '20px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '1.25rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} style={{ height: '52px', backgroundColor: '#f3f4f6', borderRadius: 'var(--radius-md)' }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ height: '400px', backgroundColor: '#f3f4f6', borderRadius: '16px' }} />
          </div>
        </Container>
      </div>
    );
  }

  // 12. Not Found State & 13. Safe Error State
  if (error || !data || !data.property) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '75vh', padding: '6rem 0' }}>
        <Container>
          <div
            style={{
              maxWidth: '560px',
              margin: '0 auto',
              textAlign: 'center',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-xl)',
              padding: '3.5rem 2rem',
              border: '1px solid var(--color-border)',
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
              <AlertCircle size={32} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-black-heading)', marginBottom: '0.75rem' }}>
              Property Not Found
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
              The property you are looking for may have been archived, sold, or is temporarily unavailable.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/properties">
                <PrimaryButton variant="primary" icon={ArrowLeft} iconPosition="left">
                  Browse Properties
                </PrimaryButton>
              </Link>
              <PrimaryButton variant="outline" icon={RefreshCw} iconPosition="left" onClick={fetchProperty}>
                Retry
              </PrimaryButton>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const { property, images, amenities, tags, project, unitType } = data;
  const isRent = ENABLE_RENT_LISTINGS && property.listing_type === 'rent';

  const whatsappUrl = CONTACT_CONFIG.getWhatsAppUrl(property.title, property.slug);
  const telUrl = CONTACT_CONFIG.getTelUrl();

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* 14. Breadcrumb Navigation Bar */}
      <section
        style={{
          backgroundColor: '#0a0a0a',
          color: 'var(--color-white)',
          padding: '1.25rem 0',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                color: '#9ca3af',
              }}
            >
              <Link to="/" style={{ color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Home size={13} /> Home
              </Link>
              <ChevronRight size={13} style={{ color: '#6b7280' }} />
              {/* Clicking breadcrumb "Properties" returns to /properties */}
              <Link
                to="/properties"
                style={{
                  color: '#e5e7eb',
                  fontWeight: '600',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-yellow-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#e5e7eb')}
              >
                Properties
              </Link>
              <ChevronRight size={13} style={{ color: '#6b7280' }} />
              <span style={{ color: 'var(--color-yellow-primary)', fontWeight: '700', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {property.title}
              </span>
            </nav>

            <Link
              to="/properties"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: 'var(--color-yellow-primary)',
              }}
            >
              <ArrowLeft size={14} /> Back to Search Results
            </Link>
          </div>
        </Container>
      </section>

      {/* Main Page Layout Grid */}
      <Container style={{ paddingTop: '2.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '2.75rem',
          }}
          className="property-detail-layout-grid"
        >
          {/* Main Left Column */}
          <main style={{ minWidth: 0 }}>
            {/* 1. Property Image Section (Main image + thumbnail gallery sorted by sort_order with cover first) */}
            <PropertyGallery images={images} title={property.title} />

            {/* 2. Main Property Information Header */}
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '2.25rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                {/* Badges: Featured, Listing Type, Property Type */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {Boolean(property.is_featured) && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        backgroundColor: 'var(--color-yellow-primary)',
                        color: 'var(--color-black)',
                        fontWeight: '800',
                        fontSize: '0.75rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <Sparkles size={12} /> FEATURED RESIDENCE
                    </span>
                  )}

                  <span
                    style={{
                      backgroundColor: 'var(--color-black)',
                      color: 'var(--color-white)',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isRent ? 'FOR RENT' : 'FOR SALE'}
                  </span>

                  {property.property_type && (
                    <span
                      style={{
                        backgroundColor: 'var(--color-bg-subtle)',
                        color: 'var(--color-black)',
                        border: '1px solid var(--color-border)',
                        fontWeight: '700',
                        fontSize: '0.75rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {property.property_type}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div>
                  <span
                    style={{
                      fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                      fontWeight: '900',
                      color: 'var(--color-black)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {formatPrice(property.price, ENABLE_RENT_LISTINGS ? property.listing_type : 'sale')}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 3.2vw, 2.45rem)',
                  fontWeight: '800',
                  color: 'var(--color-black-heading)',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                  marginBottom: '0.75rem',
                }}
              >
                {property.title}
              </h1>

              {/* Location with Address */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: 'var(--color-text-secondary)',
                  fontSize: '1rem',
                }}
              >
                <MapPin size={18} style={{ color: 'var(--color-yellow-primary)', flexShrink: 0 }} />
                <span>{property.address || property.location || 'Bangalore, Karnataka'}</span>
              </div>
            </div>

            {/* 2. Key Specs Matrix Grid */}
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-black-heading)', marginBottom: '1.5rem' }}>
                Property Highlights &amp; Specifications
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {/* Bedrooms */}
                <div style={{ padding: '1.15rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>
                    <Bed size={15} /> Bedrooms
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.35rem' }}>
                    {property.bedrooms ? `${property.bedrooms} BHK` : 'N/A'}
                  </div>
                </div>

                {/* Bathrooms */}
                <div style={{ padding: '1.15rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>
                    <Bath size={15} /> Bathrooms
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.35rem' }}>
                    {property.bathrooms ? `${property.bathrooms} Baths` : 'N/A'}
                  </div>
                </div>

                {/* Area */}
                <div style={{ padding: '1.15rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>
                    <Maximize2 size={15} /> Super Built-up Area
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.35rem' }}>
                    {formatArea(property.area, property.area_unit)}
                  </div>
                </div>

                {/* Possession Date */}
                <div style={{ padding: '1.15rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>
                    <Calendar size={15} /> Possession Status
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.35rem' }}>
                    {property.possession_date ? new Date(property.possession_date).toLocaleDateString() : 'Ready to Move'}
                  </div>
                </div>

                {/* Units Available */}
                {property.units_available !== undefined && property.units_available !== null && (
                  <div style={{ padding: '1.15rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>
                      <Layers size={15} /> Units Available
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.35rem' }}>
                      {property.units_available} {property.units_available === 1 ? 'Unit' : 'Units'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Description Section */}
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-black-heading)', marginBottom: '1rem' }}>
                About This Property
              </h2>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.98rem', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                {property.description ||
                  'Experience unrivaled architectural luxury and timeless elegance. Handcrafted for refined living with premium construction quality, abundant natural ventilation, and direct connectivity to premier business parks and international schools.'}
              </div>
            </div>

            {/* 4. Amenities Section (Dynamic icons and labels from API response only) */}
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-black-heading)', marginBottom: '1.25rem' }}>
                Lifestyle Amenities &amp; Features
              </h2>

              {amenities && amenities.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {amenities.map((amenity) => {
                    const AmenityIcon = getAmenityIcon(amenity);
                    return (
                      <div
                        key={amenity.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.85rem 1rem',
                          backgroundColor: 'var(--color-bg-subtle)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-yellow-light)',
                            color: 'var(--color-yellow-hover)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <AmenityIcon size={18} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-black)' }}>
                            {amenity.name}
                          </span>
                          {amenity.category && (
                            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                              {amenity.category}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--color-border)',
                  }}
                >
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', margin: 0 }}>
                    Standard property specifications apply. Please request the full developer brochure for complete community features.
                  </p>
                </div>
              )}
            </div>

            {/* 5. Tags Section */}
            {tags && tags.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Tag size={18} style={{ color: 'var(--color-yellow-primary)' }} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-black-heading)' }}>
                    Property Tags &amp; Classifications
                  </h2>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.95rem',
                        backgroundColor: 'var(--color-bg-subtle)',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: 'var(--color-black)',
                      }}
                    >
                      <Sparkles size={12} style={{ color: 'var(--color-yellow-primary)' }} />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Project Information (when project exists) */}
            {project && (
              <div
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Building2 size={20} style={{ color: 'var(--color-yellow-primary)' }} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-black-heading)' }}>
                    Master Project Overview: {project.name}
                  </h2>
                </div>

                {project.description && (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                    {project.description}
                  </p>
                )}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Project Location
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.25rem' }}>
                      {project.location || project.address || 'Bangalore'}
                    </div>
                  </div>

                  {project.launch_date && (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Launch Date
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.25rem' }}>
                        {new Date(project.launch_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {project.possession_date && (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Project Handover
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.25rem' }}>
                        {new Date(project.possession_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. Unit Type Information (when unitType exists) */}
            {unitType && (
              <div
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Layers size={20} style={{ color: 'var(--color-yellow-primary)' }} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-black-heading)' }}>
                    Unit Configuration Details: {unitType.name}
                  </h2>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Base Price
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.25rem' }}>
                      {unitType.base_price ? formatPrice(unitType.base_price) : 'On Request'}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Layout Configuration
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.25rem' }}>
                      {unitType.bedrooms} Beds &bull; {unitType.bathrooms} Baths
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Unit Area
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.25rem' }}>
                      {formatArea(unitType.area, unitType.area_unit)}
                    </div>
                  </div>

                  {unitType.units_available !== undefined && (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Inventory Status
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-black)', marginTop: '0.25rem' }}>
                        {unitType.units_available} of {unitType.units_total || unitType.units_available} Available
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Right Sticky Sidebar: Quick Actions & Primary Enquiry CTA */}
          <aside className="property-detail-sidebar">
            <div style={{ position: 'sticky', top: '95px' }}>
              <div
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '2rem',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-yellow-light)',
                      color: 'var(--color-yellow-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-black)' }}>
                      Speak With Specialist
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Direct developer liaison, transparent pricing, and zero brokerage assistance.
                </p>

                {/* Direct Instant CTAs: Call & WhatsApp */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <a
                    href={telUrl}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-black)',
                      color: 'var(--color-white)',
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      textDecoration: 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f2937';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-black)';
                    }}
                  >
                    <Phone size={16} style={{ color: 'var(--color-yellow-primary)' }} />
                    <span>Call Now</span>
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#25D366',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      textDecoration: 'none',
                      transition: 'all var(--transition-fast)',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1EBE5D';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#25D366';
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Primary Enquiry CTA button to open modal */}
                <PrimaryButton
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => setEnquiryModalOpen(true)}
                  icon={Send}
                  iconPosition="right"
                  style={{ fontWeight: '700', marginBottom: '1rem' }}
                >
                  Enquire Now
                </PrimaryButton>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    fontSize: '0.74rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <ShieldCheck size={14} style={{ color: 'var(--color-yellow-primary)' }} />
                  <span>100% Verified Properties &amp; Zero Brokerage</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="mobile-bottom-bar">
        <a href={telUrl} className="mobile-cta-btn mobile-cta-call">
          <Phone size={18} />
          <span>Call</span>
        </a>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mobile-cta-btn mobile-cta-wa">
          <MessageCircle size={18} />
          <span>WhatsApp</span>
        </a>

        <button
          type="button"
          className="mobile-cta-btn mobile-cta-enquire"
          onClick={() => setEnquiryModalOpen(true)}
        >
          <Send size={16} />
          <span>Enquire</span>
        </button>
      </div>

      {/* Property Enquiry Popup Modal */}
      <EnquiryModal
        isOpen={enquiryModalOpen && Boolean(currentProperty)}
        onClose={() => setEnquiryModalOpen(false)}
        property={currentProperty}
      />

      {/* Embedded Responsive Styles */}
      <style>{`
        .mobile-bottom-bar {
          display: none;
        }

        @media (min-width: 1024px) {
          .property-detail-layout-grid {
            grid-template-columns: minmax(0, 1fr) 390px !important;
          }
        }

        @media (max-width: 1023px) {
          .mobile-bottom-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #0a0a0a;
            border-top: 1px solid #1f2937;
            padding: 0.75rem 1rem;
            display: flex;
            gap: 0.5rem;
            z-index: 999;
            box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.35);
          }
          .mobile-cta-btn {
            flex: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.35rem;
            padding: 0.75rem 0.5rem;
            border-radius: var(--radius-md);
            font-size: 0.88rem;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
            border: none;
          }
          .mobile-cta-call {
            background-color: #1f2937;
            color: var(--color-white);
          }
          .mobile-cta-wa {
            background-color: #25D366;
            color: #FFFFFF;
          }
          .mobile-cta-enquire {
            background-color: var(--color-yellow-primary);
            color: var(--color-black);
          }
        }
      `}</style>
    </div>
  );
}
