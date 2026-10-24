import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, ArrowRight } from 'lucide-react';
import Container from '../common/Container';
import PrimaryButton from '../common/PrimaryButton';
import DgateLogo from '../common/DgateLogo';
import { CONTACT } from '../../config/contact';
import { ENABLE_RENT_LISTINGS } from '../../config/listingModes';

export default function Navbar({ onOpenEnquiry }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Properties', href: '/properties', isRoute: true },
    { label: 'Buy', href: '/properties?listing_type=sale', isRoute: true },
    ...(ENABLE_RENT_LISTINGS ? [{ label: 'Rent', href: '/properties?listing_type=rent', isRoute: true }] : []),
    { label: 'Categories', href: '/#categories', isRoute: false },
    { label: 'Prime Locations', href: '/#locations', isRoute: false },
    { label: 'About Us', href: '/about-us', isRoute: true },
  ];

  return (
    <nav
      style={{
        backgroundColor: 'var(--color-brand-navy)',
        borderBottom: '1px solid rgba(221, 217, 207, 0.15)',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(23, 16, 82, 0.25)',
      }}
    >
      <Container>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '76px',
          }}
        >
          {/* Official Dgate Homes Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <DgateLogo variant="header" />
          </Link>

          {/* Desktop Navigation Links */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '2rem',
            }}
            className="desktop-nav-links"
          >
            {navLinks.map((link) => {
              const isActive =
                link.isRoute &&
                (link.href === '/about-us'
                  ? location.pathname === '/about-us'
                  : link.href === '/properties'
                  ? location.pathname === '/properties' && !location.search
                  : location.pathname + location.search === link.href);

              return link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  style={{
                    color: isActive ? 'var(--color-brand-yellow)' : '#EDECE6',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? '700' : '500',
                    transition: 'color var(--transition-fast)',
                    position: 'relative',
                    padding: '0.5rem 0',
                    textDecoration: 'none',
                    borderBottom: isActive ? '2px solid var(--color-brand-yellow)' : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'var(--color-brand-yellow)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#EDECE6';
                  }}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    color: '#EDECE6',
                    fontSize: '0.92rem',
                    fontWeight: '500',
                    transition: 'color var(--transition-fast)',
                    position: 'relative',
                    padding: '0.5rem 0',
                    textDecoration: 'none',
                    borderBottom: '2px solid transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#EDECE6')}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '1.25rem',
            }}
            className="desktop-nav-actions"
          >
            <a
              href={CONTACT.primaryPhoneHref}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--color-white)',
                fontSize: '0.88rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-white)')}
            >
              <Phone size={16} style={{ color: 'var(--color-brand-yellow)' }} />
              <span>{CONTACT.primaryPhoneDisplay}</span>
            </a>

            <PrimaryButton
              variant="accent"
              size="sm"
              onClick={onOpenEnquiry}
              style={{ fontWeight: '700' }}
            >
              Enquire Now
            </PrimaryButton>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              backgroundColor: 'var(--color-brand-navy-hover)',
              color: 'var(--color-white)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: 'var(--color-brand-navy-hover)',
              borderTop: '1px solid rgba(221, 217, 207, 0.15)',
              padding: '1.25rem 0.5rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {navLinks.map((link) => {
              const isActive =
                link.isRoute &&
                (link.href === '/about-us'
                  ? location.pathname === '/about-us'
                  : link.href === '/properties'
                  ? location.pathname === '/properties' && !location.search
                  : location.pathname + location.search === link.href);

              return link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: isActive ? 'var(--color-brand-yellow)' : 'var(--color-white)',
                    backgroundColor: isActive ? 'rgba(249, 179, 24, 0.1)' : 'transparent',
                    fontSize: '1rem',
                    fontWeight: isActive ? '700' : '600',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <span>{link.label}</span>
                  <ArrowRight size={16} style={{ color: 'var(--color-brand-yellow)' }} />
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <span>{link.label}</span>
                  <ArrowRight size={16} style={{ color: 'var(--color-brand-yellow)' }} />
                </a>
              );
            })}

            {/* Mobile Drawer Contact Info */}
            <div
              style={{
                marginTop: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(221, 217, 207, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#DDD9CF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: '600',
                  paddingLeft: '0.5rem',
                }}
              >
                Direct Inquiries
              </div>

              {/* Primary Phone */}
              <a
                href={CONTACT.primaryPhoneHref}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  color: 'var(--color-white)',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                }}
              >
                <Phone size={16} style={{ color: 'var(--color-brand-yellow)' }} />
                <span>{CONTACT.primaryPhoneDisplay}</span>
                <span style={{ fontSize: '0.72rem', color: '#DDD9CF', marginLeft: 'auto' }}>Primary</span>
              </a>

              {/* Secondary Phone */}
              <a
                href={CONTACT.secondaryPhoneHref}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  color: 'var(--color-white)',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                }}
              >
                <Phone size={16} style={{ color: 'var(--color-brand-yellow)' }} />
                <span>{CONTACT.secondaryPhoneDisplay}</span>
                <span style={{ fontSize: '0.72rem', color: '#DDD9CF', marginLeft: 'auto' }}>Secondary</span>
              </a>

              {/* Email */}
              <a
                href={CONTACT.emailHref}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  color: '#EDECE6',
                  fontSize: '0.88rem',
                  padding: '0.5rem 0.75rem',
                  textDecoration: 'none',
                }}
              >
                <Mail size={16} style={{ color: 'var(--color-brand-yellow)' }} />
                <span>{CONTACT.email}</span>
              </a>

              <PrimaryButton
                variant="accent"
                fullWidth
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenEnquiry) onOpenEnquiry();
                }}
                style={{ marginTop: '0.35rem', fontWeight: '700' }}
              >
                Enquire Now
              </PrimaryButton>
            </div>
          </div>
        )}
      </Container>

      {/* Responsive media query styling */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .desktop-nav-actions {
            display: flex !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
