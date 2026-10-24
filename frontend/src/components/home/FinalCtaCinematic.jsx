import React, { useEffect, useRef } from 'react';
import { Phone, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Container from '../common/Container';
import PrimaryButton from '../common/PrimaryButton';
import { CONTACT } from '../../config/contact';

gsap.registerPlugin(ScrollTrigger);

const CTA_BACKGROUND =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2560&q=85';

export default function FinalCtaCinematic({ onOpenEnquiry }) {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(contentRef.current, { opacity: 1, y: 0 });
        return;
      }

      // Parallax background scrub
      gsap.fromTo(
        bgRef.current,
        { yPercent: -10, scale: 1.08 },
        {
          yPercent: 10,
          scale: 1.0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );

      // Elegant content reveal
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contentRef.current,
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
      style={{
        position: 'relative',
        minHeight: '680px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'var(--color-brand-navy)',
        color: '#FFFFFF',
        padding: 'clamp(5rem, 8vw, 7.5rem) 0',
      }}
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
          ref={bgRef}
          src={CTA_BACKGROUND}
          alt="Dgate Homes Luxury Living"
          loading="lazy"
          style={{
            width: '100%',
            height: '130%',
            objectFit: 'cover',
            filter: 'brightness(0.32) contrast(1.15)',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Luxury Radial Vignette & Brand Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, rgba(23, 16, 82, 0.45) 0%, rgba(23, 16, 82, 0.9) 75%, #0B0D12 100%)',
          zIndex: 1,
        }}
      />

      {/* Content Container */}
      <Container style={{ position: 'relative', zIndex: 2 }}>
        <div
          ref={contentRef}
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            textAlign: 'center',
            willChange: 'transform, opacity',
          }}
        >
          {/* Subtle VIP Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(249, 179, 24, 0.18)',
              border: '1px solid rgba(249, 179, 24, 0.4)',
              color: 'var(--color-brand-yellow)',
              padding: '0.4rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1.75rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Sparkles size={14} />
            Private Client Advisory
          </div>

          {/* Minimal Display Headline */}
          <h2
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
              fontWeight: '800',
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: '0 0 1.25rem 0',
            }}
          >
            Your Next Prime Address <br />
            <span style={{ color: 'var(--color-brand-yellow)' }}>Begins Here.</span>
          </h2>

          {/* Minimal Elegant Copy */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.6vw, 1.22rem)',
              color: '#EDECE6',
              lineHeight: 1.65,
              maxWidth: '640px',
              margin: '0 auto 2.5rem',
            }}
          >
            Connect with our senior property specialists for confidential access to
            exclusive off-market listings, pre-launch allocations, and private site visits.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              gap: '1.25rem',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: '2rem',
            }}
          >
            <PrimaryButton
              variant="accent"
              size="lg"
              onClick={() => onOpenEnquiry && onOpenEnquiry(null)}
              icon={MessageSquare}
              iconPosition="left"
            >
              Schedule Private Consultation
            </PrimaryButton>

            <a
              href={CONTACT.primaryPhoneHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.9rem 1.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid rgba(221, 217, 207, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#FFFFFF',
                fontWeight: '600',
                fontSize: '0.98rem',
                backdropFilter: 'blur(8px)',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-brand-yellow)';
                e.currentTarget.style.color = 'var(--color-brand-yellow)';
                e.currentTarget.style.backgroundColor = 'rgba(249, 179, 24, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(221, 217, 207, 0.4)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <Phone size={18} />
              <span>Call Direct: {CONTACT.primaryPhoneDisplay}</span>
            </a>
          </div>

          {/* Trust Footnote */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-brand-yellow)',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            <ShieldCheck size={16} />
            <span>100% Legal Verification • Zero Brokerage on Builder Units • Private Discretion</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
