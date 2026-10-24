import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, IndianRupee, Sparkles, ShieldCheck, Tag } from 'lucide-react';
import Container from '../common/Container';
import { usePropertyTypes } from '../../hooks/usePropertyTypes';
import { buildPropertiesUrl } from '../../utils/queryHelper';
import { ENABLE_RENT_LISTINGS } from '../../config/listingModes';

export default function HeroSearch({ onSearch }) {
  const navigate = useNavigate();
  const { propertyTypes, loading: propertyTypesLoading } = usePropertyTypes();
  const [listingType, setListingType] = useState('sale'); // 'sale' | 'rent'
  const [location, setLocation] = useState('');
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [budget, setBudget] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    let minPrice = '';
    let maxPrice = '';
    if (budget) {
      const parts = budget.split('-');
      if (parts[0] && Number(parts[0]) > 0) minPrice = parts[0];
      if (parts[1]) maxPrice = parts[1];
    }

    const searchPayload = {
      listing_type: ENABLE_RENT_LISTINGS ? listingType : 'sale',
      location: location.trim(),
      property_type_id: propertyTypeId ? Number(propertyTypeId) : undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    };

    if (onSearch) {
      onSearch(searchPayload);
    } else {
      navigate(buildPropertiesUrl(searchPayload));
    }
  };

  return (
    <section
      style={{
        position: 'relative',
        backgroundColor: '#0a0a0a',
        color: 'var(--color-white)',
        paddingTop: '3.75rem',
        paddingBottom: '4.5rem',
        overflow: 'hidden',
        borderBottom: '1px solid #1f2937',
      }}
    >
      {/* Background Architectural Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 179, 24, 0.12) 0%, rgba(10, 10, 10, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 179, 24, 0.08) 0%, rgba(10, 10, 10, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          {/* Pill Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(249, 179, 24, 0.15)',
              border: '1px solid rgba(249, 179, 24, 0.35)',
              color: 'var(--color-brand-yellow)',
              padding: '0.35rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={14} />
            <span>Bangalore&apos;s Elite Real Estate Destination</span>
          </div>

          {/* Hero Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.1rem, 4.5vw, 3.4rem)',
              fontWeight: '800',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              color: 'var(--color-white)',
            }}
          >
            Find Your Dream Home with <br />
            <span style={{ color: 'var(--color-yellow-primary)' }}>Unmatched Transparency</span>
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
              color: '#d1d5db',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 2rem',
            }}
          >
            Discover verified luxury villas, sky penthouses, and gated apartments. Direct developer pricing, expert legal checks, and zero brokerage assistance.
          </p>

          {/* Compact 99acres-Style Property Search Card */}
          <div className="hero-search-card">
            {/* 1. Compact Buy / Rent Tabs (~44px height) - Preserved & Restorable via ENABLE_RENT_LISTINGS */}
            {ENABLE_RENT_LISTINGS && (
              <div className="hero-search-tabs">
                <button
                  type="button"
                  onClick={() => setListingType('sale')}
                  className={`hero-search-tab ${listingType === 'sale' ? 'active' : ''}`}
                  aria-pressed={listingType === 'sale'}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: listingType === 'sale' ? 'var(--color-yellow-primary)' : 'transparent',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  Buy Property
                </button>

                <button
                  type="button"
                  onClick={() => setListingType('rent')}
                  className={`hero-search-tab ${listingType === 'rent' ? 'active' : ''}`}
                  aria-pressed={listingType === 'rent'}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: listingType === 'rent' ? 'var(--color-yellow-primary)' : 'transparent',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  Rent Property
                </button>
              </div>
            )}

            {/* 2. Compact Search Fields Form (16px vertical padding, 50px inputs) */}
            <form onSubmit={handleSearchSubmit} className="hero-search-form">
              <div className="hero-search-grid">
                {/* Field 1: Location Input */}
                <div className="hero-search-field">
                  <label htmlFor="hero-search-location">Location / Locality</label>
                  <div className="hero-search-input-wrap">
                    <MapPin size={17} />
                    <input
                      id="hero-search-location"
                      type="text"
                      placeholder="e.g. Whitefield, Indiranagar"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="hero-search-control"
                    />
                  </div>
                </div>

                {/* Field 2: Property Type Dropdown */}
                <div className="hero-search-field">
                  <label htmlFor="hero-search-property-type">Property Type</label>
                  <div className="hero-search-input-wrap">
                    <Home size={17} />
                    <select
                      id="hero-search-property-type"
                      value={propertyTypeId}
                      onChange={(e) => setPropertyTypeId(e.target.value)}
                      disabled={propertyTypesLoading}
                      className="hero-search-control"
                      style={{
                        cursor: propertyTypesLoading ? 'not-allowed' : 'pointer',
                        opacity: propertyTypesLoading ? 0.7 : 1,
                      }}
                    >
                      <option value="">{propertyTypesLoading ? 'Loading Types...' : 'All Property Types'}</option>
                      {propertyTypes.map((pt) => (
                        <option key={pt.id} value={String(pt.id)}>
                          {pt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Field 3: Budget Range Dropdown */}
                <div className="hero-search-field">
                  <label htmlFor="hero-search-budget">Budget Range</label>
                  <div className="hero-search-input-wrap">
                    <IndianRupee size={17} />
                    <select
                      id="hero-search-budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="hero-search-control"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">Any Budget</option>
                      {listingType === 'sale' ? (
                        <>
                          <option value="0-5000000">Up to ₹50 Lakhs</option>
                          <option value="5000000-10000000">₹50 L - ₹1.00 Cr</option>
                          <option value="10000000-25000000">₹1.00 Cr - ₹2.50 Cr</option>
                          <option value="25000000-50000000">₹2.50 Cr - ₹5.00 Cr</option>
                          <option value="50000000-">₹5.00 Cr + (Ultra Luxury)</option>
                        </>
                      ) : (
                        <>
                          <option value="0-25000">Up to ₹25,000 / month</option>
                          <option value="25000-50000">₹25,000 - ₹50,000 / month</option>
                          <option value="50000-100000">₹50,000 - ₹1 Lakh / month</option>
                          <option value="100000-">₹1 Lakh + / month</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Field 4: Search CTA Button (50px height, aligned in row) */}
                <div className="hero-search-action">
                  <button type="submit" className="hero-search-btn" aria-label="Search Properties">
                    <Search size={16} />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Shortcuts: compact inline chips placed below the card */}
          <div className="hero-search-shortcuts">
            <span style={{ color: '#9ca3af', fontWeight: '600', fontSize: '0.8rem' }}>
              Popular Searches:
            </span>
            <Link to="/properties?listing_type=sale" className="hero-shortcut-chip">
              <Tag size={12} style={{ color: 'var(--color-yellow-primary)' }} />
              Properties for Sale
            </Link>
            {ENABLE_RENT_LISTINGS && (
              <Link to="/properties?listing_type=rent" className="hero-shortcut-chip">
                <Tag size={12} style={{ color: 'var(--color-yellow-primary)' }} />
                Properties for Rent
              </Link>
            )}
          </div>

          {/* Quick Trust Highlights */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(1rem, 3vw, 2.5rem)',
              marginTop: '2.25rem',
              flexWrap: 'wrap',
              fontSize: '0.84rem',
              color: '#9ca3af',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--color-yellow-primary)' }} />
              100% Verified Titles &amp; RERA Registered
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} style={{ color: 'var(--color-yellow-primary)' }} />
              Direct Developer Pricing
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--color-yellow-primary)' }} />
              Personalized Site Visit Assistance
            </span>
          </div>
        </div>
      </Container>

      {/* Scoped CSS for high-density, compact search layout */}
      <style>{`
        .hero-search-card {
          border-radius: 18px;
          background-color: var(--color-white);
          box-shadow: 0 20px 45px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08);
          overflow: hidden;
          text-align: left;
          color: var(--color-text-main);
          max-width: 960px;
          margin: 0 auto;
        }

        .hero-search-tabs {
          display: flex;
          height: 44px;
          background-color: var(--color-bg-subtle);
          border-bottom: 1px solid var(--color-border);
          padding: 0 0.5rem;
        }

        .hero-search-tab {
          height: 44px;
          padding: 0 1.25rem;
          font-size: 0.88rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          border: none;
          background: transparent;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }

        .hero-search-tab.active {
          background-color: var(--color-white);
          color: var(--color-black);
          border: 1px solid var(--color-border);
          border-bottom: 2.5px solid var(--color-yellow-primary);
          margin-bottom: -1px;
        }

        .hero-search-tab:not(.active) {
          color: var(--color-text-muted);
        }

        .hero-search-tab:not(.active):hover {
          color: var(--color-black);
        }

        .hero-search-form {
          padding: 16px 18px;
        }

        .hero-search-grid {
          display: grid;
          grid-template-columns: 1.4fr 1.1fr 1.1fr auto;
          gap: 12px;
          align-items: flex-end;
        }

        .hero-search-field label {
          display: block;
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--color-text-muted);
          text-transform: uppercase;
          margin-bottom: 4px;
          letter-spacing: 0.05em;
        }

        .hero-search-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .hero-search-input-wrap svg {
          position: absolute;
          left: 0.85rem;
          color: var(--color-yellow-primary);
          pointer-events: none;
          width: 17px;
          height: 17px;
        }

        .hero-search-control {
          width: 100%;
          height: 50px;
          padding: 0 0.85rem 0 2.35rem;
          border-radius: 10px;
          border: 1.5px solid var(--color-border);
          outline: none;
          font-size: 0.9rem;
          font-weight: 500;
          background-color: var(--color-white);
          color: var(--color-text-main);
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }

        .hero-search-control:focus {
          border-color: var(--color-brand-yellow);
          box-shadow: 0 0 0 3px rgba(249, 179, 24, 0.25);
        }

        .hero-search-action {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .hero-search-btn {
          height: 50px;
          padding: 0 1.4rem;
          background-color: var(--color-brand-navy);
          color: #FFFFFF;
          border-radius: 10px;
          font-size: 0.92rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          white-space: nowrap;
          border: 1px solid var(--color-brand-navy);
          transition: background-color 0.15s, box-shadow 0.15s;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(23, 16, 82, 0.25);
          box-sizing: border-box;
        }

        .hero-search-btn:hover {
          background-color: var(--color-brand-navy-hover);
          border-color: var(--color-brand-navy-hover);
        }

        .hero-search-shortcuts {
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 0.65rem;
          margin-top: 1rem;
          font-size: 0.82rem;
          flex-wrap: wrap;
        }

        .hero-shortcut-chip {
          color: #e5e7eb;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.75rem;
          background-color: rgba(255, 255, 255, 0.07);
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 0.78rem;
          transition: all 0.15s ease;
          text-decoration: none;
        }

        .hero-shortcut-chip:hover {
          background-color: rgba(249, 179, 24, 0.16);
          border-color: var(--color-brand-yellow);
          color: var(--color-brand-yellow);
        }

        @media (max-width: 860px) {
          .hero-search-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .hero-search-btn {
            width: 100%;
          }
          .hero-search-form {
            padding: 14px 14px;
          }
          .hero-search-tabs {
            padding: 0 0.25rem;
          }
          .hero-search-tab {
            padding: 0 0.95rem;
            font-size: 0.84rem;
          }
        }
      `}</style>
    </section>
  );
}
