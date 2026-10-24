import React from 'react';
import { Phone, Sparkles, ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react';
import Container from '../common/Container';
import PrimaryButton from '../common/PrimaryButton';
import { CONTACT } from '../../config/contact';

export default function EnquiryCtaBanner({ onOpenEnquiry }) {
  return (
    <section style={{ padding: '5.5rem 0', backgroundColor: 'var(--color-bg-primary)' }}>
      <Container>
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-brand-navy)',
            color: 'var(--color-white)',
            padding: ' clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            border: '2px solid rgba(249, 179, 24, 0.35)',
          }}
        >
          {/* Subtle Background Radial Accent */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(249, 179, 24, 0.2) 0%, rgba(23, 16, 82, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'rgba(249, 179, 24, 0.18)',
                  color: 'var(--color-brand-yellow)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                <Sparkles size={14} />
                VIP Advisory Service
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                  fontWeight: '800',
                  lineHeight: 1.2,
                  color: 'var(--color-white)',
                  marginBottom: '1rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Can&apos;t Find Exactly What <br />
                You&apos;re Looking For?
              </h2>

              <p style={{ fontSize: '1.05rem', color: '#d1d5db', lineHeight: 1.6, maxWidth: '520px' }}>
                Let our senior property portfolio managers curate off-market luxury listings, upcoming project pre-allocations, and custom site tours for you.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                alignItems: 'flex-start',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e5e7eb', fontSize: '0.9rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--color-yellow-primary)' }} />
                <span>Zero Brokerage &bull; Verified Inventory &bull; Free Site Visits</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
                <PrimaryButton
                  variant="accent"
                  size="lg"
                  fullWidth
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
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.85rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid rgba(255, 255, 255, 0.25)',
                    color: 'var(--color-white)',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-brand-yellow)';
                    e.currentTarget.style.color = 'var(--color-brand-yellow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.color = 'var(--color-white)';
                  }}
                >
                  <Phone size={18} />
                  <span>Call Direct: {CONTACT.primaryPhoneDisplay}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
