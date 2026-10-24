import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  Home,
  Castle,
  Trees,
  Briefcase,
  Layers,
  MapPin,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Container from '../common/Container';
import { usePropertyTypes } from '../../hooks/usePropertyTypes';
import { buildPropertiesUrl } from '../../utils/queryHelper';

gsap.registerPlugin(ScrollTrigger);

function getCategoryIcon(pt) {
  const slug = (pt.slug || pt.name || '').toLowerCase();
  const segment = (pt.segment || '').toLowerCase();

  if (slug.includes('villa')) return Castle;
  if (slug.includes('apart')) return Building;
  if (slug.includes('farm')) return Trees;
  if (slug.includes('house')) return Home;
  if (slug.includes('plot')) return Layers;
  if (slug.includes('land')) return MapPin;
  if (slug.includes('commercial') || segment === 'commercial') return Briefcase;

  return Building;
}

function getCategoryDescription(pt) {
  const slug = (pt.slug || '').toLowerCase();
  if (slug === 'apartment') return 'Modern 2, 3 & 4 BHK residences in premier master-planned communities';
  if (slug === 'villa') return 'Independent luxury gated villas with private gardens & clubhouse access';
  if (slug === 'independent-house') return 'Exclusive individual residences, duplexes and luxury row houses';
  if (slug === 'farm-house') return 'Serene weekend retreats and sprawling countryside farmland estates';
  if (slug === 'plot') return 'BMRDA & BDA approved freehold residential plots with clear legal titles';
  if (slug === 'land') return 'Prime agricultural and strategic investment development parcels';
  if (slug === 'commercial-site') return 'Strategic commercial plots positioned along high-growth arterial corridors';
  if (slug === 'commercial-building') return 'Grade-A corporate office suites, retail showrooms, and tech park assets';
  return `Explore verified ${pt.name} listings in prime Bangalore locations`;
}

export default function PropertyCategoriesCinematic({ onSelectCategory }) {
  const navigate = useNavigate();
  const { propertyTypes, loading } = usePropertyTypes();
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (loading || !propertyTypes || propertyTypes.length === 0) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll('.category-reveal-card');
      if (!cards || cards.length === 0) return;

      if (prefersReducedMotion) {
        gsap.set(cards, { opacity: 1, scale: 1, y: 0 });
        return;
      }

      // Staggered card reveal: scale & fade from 0.96 to 1
      gsap.fromTo(
        cards,
        { opacity: 0, scale: 0.96, y: 32 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 82%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, propertyTypes]);

  const handleCardClick = (pt) => {
    if (onSelectCategory) {
      onSelectCategory(pt.name, pt.id);
    } else {
      navigate(buildPropertiesUrl({ property_type_id: pt.id }));
    }
  };

  return (
    <section
      ref={sectionRef}
      id="categories"
      style={{
        padding: '6.5rem 0',
        backgroundColor: 'var(--color-brand-beige)',
        position: 'relative',
      }}
    >
      <Container>
        {/* Section Header */}
        <div style={{ maxWidth: '720px', marginBottom: '3.5rem' }}>
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
            <span>Curated Asset Classes</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '800',
              color: 'var(--color-brand-navy)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0 0 0.75rem',
            }}
          >
            Explore by Property Category
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Handcrafted property segments loaded dynamically from verified database records.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  height: '220px',
                  borderRadius: '16px',
                  backgroundColor: '#f3f0ea',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        )}

        {/* Categories Grid with Staggered Scale/Fade Reveal */}
        {!loading && propertyTypes && propertyTypes.length > 0 && (
          <div
            ref={gridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {propertyTypes.map((pt) => {
              const Icon = getCategoryIcon(pt);
              const description = getCategoryDescription(pt);

              return (
                <div
                  key={pt.id}
                  onClick={() => handleCardClick(pt)}
                  className="category-reveal-card"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '18px',
                    border: '1.5px solid var(--color-border)',
                    padding: '2rem 1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.3s ease',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(44, 36, 31, 0.04)',
                    willChange: 'transform, opacity',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'var(--color-brand-yellow)';
                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(23, 16, 82, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(31, 31, 36, 0.04)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(23, 16, 82, 0.06)',
                        color: 'var(--color-brand-navy)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} />
                    </div>

                    {pt.segment && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          color: 'var(--color-brand-navy)',
                          backgroundColor: 'var(--color-brand-beige)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          border: '1px solid var(--color-border)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {pt.segment}
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      color: 'var(--color-brand-navy)',
                      marginBottom: '0.5rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {pt.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.6,
                      marginBottom: '1.5rem',
                      flex: 1,
                    }}
                  >
                    {description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.84rem',
                      fontWeight: '700',
                      color: 'var(--color-brand-navy)',
                      marginTop: 'auto',
                    }}
                  >
                    <span>Explore Properties</span>
                    <ArrowUpRight size={15} style={{ color: 'var(--color-brand-yellow)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
