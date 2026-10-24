import React, { useEffect, useRef } from 'react';
import { ShieldCheck, Scale, Compass, Award, CheckCircle2 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Container from '../common/Container';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  {
    target: 1850,
    prefix: '₹',
    suffix: '+ Cr',
    label: 'Portfolio Value Advised',
    subtext: 'Across luxury residential & commercial land',
  },
  {
    target: 100,
    prefix: '',
    suffix: '%',
    label: 'Legal & Title Clearance',
    subtext: 'RERA sanctioned, clean encumbrance certificates',
  },
  {
    target: 45,
    prefix: '',
    suffix: '-Point',
    label: 'Due Diligence Audit',
    subtext: 'Rigorous vetting by senior revenue advocates',
  },
  {
    target: 12,
    prefix: '',
    suffix: '+ Yrs',
    label: 'Bangalore Leadership',
    subtext: 'Trusted advisory across prime micro-markets',
  },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Institutional Title Audit',
    description:
      'Every listing undergoes our 45-point legal and technical audit. Title clearance, land approvals, BDA/BMRDA compliance, and environmental clearances are pre-verified before showcasing.',
    highlight: 'Zero Compromise Legal Safety',
  },
  {
    icon: Scale,
    title: 'Direct Developer Pricing',
    description:
      'Gain exclusive pre-launch allocations and institutional developer terms. Completely transparent pricing structures with zero hidden markups, brokerage surcharges, or inflated figures.',
    highlight: 'Direct Builder Inventory',
  },
  {
    icon: Compass,
    title: 'End-to-End Concierge Advisory',
    description:
      'Dedicated property specialists manage the full journey: private chauffeur-driven site tours, confidential negotiation, home loan syndication, and final registrar office deed execution.',
    highlight: 'White-Glove VIP Experience',
  },
  {
    icon: Award,
    title: 'Handpicked Prime Residences',
    description:
      'We curate only high-spec villas, penthouses, and gated enclaves from reputable tier-1 developers with proven records of architectural excellence and timely milestone delivery.',
    highlight: 'Top 5% Grade-A Portfolio',
  },
];

export default function WhyDgateCinematic() {
  const sectionRef = useRef(null);
  const headlineLine1Ref = useRef(null);
  const headlineLine2Ref = useRef(null);
  const subtextRef = useRef(null);
  const statsRef = useRef(null);
  const statNumbersRef = useRef([]);
  const cardsRef = useRef([]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(
          [
            headlineLine1Ref.current,
            headlineLine2Ref.current,
            subtextRef.current,
            ...cardsRef.current.filter(Boolean),
          ],
          { opacity: 1, y: 0 }
        );
        // Set final numbers directly
        statNumbersRef.current.forEach((el, idx) => {
          if (el && STATS[idx]) {
            el.innerText = `${STATS[idx].prefix}${STATS[idx].target.toLocaleString()}${STATS[idx].suffix}`;
          }
        });
        return;
      }

      // 1. Text Reveal Line-by-Line
      const textTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      });

      textTl
        .fromTo(
          [headlineLine1Ref.current, headlineLine2Ref.current],
          { y: 55, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.18,
            ease: 'power3.out',
          }
        )
        .fromTo(
          subtextRef.current,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
          },
          '-=0.6'
        );

      // 2. Animated Numerical Counters
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          STATS.forEach((stat, index) => {
            const el = statNumbersRef.current[index];
            if (!el) return;

            const counterObj = { val: 0 };
            gsap.to(counterObj, {
              val: stat.target,
              duration: 2.2,
              ease: 'power2.out',
              onUpdate: () => {
                const currentVal = Math.round(counterObj.val);
                el.innerText = `${stat.prefix}${currentVal.toLocaleString()}${stat.suffix}`;
              },
            });
          });
        },
      });

      // 3. Staggered reveal for the 4 Pillar cards
      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.16,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current[0],
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-dgate"
      style={{
        position: 'relative',
        backgroundColor: 'var(--color-brand-navy)', // Deep Navy brand color
        color: '#FFFFFF',
        padding: 'clamp(5rem, 8vw, 8rem) 0',
        overflow: 'hidden',
        borderTop: '1px solid rgba(221, 217, 207, 0.12)',
        borderBottom: '1px solid rgba(221, 217, 207, 0.12)',
      }}
    >
      {/* Subtle ambient luxury light accent */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 179, 24, 0.08) 0%, rgba(23, 16, 82, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 179, 24, 0.05) 0%, rgba(23, 16, 82, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container>
        {/* Editorial Section Header */}
        <div style={{ maxWidth: '840px', margin: '0 auto 4.5rem', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(249, 179, 24, 0.14)',
              border: '1px solid rgba(249, 179, 24, 0.35)',
              color: 'var(--color-brand-yellow)',
              padding: '0.4rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: '700',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            The Dgate Distinction
          </div>

          {/* Masked Line-by-Line Headline */}
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
              fontWeight: '800',
              lineHeight: 1.18,
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
              margin: '0 0 1.25rem 0',
            }}
          >
            <div style={{ overflow: 'hidden' }}>
              <div ref={headlineLine1Ref} style={{ willChange: 'transform, opacity' }}>
                The Standard of Absolute Discretion
              </div>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                ref={headlineLine2Ref}
                style={{
                  color: 'var(--color-brand-yellow)',
                  willChange: 'transform, opacity',
                }}
              >
                & Architectural Excellence
              </div>
            </div>
          </h2>

          <p
            ref={subtextRef}
            style={{
              fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
              color: '#EDECE6',
              lineHeight: 1.65,
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            Reimagining the luxury real estate experience with institutional-grade due diligence,
            direct developer relationships, and bespoke concierge advisory.
          </p>
        </div>

        {/* Animated Numerical Metrics Bar */}
        <div
          ref={statsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            padding: '2.5rem 2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(229, 222, 214, 0.12)',
            backdropFilter: 'blur(12px)',
            marginBottom: '4.5rem',
          }}
        >
          {STATS.map((stat, idx) => (
            <div
              key={stat.label}
              style={{
                textAlign: 'center',
                padding: '0.5rem 1rem',
                borderRight: idx < STATS.length - 1 ? '1px solid rgba(229, 222, 214, 0.08)' : 'none',
              }}
            >
              <div
                ref={(el) => (statNumbersRef.current[idx] = el)}
                style={{
                  fontSize: 'clamp(2.2rem, 3.6vw, 3.2rem)',
                  fontWeight: '800',
                  color: 'var(--color-brand-amber)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  marginBottom: '0.45rem',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {stat.prefix}0{stat.suffix}
              </div>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  marginBottom: '0.25rem',
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#9C928B',
                  lineHeight: 1.4,
                }}
              >
                {stat.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* 4 Pillars with Minimal Elegant Icons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                ref={(el) => (cardsRef.current[idx] = el)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.035)',
                  border: '1px solid rgba(229, 222, 214, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, background-color 0.4s ease',
                  willChange: 'transform, opacity',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = 'var(--color-brand-yellow)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(221, 217, 207, 0.15)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.035)';
                }}
              >
                {/* Minimal Icon Container */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(249, 179, 24, 0.14)',
                    color: 'var(--color-brand-yellow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.75rem',
                  }}
                >
                  <Icon size={26} strokeWidth={1.8} />
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: 'var(--color-brand-yellow)',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '0.75rem',
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>{pillar.highlight}</span>
                </div>

                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    marginBottom: '0.85rem',
                    lineHeight: 1.3,
                  }}
                >
                  {pillar.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.92rem',
                    color: '#A99F96',
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
