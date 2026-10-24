import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Eye,
  Users,
  Target,
  CheckCircle2,
  Compass,
  Home,
  Layers,
  Building2,
  TrendingUp,
  Handshake,
  ArrowRight,
  MapPin,
  UserCheck,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Container from '../components/common/Container';
import PrimaryButton from '../components/common/PrimaryButton';
import EnquiryModal from '../components/common/EnquiryModal';
import { CONTACT } from '../config/contact';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

gsap.registerPlugin(ScrollTrigger);

// High-resolution architectural photography for hero section
const ABOUT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2560&q=85';

export default function AboutUsPage({ enquiryModalOpen, setEnquiryModalOpen }) {
  const navigate = useNavigate();

  // Initialize Lenis smooth scroll synced with GSAP
  useSmoothScroll(true);

  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Section & Animation Refs
  const heroRef = useRef(null);
  const heroBgRef = useRef(null);
  const heroContentRef = useRef(null);
  const whoWeAreRef = useRef(null);
  const whatWeDoRef = useRef(null);
  const approachRef = useRef(null);
  const visionMissionRef = useRef(null);
  const whyChooseRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      // 1. Subtle parallax on Hero Background Image
      if (heroBgRef.current && heroRef.current) {
        gsap.to(heroBgRef.current, {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // 2. Hero Content Entrance
      if (heroContentRef.current) {
        gsap.fromTo(
          heroContentRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out',
            delay: 0.1,
          }
        );
      }

      // 3. Who We Are Section Fade-Up
      if (whoWeAreRef.current) {
        gsap.fromTo(
          whoWeAreRef.current.querySelectorAll('.reveal-on-scroll'),
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.18,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: whoWeAreRef.current,
              start: 'top 82%',
            },
          }
        );
      }

      // 4. What We Do - Staggered Cards Reveal
      if (whatWeDoRef.current) {
        gsap.fromTo(
          whatWeDoRef.current.querySelectorAll('.service-card'),
          { opacity: 0, y: 35, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: whatWeDoRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // 5. Our Approach - Staggered Cards Reveal
      if (approachRef.current) {
        gsap.fromTo(
          approachRef.current.querySelectorAll('.approach-step-card'),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: approachRef.current,
              start: 'top 82%',
            },
          }
        );
      }

      // 6. Vision / Mission Split Reveal
      if (visionMissionRef.current) {
        gsap.fromTo(
          visionMissionRef.current.querySelectorAll('.vision-mission-card'),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: visionMissionRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // 7. Why Choose Us Reveal
      if (whyChooseRef.current) {
        gsap.fromTo(
          whyChooseRef.current.querySelectorAll('.why-choose-card'),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: whyChooseRef.current,
              start: 'top 82%',
            },
          }
        );
      }

      // 8. CTA Reveal
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current.querySelectorAll('.cta-reveal'),
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleOpenEnquiry = () => {
    if (setEnquiryModalOpen) setEnquiryModalOpen(true);
  };

  const handleCloseEnquiry = () => {
    if (setEnquiryModalOpen) setEnquiryModalOpen(false);
  };

  return (
    <div className="about-us-page" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* =========================================================================
          SECTION 1: HERO
          Large heading, short supporting line, cinematic background, subtle parallax
         ========================================================================= */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '480px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: '#0c0a27',
          color: '#FFFFFF',
          padding: '6rem 0 5rem',
        }}
      >
        {/* Cinematic Background Image with Subtle Parallax */}
        <div
          style={{
            position: 'absolute',
            inset: '-15% 0 -15% 0',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <img
            ref={heroBgRef}
            src={ABOUT_HERO_IMAGE}
            alt="Dgate Homes Architectural Luxury"
            style={{
              width: '100%',
              height: '130%',
              objectFit: 'cover',
              objectPosition: 'center 45%',
              filter: 'brightness(0.65) contrast(1.08)',
              transform: 'scale(1.05)',
              willChange: 'transform',
            }}
          />
        </div>

        {/* Ambient Dark Gradient Vignette Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(23, 16, 82, 0.78) 0%, rgba(18, 12, 65, 0.9) 70%, rgba(23, 16, 82, 0.98) 100%)',
            zIndex: 1,
          }}
        />

        {/* Hero Content Container */}
        <Container style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div ref={heroContentRef} style={{ maxWidth: '820px', margin: '0 auto' }}>
            {/* Breadcrumb Navigation */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.84rem',
                color: '#DDD9CF',
                marginBottom: '1rem',
              }}
            >
              <Link
                to="/"
                style={{
                  color: '#DDD9CF',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#DDD9CF')}
              >
                Home
              </Link>
              <ChevronRight size={13} style={{ color: 'var(--color-brand-yellow)' }} />
              <span style={{ color: 'var(--color-brand-yellow)', fontWeight: '600' }}>
                About Us
              </span>
            </div>

            {/* Pill Badge */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(249, 179, 24, 0.15)',
                  border: '1px solid rgba(249, 179, 24, 0.4)',
                  color: 'var(--color-brand-yellow)',
                  padding: '0.4rem 1.1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                }}
              >
                <Sparkles size={14} style={{ color: 'var(--color-brand-yellow)' }} />
                <span>Advisory &amp; Property Solutions</span>
              </div>
            </div>

            {/* Large Heading */}
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: '800',
                color: '#FFFFFF',
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                marginBottom: '1.25rem',
              }}
            >
              About Dgate Homes
            </h1>

            {/* Supporting Line */}
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.22rem)',
                color: '#EDECE6',
                lineHeight: 1.65,
                maxWidth: '720px',
                margin: '0 auto',
                fontWeight: '400',
              }}
            >
              A real-estate advisory and property solutions company connecting clients with verified
              residential, commercial, land, and strategic investment opportunities.
            </p>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 2: WHO WE ARE
          Content direction: real-estate advisory, market knowledge, transparent guidance,
          verified listings, personalized assistance. No unsupported claims.
         ========================================================================= */}
      <section
        ref={whoWeAreRef}
        style={{
          padding: '5.5rem 0',
          backgroundColor: 'var(--color-brand-beige)',
        }}
      >
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left: Narrative Content */}
            <div className="reveal-on-scroll">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'var(--color-brand-yellow-light)',
                  border: '1px solid var(--color-brand-yellow-border)',
                  color: 'var(--color-brand-yellow-text)',
                  padding: '0.35rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-brand-yellow)',
                  }}
                />
                Who We Are
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                  color: 'var(--color-black-heading)',
                  fontWeight: '800',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  marginBottom: '1.5rem',
                }}
              >
                Simplifying Property Discovery Through Transparency &amp; Integrity
              </h2>

              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.75,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '1.25rem',
                }}
              >
                Dgate Homes is a real-estate advisory and property solutions company focused on
                helping customers discover verified residential, commercial, land, and investment
                opportunities.
              </p>

              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.75,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '1.75rem',
                }}
              >
                We aim to simplify property discovery by combining market knowledge, transparent
                guidance, verified listings, and personalized assistance. We believe property
                transactions should be grounded in authentic facts, clear documentation, and direct
                communication—free from speculation and misleading claims.
              </p>

              {/* Highlight Quote Box */}
              <div
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderLeft: '4px solid var(--color-brand-yellow)',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <p
                  style={{
                    fontSize: '0.96rem',
                    fontStyle: 'italic',
                    color: 'var(--color-brand-navy)',
                    lineHeight: 1.6,
                    fontWeight: '600',
                    margin: 0,
                  }}
                >
                  &ldquo;Our purpose is to eliminate uncertainty in property discovery and deliver
                  peace of mind through authentic advice, rigorous title verification, and
                  customer-first consultation.&rdquo;
                </p>
              </div>
            </div>

            {/* Right: Key Philosophy Highlights */}
            <div
              className="reveal-on-scroll"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {[
                {
                  icon: ShieldCheck,
                  title: 'Thorough Pre-Vetting',
                  description:
                    'Every listing undergoes preliminary due diligence covering title clarity, government approvals, and legal sanity.',
                },
                {
                  icon: Eye,
                  title: 'Transparent Guidance',
                  description:
                    'Direct developer pricing, unvarnished property assessments, and transparent advice with zero hidden markups.',
                },
                {
                  icon: Users,
                  title: 'Personalized Consultation',
                  description:
                    'Dedicated property advisors who listen carefully and tailor solutions to your specific lifestyle or financial parameters.',
                },
                {
                  icon: Compass,
                  title: 'Deep Market Knowledge',
                  description:
                    'Practical understanding of locality growth dynamics, infrastructure corridors, and realistic pricing across Bangalore.',
                },
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: 'var(--color-white)',
                      border: '1px solid var(--color-brand-beige-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1.25rem',
                      boxShadow: '0 2px 8px rgba(23, 16, 82, 0.04)',
                      transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = 'var(--color-brand-yellow)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'var(--color-brand-beige-border)';
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-brand-navy)',
                        color: 'var(--color-brand-yellow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={22} />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: '700',
                          color: 'var(--color-black-heading)',
                          marginBottom: '0.35rem',
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.92rem',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.55,
                          margin: 0,
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 3: WHAT WE DO
          Cards/blocks for:
          - Residential Properties
          - Plots & Lands
          - Commercial Properties
          - Investment Properties
          - JV Land Opportunities
          - Project Advisory
         ========================================================================= */}
      <section
        ref={whatWeDoRef}
        style={{
          padding: '5.5rem 0',
          backgroundColor: 'var(--color-white)',
        }}
      >
        <Container>
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'var(--color-brand-yellow-light)',
                border: '1px solid var(--color-brand-yellow-border)',
                color: 'var(--color-brand-yellow-text)',
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-brand-yellow)',
                }}
              />
              Our Scope
            </div>

            <h2
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                color: 'var(--color-black-heading)',
                fontWeight: '800',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
              }}
            >
              What We Do
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
              }}
            >
              Comprehensive real estate solutions designed to assist homebuyers, commercial
              ventures, landowners, and long-term investors.
            </p>
          </div>

          {/* 6 Service Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {[
              {
                icon: Home,
                title: 'Residential Properties',
                tag: 'Living Spaces',
                description:
                  'Curated discovery of luxury apartments, gated community villas, penthouses, and bespoke independent houses in prime urban neighborhoods.',
                points: ['Gated Villas & Enclaves', 'Premium 2, 3 & 4 BHK Apartments', 'Individual Residences'],
                link: '/properties?listing_type=sale',
              },
              {
                icon: Layers,
                title: 'Plots & Lands',
                tag: 'Freehold Parcels',
                description:
                  'BDA, BMRDA, and authority-approved residential plots and strategic land parcels with clear titles and registration readiness.',
                points: ['Approved Freehold Plots', 'Gated Plotted Layouts', 'Strategic Land Parcels'],
                link: '/properties?listing_type=sale',
              },
              {
                icon: Building2,
                title: 'Commercial Properties',
                tag: 'Commercial Assets',
                description:
                  'Grade-A corporate office suites, retail storefronts, and commercial buildings positioned along high-growth business corridors.',
                points: ['Corporate Office Spaces', 'High-Street Retail Stores', 'Commercial Land Sites'],
                link: '/properties?listing_type=sale',
              },
              {
                icon: TrendingUp,
                title: 'Investment Properties',
                tag: 'Yield & Growth',
                description:
                  'High-yield real estate assets, pre-leased properties with stable rental returns, and early-stage capital appreciation opportunities.',
                points: ['Pre-Leased Corporate Assets', 'High Rental Yield Opportunities', 'Strategic Capital Growth'],
                link: '/properties?listing_type=sale',
              },
              {
                icon: Handshake,
                title: 'JV Land Opportunities',
                tag: 'Joint Ventures',
                description:
                  'Structuring strategic joint venture (JV) and joint development (JD) partnerships between prime land owners and reputable developers.',
                points: ['Land Monetization Structuring', 'Tier-1 Developer Matchmaking', 'Transparent Sharing Agreements'],
                link: '/#locations',
              },
              {
                icon: Compass,
                title: 'Project Advisory',
                tag: 'Consultation',
                description:
                  'Comprehensive advisory encompassing market feasibility, legal title verification oversight, pricing analysis, and closing support.',
                points: ['45-Point Legal Due Diligence', 'Authentic Market Valuations', 'End-to-End Registration'],
                link: '/properties?listing_type=sale',
              },
            ].map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div
                  key={idx}
                  className="service-card"
                  style={{
                    backgroundColor: 'var(--color-brand-beige-subtle)',
                    border: '1.5px solid var(--color-brand-beige-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem 1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 6px rgba(23, 16, 82, 0.03)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = 'var(--color-brand-yellow)';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(23, 16, 82, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--color-brand-beige-border)';
                    e.currentTarget.style.backgroundColor = 'var(--color-brand-beige-subtle)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(23, 16, 82, 0.03)';
                  }}
                >
                  <div>
                    {/* Header Row: Icon and Tag */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-brand-navy)',
                          color: 'var(--color-brand-yellow)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComp size={24} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'var(--color-brand-navy)',
                          backgroundColor: 'rgba(23, 16, 82, 0.06)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {card.tag}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: 'var(--color-black-heading)',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {card.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.94rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                        marginBottom: '1.25rem',
                      }}
                    >
                      {card.description}
                    </p>

                    {/* Bullet Points */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                        marginBottom: '1.5rem',
                        borderTop: '1px solid rgba(221, 217, 207, 0.6)',
                        paddingTop: '1rem',
                      }}
                    >
                      {card.points.map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.84rem',
                            color: 'var(--color-brand-navy)',
                            fontWeight: '500',
                          }}
                        >
                          <CheckCircle2 size={14} style={{ color: 'var(--color-brand-yellow)', flexShrink: 0 }} />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Link */}
                  <Link
                    to={card.link}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      color: 'var(--color-brand-navy)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-brand-navy)')}
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 4: OUR APPROACH
          Highlight:
          - Verified Properties
          - Transparent Guidance
          - Personalized Consultation
          - Market-Focused Property Selection
          - End-to-End Assistance
         ========================================================================= */}
      <section
        ref={approachRef}
        style={{
          padding: '5.5rem 0',
          backgroundColor: 'var(--color-brand-beige)',
        }}
      >
        <Container>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'var(--color-brand-yellow-light)',
                border: '1px solid var(--color-brand-yellow-border)',
                color: 'var(--color-brand-yellow-text)',
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-brand-yellow)',
                }}
              />
              Client-First Advisory
            </div>

            <h2
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                color: 'var(--color-black-heading)',
                fontWeight: '800',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
              }}
            >
              Our Approach
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
              }}
            >
              A disciplined, customer-centric methodology built on transparency, thorough
              verification, and tailored guidance.
            </p>
          </div>

          {/* 5 Approach Steps */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                step: '01',
                icon: ShieldCheck,
                title: 'Verified Properties',
                description:
                  'Every property undergoes thorough legal and title verification, confirming clean ownership, sanctioned plans, and statutory approvals.',
              },
              {
                step: '02',
                icon: Eye,
                title: 'Transparent Guidance',
                description:
                  'Clear pricing, honest appraisals, and upfront details with zero hidden fees, inflated valuations, or ambiguous contract terms.',
              },
              {
                step: '03',
                icon: Users,
                title: 'Personalized Consultation',
                description:
                  'We take time to understand your lifestyle, financial plan, and spatial requirements before curating targeted recommendations.',
              },
              {
                step: '04',
                icon: Target,
                title: 'Market-Focused Selection',
                description:
                  'Data-driven evaluation of prime micro-markets, upcoming infrastructure velocity, and sustainable appreciation fundamentals.',
              },
              {
                step: '05',
                icon: CheckCircle2,
                title: 'End-to-End Assistance',
                description:
                  'Complete concierge support from private site tours and legal checks to loan syndication, documentation, and deed registration.',
              },
            ].map((item, idx) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="approach-step-card"
                  style={{
                    backgroundColor: 'var(--color-white)',
                    border: '1px solid var(--color-brand-beige-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(23, 16, 82, 0.04)',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--color-brand-yellow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--color-brand-beige-border)';
                  }}
                >
                  {/* Step Number Tag */}
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      letterSpacing: '0.08em',
                      color: 'var(--color-brand-yellow)',
                      marginBottom: '1rem',
                    }}
                  >
                    STEP {item.step}
                  </div>

                  {/* Icon */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-brand-navy)',
                      color: 'var(--color-brand-yellow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <StepIcon size={22} />
                  </div>

                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: 'var(--color-black-heading)',
                      marginBottom: '0.6rem',
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 5: VISION / MISSION
          Clean split layout.
          Vision:
          To make property discovery and investment decisions more transparent, informed, and accessible.
          Mission:
          To connect customers with suitable real-estate opportunities through verified information,
          professional guidance, and a customer-first approach.
         ========================================================================= */}
      <section
        ref={visionMissionRef}
        style={{
          padding: '5.5rem 0',
          backgroundColor: 'var(--color-brand-navy)',
          color: '#FFFFFF',
        }}
      >
        <Container>
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(249, 179, 24, 0.15)',
                border: '1px solid rgba(249, 179, 24, 0.4)',
                color: 'var(--color-brand-yellow)',
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={13} style={{ color: 'var(--color-brand-yellow)' }} />
              Purpose &amp; Direction
            </div>

            <h2
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                color: '#FFFFFF',
                fontWeight: '800',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
              }}
            >
              Our Vision &amp; Mission
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                color: '#EDECE6',
                lineHeight: 1.65,
              }}
            >
              The foundational commitments that steer our advisory practices and shape how we
              serve our clients every day.
            </p>
          </div>

          {/* Clean Split Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
            }}
          >
            {/* Vision Card */}
            <div
              className="vision-mission-card"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1.5px solid rgba(249, 179, 24, 0.35)',
                borderRadius: 'var(--radius-xl)',
                padding: ' clamp(2rem, 4vw, 3rem)',
                position: 'relative',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(249, 179, 24, 0.15)',
                      border: '1px solid var(--color-brand-yellow)',
                      color: 'var(--color-brand-yellow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Compass size={28} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        letterSpacing: '0.1em',
                        color: 'var(--color-brand-yellow)',
                        textTransform: 'uppercase',
                        display: 'block',
                      }}
                    >
                      Future Outlook
                    </span>
                    <h3
                      style={{
                        fontSize: '1.65rem',
                        fontWeight: '800',
                        color: '#FFFFFF',
                        margin: 0,
                      }}
                    >
                      Our Vision
                    </h3>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    lineHeight: 1.55,
                    marginBottom: '1.25rem',
                  }}
                >
                  &ldquo;To make property discovery and investment decisions more transparent,
                  informed, and accessible.&rdquo;
                </p>

                <p
                  style={{
                    fontSize: '0.96rem',
                    color: '#DDD9CF',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  We envision a real estate environment where buyers, investors, and landowners have
                  transparent access to verified opportunities, empowering them to make confident
                  property decisions without uncertainty.
                </p>
              </div>

              <div
                style={{
                  marginTop: '2rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(221, 217, 207, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--color-brand-yellow)',
                  fontWeight: '600',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Empowering Clients with Authentic Clarity</span>
              </div>
            </div>

            {/* Mission Card */}
            <div
              className="vision-mission-card"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1.5px solid rgba(221, 217, 207, 0.25)',
                borderRadius: 'var(--radius-xl)',
                padding: ' clamp(2rem, 4vw, 3rem)',
                position: 'relative',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(221, 217, 207, 0.35)',
                      color: 'var(--color-brand-yellow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Target size={28} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        letterSpacing: '0.1em',
                        color: '#DDD9CF',
                        textTransform: 'uppercase',
                        display: 'block',
                      }}
                    >
                      Our Daily Purpose
                    </span>
                    <h3
                      style={{
                        fontSize: '1.65rem',
                        fontWeight: '800',
                        color: '#FFFFFF',
                        margin: 0,
                      }}
                    >
                      Our Mission
                    </h3>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    lineHeight: 1.55,
                    marginBottom: '1.25rem',
                  }}
                >
                  &ldquo;To connect customers with suitable real-estate opportunities through
                  verified information, professional guidance, and a customer-first approach.&rdquo;
                </p>

                <p
                  style={{
                    fontSize: '0.96rem',
                    color: '#DDD9CF',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Our mission is to serve as your dependable real-estate advisory, bridging the gap
                  between ambition and ownership with uncompromised integrity, rigorous verification,
                  and personalized service.
                </p>
              </div>

              <div
                style={{
                  marginTop: '2rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(221, 217, 207, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--color-brand-yellow)',
                  fontWeight: '600',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Customer-Centric Professional Guidance</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 6: WHY CHOOSE DGATE HOMES
          Concise points:
          - Verified opportunities
          - Local market understanding
          - Dedicated assistance
          - Residential to investment-focused options
         ========================================================================= */}
      <section
        ref={whyChooseRef}
        style={{
          padding: '5.5rem 0',
          backgroundColor: 'var(--color-brand-beige)',
        }}
      >
        <Container>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'var(--color-brand-yellow-light)',
                border: '1px solid var(--color-brand-yellow-border)',
                color: 'var(--color-brand-yellow-text)',
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-brand-yellow)',
                }}
              />
              The Dgate Distinction
            </div>

            <h2
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                color: 'var(--color-black-heading)',
                fontWeight: '800',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
              }}
            >
              Why Choose Dgate Homes
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
              }}
            >
              Four defining principles that make Dgate Homes your trusted partner in Bangalore real
              estate.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {[
              {
                icon: ShieldCheck,
                title: 'Verified Opportunities',
                description:
                  'Every property presented is vetted for clear legal ownership, sanctioned master plans, and regulatory compliance, minimizing transaction risk.',
              },
              {
                icon: MapPin,
                title: 'Local Market Understanding',
                description:
                  'Practical insight into Bangalore’s prime micro-markets, upcoming metro lines, arterial corridors, and authentic property valuations.',
              },
              {
                icon: UserCheck,
                title: 'Dedicated Assistance',
                description:
                  'Direct, one-on-one advisory support throughout your entire journey—from initial property discovery to final deed registration.',
              },
              {
                icon: Building2,
                title: 'Residential to Investment Options',
                description:
                  'A versatile portfolio addressing dream family homes, luxury villas, strategic land parcels, and high-yield commercial assets.',
              },
            ].map((card, idx) => {
              const CardIcon = card.icon;
              return (
                <div
                  key={idx}
                  className="why-choose-card"
                  style={{
                    backgroundColor: 'var(--color-white)',
                    border: '1px solid var(--color-brand-beige-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2.25rem 1.75rem',
                    boxShadow: '0 2px 8px rgba(23, 16, 82, 0.04)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--color-brand-yellow)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(23, 16, 82, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--color-brand-beige-border)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(23, 16, 82, 0.04)';
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-brand-navy)',
                      color: 'var(--color-brand-yellow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <CardIcon size={24} />
                  </div>

                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: 'var(--color-black-heading)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {card.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.94rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 7: CTA
          Heading: Find the Right Property with Dgate Homes
          Buttons: Explore Properties | Enquire Now
         ========================================================================= */}
      <section
        ref={ctaRef}
        style={{
          padding: '5.5rem 0',
          backgroundColor: 'var(--color-brand-navy)',
          color: '#FFFFFF',
          borderTop: '2px solid rgba(249, 179, 24, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Ambient Radial Highlight */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(249, 179, 24, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>
            <div className="cta-reveal">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'rgba(249, 179, 24, 0.15)',
                  border: '1px solid rgba(249, 179, 24, 0.4)',
                  color: 'var(--color-brand-yellow)',
                  padding: '0.35rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                }}
              >
                <Sparkles size={13} style={{ color: 'var(--color-brand-yellow)' }} />
                Begin Your Property Search
              </div>
            </div>

            <h2
              className="cta-reveal"
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.25rem)',
                fontWeight: '800',
                color: '#FFFFFF',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '1.25rem',
              }}
            >
              Find the Right Property with Dgate Homes
            </h2>

            <p
              className="cta-reveal"
              style={{
                fontSize: '1.1rem',
                color: '#EDECE6',
                lineHeight: 1.65,
                marginBottom: '2.5rem',
                maxWidth: '650px',
                margin: '0 auto 2.5rem',
              }}
            >
              Connect with our dedicated advisory team today for curated listings, private site
              consultations, and transparent real estate guidance.
            </p>

            {/* CTA Buttons */}
            <div
              className="cta-reveal"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
                marginBottom: '3rem',
              }}
            >
              <PrimaryButton
                variant="accent"
                size="lg"
                onClick={() => navigate('/properties?listing_type=sale')}
                icon={ArrowRight}
                iconPosition="right"
                style={{ fontWeight: '700', padding: '0.9rem 2rem' }}
              >
                Explore Properties
              </PrimaryButton>

              <PrimaryButton
                variant="secondary"
                size="lg"
                onClick={handleOpenEnquiry}
                icon={Phone}
                iconPosition="left"
                style={{
                  fontWeight: '700',
                  padding: '0.9rem 2rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(221, 217, 207, 0.4)',
                  color: '#FFFFFF',
                }}
              >
                Enquire Now
              </PrimaryButton>
            </div>

            {/* Direct Contact Links */}
            <div
              className="cta-reveal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(221, 217, 207, 0.15)',
                fontSize: '0.92rem',
                color: '#DDD9CF',
              }}
            >
              <a
                href={CONTACT.primaryPhoneHref}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              >
                <Phone size={15} style={{ color: 'var(--color-brand-yellow)' }} />
                <span>Call Direct: {CONTACT.primaryPhoneDisplay}</span>
              </a>

              <a
                href={CONTACT.emailHref}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#EDECE6',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#EDECE6')}
              >
                <Mail size={15} style={{ color: 'var(--color-brand-yellow)' }} />
                <span>{CONTACT.email}</span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Global Interactive Lead / Property Enquiry Modal */}
      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={handleCloseEnquiry}
        property={null}
      />
    </div>
  );
}
