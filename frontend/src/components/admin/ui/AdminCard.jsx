import React from 'react';

/**
 * Reusable surface card for admin content, forms, and data tables.
 */
export default function AdminCard({
  children,
  title,
  subtitle,
  icon: Icon,
  headerAction,
  padding = '1.25rem 1.5rem',
  style = {},
  className = '',
}) {
  const hasHeader = title || subtitle || Icon || headerAction;

  return (
    <div
      className={className}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {hasHeader && (
        <div
          style={{
            padding: '1rem 1.35rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {Icon && <Icon size={16} style={{ color: 'var(--color-brand-accent)', flexShrink: 0 }} />}
            <div>
              {title && (
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: '800',
                    color: 'var(--color-black-heading)',
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {headerAction && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {headerAction}
            </div>
          )}
        </div>
      )}

      <div style={{ padding }}>{children}</div>
    </div>
  );
}
