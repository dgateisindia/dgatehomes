import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, IndianRupee, Sparkles, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Container from '../common/Container';
import { usePropertyTypes } from '../../hooks/usePropertyTypes';
import { buildPropertiesUrl } from '../../utils/queryHelper';

gsap.registerPlugin(ScrollTrigger);

// High-resolution architectural photography for cinematic hero
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2560&q=85';

export default function HeroCinematic({ onSearch }) {
  const navigate = useNavigate();
  const { propertyTypes, loading: propertyTypesLoading } = usePropertyTypes();

  // Search form states (Sale only as requested)
  const [location, setLocation] = useState('');
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [budget, setBudget] = useState('');

  // Refs for GSAP animations
  const heroRef = useRef(null);
  const heroBgRef = useRef(null);
  const headlineLine1Ref = useRef(null);
  const headlineLine2Ref = useRef(null);
  const subtextRef = useRef(null);
  const badgeRef = useRef(null);
  const searchCardRef = useRef(null);
  const scrollCueRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Simple instant reveal for reduced motion
        gsap.set(
          [badgeRef.current, headlineLine1Ref.current, headlineLine2Ref.current, subtextRef.current, searchCardRef.current, scrollCueRef.current],
          { opacity: 1, y: 0 }
        );
        return;
      }

      // 1. Parallax movement on hero background image
      gsap.to(heroBgRef.current, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // 2. Slow, intentional cinematic entrance timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 1.1, delay: 0.2 }
      )
        .fromTo(
          [headlineLine1Ref.current, headlineLine2Ref.current],
          { opacity: 0, y: 48 },
          { opacity: 1, y: 0, duration: 1.2, stagger: 0.16 },
          '-=0.7'
        )
        .fromTo(
          subtextRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1.0 },
          '-=0.8'
        )
        .fromTo(
          searchCardRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 1.1 },
          '-=0.7'
        )
        .fromTo(
          scrollCueRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.9 },
          '-=0.4'
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    let minPrice = '';
    let maxPrice = '';
    if (budget) {
      const parts = budget.split('-');
      if (parts[0] && Number(parts[0]) > 0) minPrice = parts[0];
      if (parts[1]) maxPrice = parts[1];
    }

    const searchPayload = {
      listing_type: 'sale',
      location: location.trim(),
      property_type_id: propertyTypeId ? Number(propertyTypeId) : undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    };

    if (onSearch) {
      onSearch(searchPayload);
    } else {
      navigate(buildPropertiesUrl(searchPayload));
    }
  };

  return (
    <section
      ref={heroRef}
      className="hero-cinematic"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#0B0D12',
        color: '#FFFFFF',
        paddingTop: '6rem',
        paddingBottom: '5rem',
      }}
    >
      {/* Background Cinematic Visual with Subtle Parallax */}
      <div
        style={{
          position: 'absolute',
          inset: '-10% 0 -10% 0',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <img
          ref={heroBgRef}
          src={HERO_IMAGE}
          alt="Luxury Architecture"
          style={{
            width: '100%',
            height: '120%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
            filter: 'brightness(0.72) contrast(1.05)',
            transform: 'scale(1.04)',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Cinematic Vignette Overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(11, 13, 18, 0.25) 0%, rgba(11, 13, 18, 0.72) 70%, rgba(11, 13, 18, 0.95) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(11, 13, 18, 0.6) 0%, transparent 35%, rgba(11, 13, 18, 0.85) 85%, #0B0D12 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <Container style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <div
          style={{
            maxWidth: '1060px',
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Subtle Luxury Pre-title Tag */}
          <div
            ref={badgeRef}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(249, 179, 24, 0.16)',
              border: '1px solid rgba(249, 179, 24, 0.35)',
              color: 'var(--color-brand-yellow)',
              padding: '0.4rem 1.15rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: '700',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '1.75rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Sparkles size={13} />
            <span>Curated Luxury Real Estate &bull; Bangalore</span>
          </div>

          {/* Large Typography Headline (Line-by-Line Reveal) */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
              fontWeight: '800',
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              marginBottom: '1.5rem',
              color: '#FFFFFF',
              textShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
            }}
          >
            <span
              ref={headlineLine1Ref}
              style={{
                display: 'block',
                overflow: 'hidden',
              }}
            >
              Where Architectural Vision
            </span>
            <span
              ref={headlineLine2Ref}
              style={{
                display: 'block',
                color: 'var(--color-brand-yellow)',
                fontWeight: '800',
              }}
            >
              Meets Prime Living.
            </span>
          </h1>

          {/* Subheading */}
          <p
            ref={subtextRef}
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
              color: '#EDECE6',
              lineHeight: 1.65,
              maxWidth: '740px',
              margin: '0 auto 2.75rem',
              fontWeight: '400',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            Discover verified private estates, sky penthouses, and gated master-planned
            communities with direct developer pricing and 100% audited title verification.
          </p>

          {/* Compact 99acres-Density Search Bar (Sale Only) */}
          <div
            ref={searchCardRef}
            className="hero-search-wrapper"
            style={{
              width: '100%',
              maxWidth: '960px',
              margin: '0 auto',
            }}
          >
            <div
              className="hero-search-card"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: '16px',
                boxShadow:
                  '0 24px 48px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--color-border)',
                padding: '16px 20px',
                textAlign: 'left',
                color: 'var(--color-text-main)',
              }}
            >
              <form onSubmit={handleSearchSubmit}>
                <div
                  className="hero-search-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1.1fr 1.1fr auto',
                    gap: '12px',
                    alignItems: 'flex-end',
                  }}
                >
                  {/* Field 1: Location */}
                  <div className="hero-search-field">
                    <label
                      htmlFor="cinematic-location"
                      style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        color: 'var(--color-brand-navy)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: '4px',
                      }}
                    >
                      Location / Micro-Market
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <MapPin
                        size={17}
                        style={{
                          position: 'absolute',
                          left: '0.85rem',
                          color: 'var(--color-brand-navy)',
                          pointerEvents: 'none',
                        }}
                      />
                      <input
                        id="cinematic-location"
                        type="text"
                        placeholder="e.g. Indiranagar, Whitefield"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="cinematic-search-input"
                      />
                    </div>
                  </div>

                  {/* Field 2: Property Type */}
                  <div className="hero-search-field">
                    <label
                      htmlFor="cinematic-property-type"
                      style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        color: 'var(--color-brand-navy)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: '4px',
                      }}
                    >
                      Property Type
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Home
                        size={17}
                        style={{
                          position: 'absolute',
                          left: '0.85rem',
                          color: 'var(--color-brand-navy)',
                          pointerEvents: 'none',
                        }}
                      />
                      <select
                        id="cinematic-property-type"
                        value={propertyTypeId}
                        onChange={(e) => setPropertyTypeId(e.target.value)}
                        disabled={propertyTypesLoading}
                        className="cinematic-search-input"
                        style={{ cursor: propertyTypesLoading ? 'not-allowed' : 'pointer' }}
                      >
                        <option value="">
                          {propertyTypesLoading ? 'Loading Categories...' : 'All Property Types'}
                        </option>
                        {propertyTypes.map((pt) => (
                          <option key={pt.id} value={String(pt.id)}>
                            {pt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Field 3: Budget Range (Sale Only) */}
                  <div className="hero-search-field">
                    <label
                      htmlFor="cinematic-budget"
                      style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        color: 'var(--color-brand-navy)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: '4px',
                      }}
                    >
                      Budget Range (For Sale)
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <IndianRupee
                        size={17}
                        style={{
                          position: 'absolute',
                          left: '0.85rem',
                          color: 'var(--color-brand-navy)',
                          pointerEvents: 'none',
                        }}
                      />
                      <select
                        id="cinematic-budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="cinematic-search-input"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="">Any Budget</option>
                        <option value="0-5000000">Up to ₹50 Lakhs</option>
                        <option value="5000000-10000000">₹50 L - ₹1.00 Cr</option>
                        <option value="10000000-25000000">₹1.00 Cr - ₹2.50 Cr</option>
                        <option value="25000000-50000000">₹2.50 Cr - ₹5.00 Cr</option>
                        <option value="50000000-">₹5.00 Cr + (Ultra Luxury)</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Action */}
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="submit"
                      className="cinematic-search-btn"
                      aria-label="Search Properties"
                    >
                      <Search size={16} />
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Subtle Scroll Cue */}
          <div
            ref={scrollCueRef}
            style={{
              marginTop: '3.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#a8a29e',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: '600',
              opacity: 0.85,
            }}
          >
            <span>Scroll To Explore</span>
            <div
              style={{
                width: '20px',
                height: '32px',
                border: '1.5px solid rgba(229, 222, 214, 0.4)',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '6px',
              }}
            >
              <div
                style={{
                  width: '3px',
                  height: '6px',
                  backgroundColor: 'var(--color-brand-amber)',
                  borderRadius: '2px',
                  animation: 'scrollPulse 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        </div>
      </Container>

      {/* Embedded CSS for Search Controls & Keyframes */}
      <style>{`
        .cinematic-search-input {
          width: 100%;
          height: 48px;
          padding: 0 0.85rem 0 2.35rem;
          border-radius: 10px;
          border: 1.5px solid var(--color-border);
          outline: none;
          font-size: 0.9rem;
          font-weight: 500;
          background-color: var(--color-surface);
          color: var(--color-text-main);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-sizing: border-box;
        }

        .cinematic-search-input:focus {
          border-color: var(--color-brand-yellow);
          box-shadow: 0 0 0 3px rgba(249, 179, 24, 0.25);
        }

        .cinematic-search-btn {
          height: 48px;
          padding: 0 1.5rem;
          background-color: var(--color-brand-navy);
          color: #FFFFFF;
          border-radius: 10px;
          font-size: 0.92rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          white-space: nowrap;
          border: 1px solid var(--color-brand-navy);
          transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(23, 16, 82, 0.22);
          box-sizing: border-box;
        }

        .cinematic-search-btn:hover {
          background-color: var(--color-brand-navy-hover);
          border-color: var(--color-brand-navy-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(23, 16, 82, 0.35);
        }

        @keyframes scrollPulse {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(10px);
            opacity: 0.2;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 860px) {
          .hero-search-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .cinematic-search-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
