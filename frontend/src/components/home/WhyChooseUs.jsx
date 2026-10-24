import React from 'react';
import { ShieldCheck, IndianRupee, KeyRound, Award, Users, Compass } from 'lucide-react';
import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: '100% Legal & Title Verification',
    description:
      'Every listing undergoes our 45-point legal audit. RERA approvals, encumbrance certificates, and sanctioned plans are pre-verified.',
  },
  {
    icon: IndianRupee,
    title: 'Direct Developer Pricing',
    description:
      'Transparent pricing with zero markup and zero hidden costs. Gain access to pre-launch allocations and preferential builder rates.',
  },
  {
    icon: KeyRound,
    title: 'End-to-End Concierge Advisory',
    description:
      'Dedicated property specialists manage everything: private site tours, legal documentation, home loan approvals, and registration.',
  },
  {
    icon: Award,
    title: 'Handpicked Grade-A Residences',
    description:
      'We reject sub-par construction. Only premier gated communities from reputable builders with proven track records make our portfolio.',
  },
];

export default function WhyChooseUs() {
  return (
    <section
      id="why-us"
      style={{
        padding: '5.5rem 0',
        backgroundColor: '#0B0D12',
        color: 'var(--color-white)',
        borderTop: '1px solid #1f2937',
        borderBottom: '1px solid #1f2937',
      }}
    >
      <Container>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(249, 179, 24, 0.15)',
              border: '1px solid rgba(249, 179, 24, 0.35)',
              color: 'var(--color-yellow-primary)',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            The Dgate Advantage
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: '800',
              lineHeight: 1.2,
              color: 'var(--color-white)',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            Why Discerning Homebuyers <br />
            Trust <span style={{ color: 'var(--color-yellow-primary)' }}>Dgate Homes</span>
          </h2>

          <p style={{ fontSize: '1rem', color: '#9ca3af', lineHeight: 1.6 }}>
            Redefining luxury real estate with uncompromising integrity, white-glove advisory, and complete peace of mind.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
          }}
        >
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                style={{
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.25rem 1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all var(--transition-normal)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-yellow-primary)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#262626';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(249, 179, 24, 0.15)',
                    color: 'var(--color-yellow-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                  }}
                >
                  <Icon size={28} />
                </div>

                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'var(--color-white)',
                    marginBottom: '0.75rem',
                    lineHeight: 1.3,
                  }}
                >
                  {b.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.92rem',
                    color: '#9ca3af',
                    lineHeight: 1.6,
                  }}
                >
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
