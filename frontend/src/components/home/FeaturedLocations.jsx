import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, TrendingUp } from 'lucide-react';
import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import { buildPropertiesUrl } from '../../utils/queryHelper';

const LOCATIONS = [
  {
    name: 'Whitefield',
    subtext: 'IT Corridors & Luxury Gated Communities',
    priceTrend: '₹8,500 - ₹14,000 / sq.ft',
    properties: '140+ Properties',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Indiranagar',
    subtext: 'Iconic Central Living & Premier Lifestyle',
    priceTrend: '₹18,000 - ₹28,000 / sq.ft',
    properties: '65+ Properties',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Koramangala',
    subtext: 'Startup Capital & Prestigious Mansions',
    priceTrend: '₹16,000 - ₹26,000 / sq.ft',
    properties: '80+ Properties',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Sarjapur Road',
    subtext: 'Global Schools & Lakeview Villas',
    priceTrend: '₹7,500 - ₹12,500 / sq.ft',
    properties: '110+ Properties',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Hebbal & North Bangalore',
    subtext: 'Airport Expressway & High-Rise Skylines',
    priceTrend: '₹9,000 - ₹16,500 / sq.ft',
    properties: '95+ Properties',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'HSR Layout',
    subtext: 'Well-Planned Sectors & Green Parks',
    priceTrend: '₹12,000 - ₹20,000 / sq.ft',
    properties: '70+ Properties',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=700&q=80',
  },
];

export default function FeaturedLocations({ onSelectLocation }) {
  const navigate = useNavigate();

  const handleLocationClick = (locationName) => {
    if (onSelectLocation) {
      onSelectLocation(locationName);
    } else {
      navigate(buildPropertiesUrl({ location: locationName }));
    }
  };

  return (
    <section id="locations" style={{ padding: '5.5rem 0', backgroundColor: 'var(--color-bg-primary)' }}>
      <Container>
        <SectionHeader
          badge="Prime Addresses"
          title="Explore Premier Bangalore Localities"
          subtitle="Discover micro-markets with the highest capital appreciation, elite schools, and vibrant infrastructure."
          align="left"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {LOCATIONS.map((loc) => (
            <div
              key={loc.name}
              onClick={() => handleLocationClick(loc.name)}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                height: '320px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                transition: 'all var(--transition-normal)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              {/* Background Image */}
              <img
                src={loc.image}
                alt={loc.name}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  inset: 0,
                  transition: 'transform var(--transition-slow)',
                }}
              />

              {/* Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(10, 10, 10, 0.5) 45%, rgba(10, 10, 10, 0.95) 100%)',
                }}
              />

              {/* Top Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    color: 'var(--color-black)',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {loc.properties}
                </span>
              </div>

              {/* Bottom Content */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1.5rem',
                  color: 'var(--color-white)',
                  zIndex: 2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-yellow-primary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <MapPin size={16} />
                  <span>Bangalore</span>
                </div>

                <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-white)', marginBottom: '0.35rem' }}>
                  {loc.name}
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#d1d5db', marginBottom: '0.85rem' }}>
                  {loc.subtext}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.82rem',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#e5e7eb' }}>
                    <TrendingUp size={14} style={{ color: 'var(--color-yellow-primary)' }} />
                    {loc.priceTrend}
                  </span>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-yellow-primary)', fontWeight: '700' }}>
                    View Properties <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
