import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, TrendingUp, Sparkles, Building2 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Container from '../common/Container';
import { buildPropertiesUrl } from '../../utils/queryHelper';

gsap.registerPlugin(ScrollTrigger);

const LOCATIONS = [
  {
    id: 'whitefield',
    name: 'Whitefield',
    tagline: 'Silicon Corridors & Master-Planned Gated Communities',
    priceTrend: '₹8,500 - ₹14,000 / sq.ft',
    propertiesCount: '140+ Residences',
    highlights: 'Metro Phase 2 Connected • Top International Schools • ITPL Hub',
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
    isLarge: true,
  },
  {
    id: 'indiranagar',
    name: 'Indiranagar',
    tagline: 'Iconic Central Living & High-Street Luxury',
    priceTrend: '₹18,000 - ₹28,000 / sq.ft',
    propertiesCount: '65+ Residences',
    highlights: '100ft Road Boutiques • Gourmet Dining • Central Proximity',
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85',
    isLarge: false,
  },
  {
    id: 'hebbal',
    name: 'Hebbal & North Bangalore',
    tagline: 'Airport Expressway & High-Growth Investment Belt',
    priceTrend: '₹9,500 - ₹16,500 / sq.ft',
    propertiesCount: '95+ Residences',
    highlights: 'Direct Airport Transit • Bellary Road Corridor • Lakeview Towers',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
    isLarge: false,
  },
  {
    id: 'koramangala',
    name: 'Koramangala & HSR',
    tagline: 'Venture Founders & Established Elite Avenues',
    priceTrend: '₹15,000 - ₹25,000 / sq.ft',
    propertiesCount: '80+ Residences',
    highlights: 'Tree-Lined Boulevards • Quiet Residential Blocks • Tech Hubs',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    isLarge: false,
  },
  {
    id: 'sarjapur',
    name: 'Sarjapur Road',
    tagline: 'Expansive Farmland & Luxury Villa Townships',
    priceTrend: '₹7,800 - ₹13,000 / sq.ft',
    propertiesCount: '110+ Residences',
    highlights: 'Carmelaram Junction • Tech Campuses • Premier Gated Enclaves',
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
    isLarge: true,
  },
];

