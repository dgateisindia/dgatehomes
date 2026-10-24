import React from 'react';

/**
 * Standard section header with brand pill badge, heading, and description.
 */
export default function SectionHeader({
  badge,
  title,
  subtitle,
  align = 'left', // 'left' | 'center'
  action,
  className = '',
  style = {},
}) {
  const isCenter = align === 'center';

  return (
    <div
      className={`section-header ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCenter ? 'center' : 'flex-start',
        textAlign: isCenter ? 'center' : 'left',
        marginBottom: '2.5rem',
        width: '100%',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: isCenter ? 'center' : 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ maxWidth: isCenter ? '720px' : '650px' }}>
          {badge && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--color-yellow-light)',
                color: 'var(--color-yellow-hover)',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-yellow-primary)',
                }}
              />
              {badge}
            </div>
          )}

          <h2
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
              color: 'var(--color-black-heading)',
              fontWeight: '800',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: subtitle ? '0.75rem' : '0',
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
