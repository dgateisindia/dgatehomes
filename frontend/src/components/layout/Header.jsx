import React from 'react';
import { Mail, Phone, Clock, ShieldCheck } from 'lucide-react';
import Container from '../common/Container';
import Navbar from './Navbar';
import { CONTACT } from '../../config/contact';

export default function Header({ onOpenEnquiry }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
      }}
    >
      {/* Top Utility Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-brand-navy-hover)',
          color: '#EDECE6',
          fontSize: '0.78rem',
          borderBottom: '1px solid rgba(221, 217, 207, 0.15)',
          padding: '0.45rem 0',
        }}
      >
        <Container>
          <div
            className="top-utility-bar-content"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            {/* Left: Trust & Verification Badge */}
            <div className="top-bar-badge" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#EDECE6' }}>
                <ShieldCheck size={14} style={{ color: 'var(--color-brand-yellow)' }} />
                <span>100% Verified Properties</span>
              </span>
            </div>

            {/* Right: Email, Secondary Phone, and Working Hours */}
            <div
              className="top-bar-contacts"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
              }}
            >
              <a
                href={CONTACT.emailHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#EDECE6',
                  transition: 'color 0.15s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#EDECE6')}
              >
                <Mail size={13} style={{ color: 'var(--color-brand-yellow)' }} />
                <span>{CONTACT.email}</span>
              </a>

              <a
                href={CONTACT.secondaryPhoneHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#EDECE6',
                  transition: 'color 0.15s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-yellow)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#EDECE6')}
              >
                <Phone size={13} style={{ color: 'var(--color-brand-yellow)' }} />
                <span>{CONTACT.secondaryPhoneDisplay}</span>
              </a>

              <span className="top-bar-hours" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={13} />
                <span>{CONTACT.supportHours}</span>
              </span>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Navbar */}
      <Navbar onOpenEnquiry={onOpenEnquiry} />

      <style>{`
        @media (max-width: 768px) {
          .top-bar-badge {
            display: none !important;
          }
          .top-bar-hours {
            display: none !important;
          }
          .top-utility-bar-content {
            justify-content: center !important;
          }
          .top-bar-contacts {
            justify-content: center !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </header>
  );
}