export default function FeaturedLocationsCinematic({ onSelectLocation }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardRefs = useRef([]);
  const imgRefs = useRef([]);
  const contentRefs = useRef([]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(cardRefs.current.filter(Boolean), { opacity: 1, y: 0 });
        gsap.set(contentRefs.current.filter(Boolean), { opacity: 1, y: 0 });
        return;
      }

      // 1. Header fade/slide
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // 2. Parallax background scrub on each image & content text reveal
      cardRefs.current.forEach((cardEl, index) => {
        if (!cardEl) return;

        const imgEl = imgRefs.current[index];
        const contentEl = contentRefs.current[index];

        // Parallax background scrub
        if (imgEl) {
          gsap.fromTo(
            imgEl,
            { yPercent: -12, scale: 1.08 },
            {
              yPercent: 12,
              scale: 1.02,
              ease: 'none',
              scrollTrigger: {
                trigger: cardEl,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            }
          );
        }

        // Location text reveal
        if (contentEl) {
          gsap.fromTo(
            contentEl,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1.0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: cardEl,
                start: 'top 82%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleLocationClick = (locationName) => {
    if (onSelectLocation) {
      onSelectLocation(locationName);
    } else {
      navigate(buildPropertiesUrl({ location: locationName, listing_type: 'sale' }));
    }
  };

  return (
    <section
      ref={sectionRef}
      id="locations"
      style={{
        position: 'relative',
        backgroundColor: 'var(--color-brand-beige)',
        padding: 'clamp(5rem, 8vw, 8rem) 0',
        overflow: 'hidden',
      }}
    >
      <Container>
        {/* Section Header */}
        <div
          ref={headerRef}
          style={{
            maxWidth: '750px',
            marginBottom: '3.5rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(23, 16, 82, 0.08)',
              border: '1px solid rgba(23, 16, 82, 0.18)',
              color: 'var(--color-brand-navy)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <MapPin size={14} style={{ color: 'var(--color-brand-yellow)' }} />
            Prime Geographic Corridors
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              fontWeight: '800',
              color: 'var(--color-brand-navy)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              margin: '0 0 1rem 0',
            }}
          >
            Curated Bangalore Addresses
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Explore micro-markets characterized by sustained capital appreciation,
            established civic infrastructure, and premier lifestyle amenities.
          </p>
        </div>

        {/* Visual Editorial Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '1.75rem',
          }}
        >
          {LOCATIONS.map((loc, idx) => {
            // Layout configuration: First & Last span 7 and 5 or 12, Middle span 4 each
            let gridColSpan = 'span 4';
            let cardHeight = 'clamp(360px, 45vh, 460px)';

            if (idx === 0) {
              gridColSpan = 'span 7';
            } else if (idx === 1) {
              gridColSpan = 'span 5';
            } else if (idx === 4) {
              gridColSpan = 'span 12';
              cardHeight = 'clamp(360px, 42vh, 440px)';
            }

            return (
              <div
                key={loc.id}
                ref={(el) => (cardRefs.current[idx] = el)}
                onClick={() => handleLocationClick(loc.name)}
                style={{
                  gridColumn: gridColSpan,
                  position: 'relative',
                  height: cardHeight,
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 12px 32px rgba(44, 36, 31, 0.08)',
                  border: '1px solid rgba(229, 222, 214, 0.8)',
                  backgroundColor: '#1E1510',
                }}
                className="location-card"
              >
                {/* Parallax Background Container */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-15%',
                    left: 0,
                    right: 0,
                    bottom: '-15%',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    ref={(el) => (imgRefs.current[idx] = el)}
                    src={loc.image}
                    alt={loc.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '130%',
                      objectFit: 'cover',
                      filter: 'brightness(0.85) contrast(1.05)',
                      willChange: 'transform',
                    }}
                  />
                </div>

                {/* Dark Gradient Overlay for optimal legibility */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(30, 21, 16, 0.15) 0%, rgba(30, 21, 16, 0.45) 50%, rgba(18, 13, 10, 0.95) 100%)',
                    zIndex: 1,
                  }}
                />

                {/* Top Badge: Inventory Count */}
                <div
                  style={{
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.25rem',
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--color-brand-navy)',
                      fontWeight: '700',
                      fontSize: '0.78rem',
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    <Building2 size={13} style={{ color: 'var(--color-brand-yellow)' }} />
                    {loc.propertiesCount}
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div
                  ref={(el) => (contentRefs.current[idx] = el)}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 'clamp(1.5rem, 2.8vw, 2.25rem)',
                    color: '#FFFFFF',
                    zIndex: 2,
                    willChange: 'transform, opacity',
                  }}
                >
                  {/* City & Sub-market Label */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: 'var(--color-brand-yellow)',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <MapPin size={15} />
                    <span>Bangalore</span>
                  </div>

                  {/* Locality Headline */}
                  <h3
                    style={{
                      fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
                      fontWeight: '800',
                      color: '#FFFFFF',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15,
                      marginBottom: '0.45rem',
                    }}
                  >
                    {loc.name}
                  </h3>

                  {/* Subtext Tagline */}
                  <p
                    style={{
                      fontSize: '0.92rem',
                      color: '#EDECE6',
                      marginBottom: '0.9rem',
                      lineHeight: 1.45,
                      maxWidth: '580px',
                    }}
                  >
                    {loc.tagline}
                  </p>

                  {/* Footer Meta Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid rgba(221, 217, 207, 0.25)',
                      fontSize: '0.86rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: '#FFFFFF',
                        fontWeight: '600',
                      }}
                    >
                      <TrendingUp size={15} style={{ color: 'var(--color-brand-yellow)' }} />
                      {loc.priceTrend}
                    </span>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: 'var(--color-brand-yellow)',
                        fontWeight: '700',
                        fontSize: '0.88rem',
                        transition: 'transform 0.2s ease',
                      }}
                      className="view-cta"
                    >
                      Explore Inventory <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      <style>{`
        @media (max-width: 900px) {
          .location-card {
            grid-column: span 12 !important;
            height: 380px !important;
          }
        }
        .location-card:hover .view-cta {
          transform: translateX(4px);
        }
      `}</style>
    </section>
  );
}
