import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useFeaturedProperties } from '../../hooks/useFeaturedProperties';
import { formatPrice, formatArea, formatBhk } from '../../utils/formatters';
import PrimaryButton from '../common/PrimaryButton';

gsap.registerPlugin(ScrollTrigger);

// Fallback high-res real estate photos
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
];

export default function FeaturedPropertiesScroll({ onSelectProperty, onOpenEnquiry }) {
  const navigate = useNavigate();
  const { properties, loading, error, refetch } = useFeaturedProperties(8);

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (loading || error || properties.length === 0) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 820;

    // Do not pin on mobile or reduced motion for 60fps native feel
    if (prefersReducedMotion || isMobile) {
      return;
    }

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const section = sectionRef.current;

      if (!track || !section) return;

      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        return -(trackWidth - window.innerWidth + 120);
      };

      // 1. Pinned Horizontal Scrub Animation
      const scrubTween = gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: 'top top',
          end: () => `+=${Math.max(window.innerHeight * 1.5, track.scrollWidth - window.innerWidth + 400)}`,
          scrub: 1.1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // 2. Parallax inside each card's visual image on scrub
      const cardImages = track.querySelectorAll('.property-parallax-img');
      cardImages.forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: 6 },
          {
            xPercent: -8,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${Math.max(window.innerHeight * 1.5, track.scrollWidth - window.innerWidth + 400)}`,
              scrub: 1.1,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, error, properties]);

  const handleCardClick = (property) => {
    if (onSelectProperty) {
      onSelectProperty(property);
    } else if (property.slug) {
      navigate(`/properties/${property.slug}`, { state: { property, openEnquiry: true } });
    } else if (property.id) {
      navigate(`/properties/${property.id}`, { state: { property, openEnquiry: true } });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="featured-properties"
      className="featured-properties-cinematic"
      style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        color: 'var(--color-text-main)',
        overflow: 'hidden',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        className="pinned-inner-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4.5rem 0',
          position: 'relative',
        }}
      >
        {/* Section Header */}
        <div
          ref={headerRef}
          style={{
            padding: '0 4vw',
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--color-brand-navy)',
                backgroundColor: 'rgba(23, 16, 82, 0.08)',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: '800',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              <Sparkles size={13} style={{ color: 'var(--color-brand-yellow)' }} />
              <span>Signature Residences</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.9rem, 3.8vw, 2.9rem)',
                fontWeight: '800',
                color: 'var(--color-brand-navy)',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Curated Portfolio of Distinction
            </h2>

            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--color-text-muted)',
                maxWidth: '620px',
                marginTop: '0.65rem',
                lineHeight: 1.55,
              }}
            >
              Handpicked luxury villas, sky penthouses, and gated master communities with 100% pre-verified legal titles.
            </p>
          </div>

          {/* Right Action / Scroll Cue */}
          <div
            className="horizontal-scroll-hint"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: 'var(--color-text-muted)',
              fontSize: '0.82rem',
              fontWeight: '600',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Drag / Scroll horizontally</span>
              <ArrowRight size={16} style={{ color: 'var(--color-brand-yellow)' }} />
            </span>
            <button
              onClick={refetch}
              disabled={loading}
              title="Refresh listings"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                padding: '0.45rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Loading State: Skeletons */}
        {loading && (
          <div
            style={{
              display: 'flex',
              gap: '2rem',
              padding: '0 4vw',
              overflowX: 'hidden',
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: 'clamp(360px, 30vw, 480px)',
                  height: '520px',
                  borderRadius: '20px',
                  backgroundColor: '#1c1917',
                  flexShrink: 0,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            style={{
              backgroundColor: '#1c1917',
              borderRadius: '16px',
              border: '1px solid #78350f',
              padding: '3rem 2rem',
              textAlign: 'center',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            <AlertCircle size={32} style={{ color: 'var(--color-brand-amber)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Unable to load featured residences
            </h3>
            <p style={{ color: '#a8a29e', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
            <PrimaryButton variant="primary" onClick={refetch}>
              Try Again
            </PrimaryButton>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && properties.length === 0 && (
          <div
            style={{
              backgroundColor: '#1c1917',
              borderRadius: '20px',
              border: '1px solid rgba(229, 222, 214, 0.15)',
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: '640px',
              margin: '0 auto',
            }}
          >
            <Building2 size={36} style={{ color: 'var(--color-brand-amber)', margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem', color: '#FFFFFF' }}>
              Curating Exclusive Private Portfolio
            </h3>
            <p style={{ color: '#a8a29e', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Our senior property acquisition directors are currently onboarding new off-market estates. Connect with us for private viewings.
            </p>
            <PrimaryButton variant="accent" onClick={() => onOpenEnquiry && onOpenEnquiry(null)}>
              Request Custom Property Match
            </PrimaryButton>
          </div>
        )}

        {/* Horizontal Scroll Track */}
        {!loading && !error && properties.length > 0 && (
          <div
            ref={trackRef}
            className="horizontal-properties-track"
            style={{
              display: 'flex',
              gap: '2.25rem',
              padding: '0 4vw',
              willChange: 'transform',
            }}
          >
            {properties.map((prop, index) => {
              const fallbackIndex = Math.abs((prop.id || index) % FALLBACK_IMAGES.length);
              const imageUrl =
                prop.image_url ||
                (prop.images && prop.images.length > 0 ? prop.images[0].image_url : null) ||
                FALLBACK_IMAGES[fallbackIndex];

              return (
                <div
                  key={prop.id || index}
                  onClick={() => handleCardClick(prop)}
                  className="cinematic-property-card"
                  style={{
                    width: 'clamp(380px, 32vw, 500px)',
                    height: '540px',
                    borderRadius: '22px',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                    cursor: 'pointer',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(229, 222, 214, 0.12)',
                    backgroundColor: '#171412',
                  }}
                >
                  {/* Large Visual with Parallax Image Inside */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-10% -10% -10% -10%',
                      overflow: 'hidden',
                      zIndex: 0,
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={prop.title}
                      loading="lazy"
                      className="property-parallax-img"
                      style={{
                        width: '120%',
                        height: '120%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transition: 'transform 0.4s ease, filter 0.4s ease',
                        filter: 'brightness(0.85) contrast(1.05)',
                      }}
                    />
                  </div>

                  {/* Gradient Contrast Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, rgba(11, 13, 18, 0.25) 0%, rgba(11, 13, 18, 0.2) 35%, rgba(11, 13, 18, 0.88) 75%, #0B0D12 100%)',
                      zIndex: 1,
                    }}
                  />

                  {/* Top Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '1.25rem',
                      left: '1.25rem',
                      right: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      zIndex: 2,
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.45rem' }}>
                      <span
                        style={{
                          backgroundColor: 'var(--color-brand-yellow)',
                          color: 'var(--color-brand-navy)',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '0.28rem 0.75rem',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        <Sparkles size={11} /> Featured
                      </span>
                      <span
                        style={{
                          backgroundColor: 'rgba(23, 16, 82, 0.85)',
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.28rem 0.75rem',
                          borderRadius: '9999px',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        For Sale
                      </span>
                    </div>

                    {prop.property_type && (
                      <span
                        style={{
                          backgroundColor: '#FFFFFF',
                          color: 'var(--color-brand-navy)',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          padding: '0.28rem 0.75rem',
                          borderRadius: '9999px',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {prop.property_type}
                      </span>
                    )}
                  </div>

                  {/* Bottom Content Card (Reveals Details as cards enter viewport) */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '1.75rem',
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Price in Indian Format */}
                    <div style={{ marginBottom: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '1.65rem',
                          fontWeight: '900',
                          color: '#FFFFFF',
                          letterSpacing: '-0.02em',
                          textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
                        }}
                      >
                        {formatPrice(prop.price, 'sale')}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: '800',
                        color: '#FFFFFF',
                        lineHeight: 1.25,
                        marginBottom: '0.45rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {prop.title}
                    </h3>

                    {/* Location */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: '#d6d3d1',
                        fontSize: '0.85rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <MapPin size={14} style={{ color: 'var(--color-brand-yellow)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prop.location_name || prop.location || 'Bangalore'}
                      </span>
                    </div>

                    {/* Amenities & Specs Tags */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                        fontSize: '0.82rem',
                        color: '#e7e5e4',
                      }}
                    >
                      {prop.bedrooms > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Bed size={15} style={{ color: 'var(--color-brand-yellow)' }} />
                          {formatBhk(prop.bedrooms)}
                        </span>
                      )}
                      {prop.bathrooms > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Bath size={15} style={{ color: 'var(--color-brand-yellow)' }} />
                          {prop.bathrooms} Baths
                        </span>
                      )}
                      {prop.area_sqft > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Maximize2 size={15} style={{ color: 'var(--color-brand-yellow)' }} />
                          {formatArea(prop.area_sqft, prop.area_unit || 'sqft')}
                        </span>
                      )}

                      {/* Right Explicit Details / View Details Link */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (prop.slug) {
                            navigate(`/properties/${prop.slug}`, { state: { property: prop, openEnquiry: false } });
                          } else if (prop.id) {
                            navigate(`/properties/${prop.id}`, { state: { property: prop, openEnquiry: false } });
                          }
                        }}
                        style={{
                          marginLeft: 'auto',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          color: 'var(--color-brand-amber)',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        Details <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .cinematic-property-card:hover .property-parallax-img {
          transform: scale(1.06);
          filter: brightness(0.95) contrast(1.08);
        }

        @media (max-width: 820px) {
          .pinned-inner-container {
            min-height: auto !important;
            padding: 3rem 0 !important;
          }
          .horizontal-properties-track {
            overflow-x: auto !important;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 1.5rem !important;
          }
          .cinematic-property-card {
            scroll-snap-align: start;
            width: 85vw !important;
            height: 480px !important;
          }
          .horizontal-scroll-hint {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
