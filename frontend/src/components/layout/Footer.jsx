import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import Container from '../common/Container';
import DgateLogo from '../common/DgateLogo';
import { CONTACT } from '../../config/contact';
import { ENABLE_RENT_LISTINGS } from '../../config/listingModes';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-brand-navy)',
        color: '#EDECE6',
        borderTop: '1px solid rgba(221, 217, 207, 0.15)',
        paddingTop: '4.5rem',
        paddingBottom: '2rem',
      }}
    >
      <Container>
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <DgateLogo onDark height={48} />
            </div>

            <p style={{ fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '1.5rem', color: '#c4c1e0' }}>
              Your trusted partner in premium residential and commercial properties. We connect buyers directly with verified luxury real estate across prime Indian localities.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#EDECE6' }}>
                <ShieldCheck size={16} style={{ color: 'var(--color-brand-yellow)' }} />
                RERA Compliant Advisory
              </span>
            </div>
          </div>

          {/* Quick Links & Shortcuts */}
          <div>
            <h4 style={{ color: 'var(--color-white)', fontSize: '1.05rem', fontWeight: '700', marginBottom: '1.25rem' }}>
              Explore Properties
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <Link
                  to="/properties?listing_type=sale"
                  style={{ color: '#e5e7eb', fontWeight: '600', transition: 'color var(--transition-fast)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#e5e7eb')}
                >
                  Properties for Sale
                </Link>
              </li>
              <li>
                <Link
                  to="/about-us"
                  style={{ color: '#e5e7eb', fontWeight: '600', transition: 'color var(--transition-fast)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#e5e7eb')}
                >
                  About Us
                </Link>
              </li>
              {ENABLE_RENT_LISTINGS && (
                <li>
                  <Link
                    to="/properties?listing_type=rent"
                    style={{ color: '#e5e7eb', fontWeight: '600', transition: 'color var(--transition-fast)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#e5e7eb')}
                  >
                    Properties for Rent
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/properties?property_type_id=2"
                  style={{ color: '#9ca3af', transition: 'color var(--transition-fast)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  Luxury Villas
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?property_type_id=1"
                  style={{ color: '#9ca3af', transition: 'color var(--transition-fast)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  Gated Community Apartments
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?property_type_id=5"
                  style={{ color: '#9ca3af', transition: 'color var(--transition-fast)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  Plotted Developments
                </Link>
              </li>
            </ul>
          </div>

          {/* Prime Locations */}
          <div>
            <h4 style={{ color: 'var(--color-white)', fontSize: '1.05rem', fontWeight: '700', marginBottom: '1.25rem' }}>
              Prime Localities
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              {['Whitefield, Bangalore', 'Indiranagar, Bangalore', 'Koramangala, Bangalore', 'Sarjapur Road, Bangalore', 'Hebbal & North Bangalore', 'HSR Layout, Bangalore'].map((loc) => (
                <li key={loc}>
                  <a
                    href="#locations"
                    style={{ color: '#9ca3af', transition: 'color var(--transition-fast)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    {loc}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: 'var(--color-white)', fontSize: '1.05rem', fontWeight: '700', marginBottom: '1.25rem' }}>
              Get In Touch
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={18} style={{ color: 'var(--color-brand-yellow)', flexShrink: 0, marginTop: '2px' }} />
                <span>{CONTACT.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Phone size={18} style={{ color: 'var(--color-brand-yellow)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <a
                    href={CONTACT.primaryPhoneHref}
                    style={{ color: '#e5e7eb', fontWeight: '600', transition: 'color var(--transition-fast)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#e5e7eb')}
                  >
                    {CONTACT.primaryPhoneDisplay} <span style={{ fontSize: '0.75rem', color: '#c4c1e0', fontWeight: '400' }}>(Primary)</span>
                  </a>
                  <a
                    href={CONTACT.secondaryPhoneHref}
                    style={{ color: '#e5e7eb', fontWeight: '600', transition: 'color var(--transition-fast)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#e5e7eb')}
                  >
                    {CONTACT.secondaryPhoneDisplay} <span style={{ fontSize: '0.75rem', color: '#c4c1e0', fontWeight: '400' }}>(Secondary)</span>
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={18} style={{ color: 'var(--color-brand-yellow)', flexShrink: 0 }} />
                <a
                  href={CONTACT.emailHref}
                  style={{ color: '#e5e7eb', transition: 'color var(--transition-fast)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#e5e7eb')}
                >
                  {CONTACT.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(221, 217, 207, 0.15)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: '#c4c1e0',
          }}
        >
          <div>
            &copy; {currentYear} Dgate Homes Private Limited. All rights reserved.
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link
              to="/about-us"
              style={{ color: '#c4c1e0', transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#c4c1e0')}
            >
              About Us
            </Link>
            <a href="#" style={{ color: '#c4c1e0' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#c4c1e0' }}>Terms of Service</a>
            <a href="#" style={{ color: '#c4c1e0' }}>RERA Disclaimer</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
