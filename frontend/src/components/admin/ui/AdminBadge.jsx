import React from 'react';

const BADGE_VARIANTS = {
  success: {
    bg: '#dcfce7',
    color: '#15803d',
    border: '#bbf7d0',
  },
  warning: {
    bg: '#fef8eb',
    color: '#92400e',
    border: '#fde68a',
  },
  danger: {
    bg: '#fee2e2',
    color: '#b91c1c',
    border: '#fecaca',
  },
  critical: {
    bg: '#fee2e2',
    color: '#b91c1c',
    border: '#fca5a5',
  },
  info: {
    bg: '#e0f2fe',
    color: '#0369a1',
    border: '#bae6fd',
  },
  neutral: {
    bg: '#EDECE6',
    color: '#77736B',
    border: '#DDD9CF',
  },
  sage: {
    bg: '#EDECE6',
    color: '#171052',
    border: '#DDD9CF',
  },
  walnut: {
    bg: '#f0eff8',
    color: '#171052',
    border: '#c4c1e0',
  },
  amber: {
    bg: '#fef7e8',
    color: '#825a05',
    border: '#F9B318',
  },
  yellow: {
    bg: '#fef7e8',
    color: '#825a05',
    border: '#F9B318',
  },
  navy: {
    bg: '#f0eff8',
    color: '#171052',
    border: '#c4c1e0',
  },
};

/**
 * Standardized status / tag badge for admin interfaces.
 */
export default function AdminBadge({
  children,
  variant = 'neutral',
  icon: Icon,
  style = {},
  className = '',
}) {
  const cfg = BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.72rem',
        fontWeight: '800',
        padding: '0.18rem 0.55rem',
        borderRadius: '100px',
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        ...style,
      }}
    >
      {Icon && <Icon size={11} style={{ flexShrink: 0 }} />}
      <span>{children}</span>
    </span>
  );
}
