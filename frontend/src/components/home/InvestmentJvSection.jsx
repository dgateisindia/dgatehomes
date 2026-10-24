import React, { useEffect, useRef } from 'react';
import {
  Briefcase,
  TrendingUp,
  Layers,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Container from '../common/Container';
import PrimaryButton from '../common/PrimaryButton';

gsap.registerPlugin(ScrollTrigger);

const JV_PILLARS = [
  {
    number: '01',
    icon: Layers,
    title: 'Land Monetization & Joint Developments (JD)',
    subtitle: 'Maximize the intrinsic value of your prime Bangalore land parcels',
    description:
      'We connect land owners with top-tier developers through transparent revenue-sharing or area-sharing joint development agreements. Our advisory structures clear legal terms, milestone guarantees, and maximum floor area realization.',
    points: [
      'Tier-1 builder matchmaking (Sobha, Prestige, Embassy, Brigade tier)',
      'Clear revenue-share and area-sharing contract structuring',
      'Zero upfront liability with escrow-backed project guarantees',
    ],
  },
  {
    number: '02',
    icon: TrendingUp,
    title: 'Pre-Leased Commercial & High-Yield Assets',
    subtitle: 'Predictable cash flows with 8.5% – 11% institutional returns',
    description:
      'Acquire pre-leased Grade-A corporate office suites, premium high-street retail storefronts, and logistics warehousing. Every commercial property comes with established multinational tenants and locked-in long leases.',
    points: [
      'Pre-vetted MNC and blue-chip corporate tenant covenants',
      'Transparent rental yield calculations with built-in escalation clauses',
      'Asset management oversight and secondary market resale exit pathways',
    ],
  },
  {
    number: '03',
    icon: Building,
    title: 'Pre-Launch Institutional Allocations',
    subtitle: 'Preferential developer entry rates before public release',
    description:
      'Gain exclusive entry into master-planned developments at foundational pricing. Benefit from steep capital appreciation cycles between groundbreaking and structure completion.',
    points: [
      'Preferential early-allocation pricing below prevailing market rates',
      'Priority selection of prime units, penthouses, and corner villas',
      'Guaranteed RERA registration and clear escrow compliance',
    ],
  },
  {
    number: '04',
    icon: ShieldCheck,
    title: 'Institutional Title & Legal Due Diligence',
    subtitle: 'Uncompromising risk mitigation backed by senior advocates',
    description:
      'Avoid land disputes and regulatory pitfalls. Our internal legal team and empanelled high court counsels verify parent deeds, RTCs, conversion certificates, and master plan alignments.',
    points: [
      '45-point comprehensive revenue and title search report',
      'BMRDA, BDA, and local planning authority approval verification',
      'Title indemnity audit ensuring unencumbered ownership transfer',
    ],
  },
];

export default function InvestmentJvSection({ onOpenEnquiry }) {
  const sectionRef = useRef(null);
  const stickyLeftRef = useRef(null);
  const pillarRefs = useRef([]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(pillarRefs.current.filter(Boolean), { opacity: 1, y: 0 });
        return;
      }

      // Stagger each pillar card reveal as user scrolls
      pillarRefs.current.forEach((el) => {
        if (!el) return;

        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="investment-jv"
      style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        padding: 'clamp(5rem, 8vw, 8.5rem) 0',
        overflow: 'hidden',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <Container>
        <div className="jv-split-container">
          {/* Left Column: Sticky Editorial Showcase */}
          <div className="jv-sticky-column">
            <div
              ref={stickyLeftRef}
              className="jv-sticky-card"
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-brand-navy)',
                color: '#FFFFFF',
                boxShadow: '0 20px 48px rgba(23, 16, 82, 0.18)',
                border: '1px solid rgba(221, 217, 207, 0.3)',
              }}
            >
              {/* Architectural Image */}
              <div style={{ position: 'relative', height: '340px', overflow: 'hidden' }}>
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85"
                  alt="Dgate Homes Commercial & Land Advisory"
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(23, 16, 82, 0.1) 0%, rgba(23, 16, 82, 0.88) 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    left: '1.5rem',
                    right: '1.5rem',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: 'rgba(249, 179, 24, 0.25)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--color-brand-yellow)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '0.35rem 0.8rem',
                      borderRadius: 'var(--radius-full)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <Sparkles size={13} />
                    Institutional Advisory
                  </span>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', lineHeight: 1.25 }}>
                    Strategic Capital & Land Monetization
                  </div>
                </div>
              </div>

              {/* Bottom Card Summary & CTA */}
              <div style={{ padding: '2rem' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.25rem',
                    marginBottom: '1.75rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid rgba(221, 217, 207, 0.2)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        color: 'var(--color-brand-yellow)',
                        lineHeight: 1.1,
                      }}
                    >
                      ₹450+ Cr
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#EDECE6', marginTop: '0.2rem' }}>
                      Land Deals Facilitated
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        color: 'var(--color-brand-yellow)',
                        lineHeight: 1.1,
                      }}
                    >
                      8.5% – 11%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#EDECE6', marginTop: '0.2rem' }}>
                      Pre-Leased Commercial Yield
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '0.9rem',
                    color: '#EDECE6',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                  }}
                >
                  Have prime land in Bangalore or looking to deploy capital into high-yield commercial real estate?
                  Our senior advisory desk provides private and confidential consultations.
                </p>

                <PrimaryButton
                  variant="accent"
                  size="md"
                  fullWidth
                  onClick={() =>
                    onOpenEnquiry &&
                    onOpenEnquiry({
                      title: 'Joint Venture & Investment Advisory',
                      purpose: 'investment_jv',
                    })
                  }
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Consult Our Investment Desk
                </PrimaryButton>
              </div>
            </div>
          </div>

          {/* Right Column: Scrolling Narrative Cards */}
          <div className="jv-scroll-column">
            <div style={{ marginBottom: '2.5rem' }}>
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
                <Briefcase size={14} style={{ color: 'var(--color-brand-yellow)' }} />
                Joint Ventures & Real Estate Investment
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2.2rem, 3.6vw, 3.2rem)',
                  fontWeight: '800',
                  color: 'var(--color-brand-navy)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  margin: '0 0 1rem 0',
                }}
              >
                Unlocking Maximum Value from Prime Bangalore Real Estate
              </h2>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Whether you own family land ripe for development or seek high-yield commercial asset allocation,
                Dgate Homes provides institutional expertise and zero-friction execution.
              </p>
            </div>

            {/* List of 4 Pillars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {JV_PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.number}
                    ref={(el) => (pillarRefs.current[idx] = el)}
                    style={{
                      backgroundColor: 'var(--color-brand-beige)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '2.25rem',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                      willChange: 'transform, opacity',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-brand-yellow)';
                      e.currentTarget.style.boxShadow = '0 10px 28px rgba(23, 16, 82, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.boxShadow = 'none';
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
                          backgroundColor: 'rgba(23, 16, 82, 0.08)',
                          color: 'var(--color-brand-navy)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={24} />
                      </div>

                      <span
                        style={{
                          fontSize: '1.4rem',
                          fontWeight: '800',
                          color: 'var(--color-brand-yellow)',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {pillar.number}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: '800',
                        color: 'var(--color-brand-navy)',
                        marginBottom: '0.4rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {pillar.title}
                    </h3>

                    <div
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: '700',
                        color: 'var(--color-brand-navy)',
                        marginBottom: '0.9rem',
                      }}
                    >
                      {pillar.subtitle}
                    </div>

                    <p
                      style={{
                        fontSize: '0.95rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.6,
                        marginBottom: '1.25rem',
                      }}
                    >
                      {pillar.description}
                    </p>

                    {/* Checkpoints */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {pillar.points.map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.55rem',
                            fontSize: '0.88rem',
                            color: 'var(--color-brand-near-black)',
                            lineHeight: 1.45,
                          }}
                        >
                          <CheckCircle2
                            size={16}
                            style={{
                              color: 'var(--color-brand-yellow)',
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>

      <style>{`
        .jv-split-container {
          display: grid;
          grid-template-columns: 440px 1fr;
          gap: 4rem;
          align-items: flex-start;
        }

        .jv-sticky-column {
          position: sticky;
          top: 100px;
        }

        @media (max-width: 1024px) {
          .jv-split-container {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .jv-sticky-column {
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </section>
  );
}
