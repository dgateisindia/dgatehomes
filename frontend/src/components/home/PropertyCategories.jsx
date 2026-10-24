import React from 'react';
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
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import PrimaryButton from '../common/PrimaryButton';
import { usePropertyTypes } from '../../hooks/usePropertyTypes';
import { buildPropertiesUrl } from '../../utils/queryHelper';

/**
 * Dynamically resolves an icon based on property type slug and segment.
 */
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

/**
 * Provides descriptive context for each category.
 */
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

export default function PropertyCategories({ onSelectCategory }) {
  const navigate = useNavigate();
  const { propertyTypes, loading } = usePropertyTypes();

  const handleCardClick = (pt) => {
    if (onSelectCategory) {
      onSelectCategory(pt.name, pt.id);
    } else {
      navigate(buildPropertiesUrl({ property_type_id: pt.id }));
    }
  };

  return (
    <section id="categories" style={{ padding: '5.5rem 0', backgroundColor: 'var(--color-bg-primary)' }}>
      <Container>
        <SectionHeader
          badge="Curated Collections"
          title="Explore by Property Category"
          subtitle="Handcrafted property segments loaded dynamically from verified database records."
          align="left"
        />

        {/* Loading State: Skeletons */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '1.75rem',
                  height: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#e5e7eb', borderRadius: 'var(--radius-md)' }} />
                  <div style={{ width: '80px', height: '22px', backgroundColor: '#e5e7eb', borderRadius: 'var(--radius-full)' }} />
                </div>
                <div style={{ width: '65%', height: '24px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
                <div style={{ width: '100%', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
                <div style={{ width: '85%', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && (!propertyTypes || propertyTypes.length === 0) && (
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              maxWidth: '560px',
              margin: '0 auto',
              boxShadow: 'var(--shadow-card)',
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
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              No Property Categories Found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Categories are currently being updated in our central real-estate catalog.
            </p>
            <PrimaryButton variant="primary" icon={RefreshCw} onClick={() => window.location.reload()}>
              Reload Categories
            </PrimaryButton>
          </div>
        )}

        {/* Dynamic Property Categories Grid */}
        {!loading && propertyTypes && propertyTypes.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {propertyTypes.map((pt) => {
              const Icon = getCategoryIcon(pt);
              const description = getCategoryDescription(pt);

              return (
                <div
                  key={pt.id}
                  onClick={() => handleCardClick(pt)}
                  style={{
                    backgroundColor: 'var(--color-white)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all var(--transition-normal)',
                    position: 'relative',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--color-yellow-primary)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-yellow-light)',
                        color: 'var(--color-yellow-hover)',
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
                          color: 'var(--color-black)',
                          backgroundColor: 'var(--color-bg-subtle)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
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
                      fontSize: '1.2rem',
                      fontWeight: '800',
                      color: 'var(--color-black-heading)',
                      marginBottom: '0.5rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {pt.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.55,
                      marginBottom: '1.25rem',
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
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: 'var(--color-black)',
                      marginTop: 'auto',
                    }}
                  >
                    <span>Explore Properties</span>
                    <ArrowUpRight size={14} style={{ color: 'var(--color-yellow-primary)' }} />
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
