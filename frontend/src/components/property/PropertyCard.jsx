import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize2, Sparkles, ArrowUpRight } from 'lucide-react';
import { formatPrice, formatArea, formatBhk } from '../../utils/formatters';
import { ENABLE_RENT_LISTINGS } from '../../config/listingModes';

// Fallback high-res real estate architectural photos
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
];

/**
 * Premium Property Card component.
 * Navigates to /properties/:slug when clicked.
 */
export default function PropertyCard({ property, onEnquire, onClick }) {
  const navigate = useNavigate();

  if (!property) return null;

  // Determine display image: property may have image_url directly from view or child images
  const fallbackIndex = Math.abs((property.id || 1) % FALLBACK_IMAGES.length);
  const imageUrl =
    property.image_url ||
    (property.images && property.images.length > 0 ? property.images[0].image_url : null) ||
    FALLBACK_IMAGES[fallbackIndex];

  const isRent = ENABLE_RENT_LISTINGS && property.listing_type === 'rent';
  const isFeatured = Boolean(property.is_featured);

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(property);
    } else if (property.slug) {
      navigate(`/properties/${property.slug}`, { state: { property, openEnquiry: true } });
    } else if (property.id) {
      navigate(`/properties/${property.id}`, { state: { property, openEnquiry: true } });
    }
  };

  return (
    <div
      className="property-card"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-card)',
        transition: 'all var(--transition-normal)',
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
        e.currentTarget.style.borderColor = 'var(--color-yellow-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      {/* Property Image Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '62%', // 16:10 aspect ratio
          backgroundColor: '#e5e7eb',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageUrl}
          alt={property.title || 'Dgate Property'}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-slow)',
          }}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGES[0];
          }}
        />

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* Badges on Image */}
        <div
          style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.85rem',
            right: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {isFeatured && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: 'var(--color-brand-yellow)',
                  color: 'var(--color-brand-navy)',
                  fontWeight: '800',
                  fontSize: '0.72rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: 'var(--shadow-sm)',
                  letterSpacing: '0.04em',
                }}
              >
                <Sparkles size={12} />
                FEATURED
              </span>
            )}
            <span
              style={{
                backgroundColor: 'rgba(23, 16, 82, 0.85)',
                backdropFilter: 'blur(4px)',
                color: 'var(--color-white)',
                fontWeight: '600',
                fontSize: '0.72rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {isRent ? 'FOR RENT' : 'FOR SALE'}
            </span>
          </div>

          {property.property_type && (
            <span
              style={{
                backgroundColor: 'var(--color-brand-beige)',
                color: 'var(--color-brand-navy)',
                border: '1px solid var(--color-border)',
                fontWeight: '700',
                fontSize: '0.72rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {property.property_type}
            </span>
          )}
        </div>

        {/* Price on Image Bottom Left */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '0.85rem',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: '1.35rem',
              fontWeight: '800',
              color: 'var(--color-white)',
              textShadow: '0 2px 8px rgba(0,0,0,0.7)',
              letterSpacing: '-0.02em',
            }}
          >
            {formatPrice(property.price, ENABLE_RENT_LISTINGS ? property.listing_type : 'sale')}
          </span>
        </div>
      </div>

      {/* Property Details Body */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: 'var(--color-black-heading)',
            lineHeight: 1.35,
            marginBottom: '0.4rem',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {property.title}
        </h3>

        {/* Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}
        >
          <MapPin size={15} style={{ color: 'var(--color-yellow-primary)', flexShrink: 0 }} />
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {property.location || property.address || 'Bangalore, Karnataka'}
          </span>
        </div>

        {/* Specs Pills (Beds, Baths, Area) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #f3f4f6',
            marginBottom: '1.15rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)' }}>
              <Bed size={14} />
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '600' }}>Beds</span>
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-black)' }}>
              {property.bedrooms ? `${property.bedrooms} BHK` : 'N/A'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)' }}>
              <Bath size={14} />
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '600' }}>Baths</span>
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-black)' }}>
              {property.bathrooms ? `${property.bathrooms}` : 'N/A'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)' }}>
              <Maximize2 size={14} />
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '600' }}>Area</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-black)' }}>
              {formatArea(property.area, property.area_unit)}
            </span>
          </div>
        </div>

        {/* Action Row */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (property.slug) {
                navigate(`/properties/${property.slug}`, { state: { property, openEnquiry: false } });
              } else if (property.id) {
                navigate(`/properties/${property.id}`, { state: { property, openEnquiry: false } });
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'var(--color-text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-yellow-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-main)';
            }}
          >
            Explore <ArrowUpRight size={14} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onEnquire) {
                onEnquire(property);
              } else if (property.slug) {
                navigate(`/properties/${property.slug}`, { state: { property, openEnquiry: true } });
              } else if (property.id) {
                navigate(`/properties/${property.id}`, { state: { property, openEnquiry: true } });
              }
            }}
            style={{
              backgroundColor: 'var(--color-brand-navy)',
              color: 'var(--color-white)',
              fontWeight: '700',
              fontSize: '0.82rem',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 2px 4px rgba(23, 16, 82, 0.2)',
              border: '1px solid var(--color-brand-navy)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-brand-navy-hover)';
              e.currentTarget.style.borderColor = 'var(--color-brand-navy-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-brand-navy)';
              e.currentTarget.style.borderColor = 'var(--color-brand-navy)';
            }}
          >
            Quick Enquiry
          </button>
        </div>
      </div>
    </div>
  );
}
