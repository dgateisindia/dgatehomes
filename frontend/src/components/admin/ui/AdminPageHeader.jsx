import React from 'react';

/**
 * Standardized header banner for admin pages.
 * Supports title, icon, subtitle, role badges, and right-aligned actions.
 */
export default function AdminPageHeader({
  title,
  subtitle,
  icon: Icon,
  badgeText,
  badgeColor = '#F9B318',
  badgeBg = '#fef7e8',
  actions,
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {Icon && (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-brand-navy)',
              color: 'var(--color-brand-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20} />
          </div>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: '800',
                color: 'var(--color-black-heading)',
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              {title}
            </h1>
            {badgeText && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '100px',
                  backgroundColor: badgeBg,
                  color: badgeColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  border: `1px solid ${badgeColor}30`,
                }}
              >
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p
              style={{
                fontSize: '0.82rem',
                color: '#64748b',
                margin: '0.2rem 0 0 0',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
