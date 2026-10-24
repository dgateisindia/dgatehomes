import React from 'react';
import { ArrowRight, Sparkles, AlertCircle, RefreshCw, Building2 } from 'lucide-react';
import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import PropertyCard from '../property/PropertyCard';
import PrimaryButton from '../common/PrimaryButton';
import { useFeaturedProperties } from '../../hooks/useFeaturedProperties';

export default function FeaturedPropertiesSection({ onSelectProperty, onOpenEnquiry }) {
  const { properties, loading, error, refetch } = useFeaturedProperties(6);

  return (
    <section
      id="featured-properties"
      style={{
        padding: '5.5rem 0',
        backgroundColor: 'var(--color-bg-subtle)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <Container>
        <SectionHeader
          badge="Featured Residences"
          title="Handpicked Luxury Properties"
          subtitle="Carefully inspected and certified luxury residences in Bangalore's most sought-after prime neighborhoods."
          align="left"
          action={
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <PrimaryButton
                variant="outline"
                size="sm"
                icon={RefreshCw}
                iconPosition="left"
                onClick={refetch}
                loading={loading}
              >
                Refresh
              </PrimaryButton>
            </div>
          }
        />

        {/* Loading State: 6 Skeleton Cards */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  height: '420px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    height: '240px',
                    backgroundColor: '#e5e7eb',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  <div style={{ width: '40%', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
                  <div style={{ width: '80%', height: '22px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
                  <div style={{ width: '60%', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
                  <div style={{ marginTop: 'auto', width: '100%', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #fed7aa',
              padding: '3rem 2rem',
              textAlign: 'center',
              maxWidth: '540px',
              margin: '0 auto',
              boxShadow: 'var(--shadow-md)',
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
              <AlertCircle size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Temporarily Unable to Load Properties
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {error}
            </p>
            <PrimaryButton variant="primary" icon={RefreshCw} onClick={refetch}>
              Try Again
            </PrimaryButton>
          </div>
        )}

        {/* Empty State (when DB has 0 published featured properties) */}
        {!loading && !error && properties.length === 0 && (
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: '680px',
              margin: '0 auto',
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
              <Building2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-black-heading)', marginBottom: '0.75rem' }}>
              Curating Exclusive Featured Properties
            </h3>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Our property acquisition team is currently verifying and onboarding brand new ultra-luxury residences across Bangalore. Looking for off-market or upcoming project opportunities?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <PrimaryButton
                variant="primary"
                onClick={() => onOpenEnquiry && onOpenEnquiry(null)}
                icon={Sparkles}
                iconPosition="left"
              >
                Request Custom Property Match
              </PrimaryButton>
              <PrimaryButton
                variant="outline"
                onClick={refetch}
                icon={RefreshCw}
                iconPosition="left"
              >
                Refresh Listings
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && !error && properties.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {properties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
