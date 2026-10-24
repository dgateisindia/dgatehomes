import React from 'react';

/**
 * Reusable primary button styled with Dgate Homes yellow & black brand identity.
 */
export default function PrimaryButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'black' | 'outline' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
  className = '',
  style = {},
  ...props
}) {
  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '0.95rem' },
    lg: { padding: '0.95rem 2rem', fontSize: '1.05rem' },
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-brand-navy)',
      color: '#FFFFFF',
      border: '1px solid var(--color-brand-navy)',
      fontWeight: '600',
      boxShadow: '0 2px 4px rgba(23, 16, 82, 0.2)',
    },
    secondary: {
      backgroundColor: 'var(--color-brand-navy)',
      color: '#FFFFFF',
      border: '1px solid var(--color-brand-navy)',
      fontWeight: '600',
      boxShadow: '0 2px 4px rgba(23, 16, 82, 0.2)',
    },
    sage: {
      backgroundColor: 'var(--color-brand-navy)',
      color: '#FFFFFF',
      border: '1px solid var(--color-brand-navy)',
      fontWeight: '600',
      boxShadow: '0 2px 4px rgba(23, 16, 82, 0.2)',
    },
    accent: {
      backgroundColor: 'var(--color-brand-yellow)',
      color: 'var(--color-brand-navy)',
      border: '1px solid var(--color-brand-yellow)',
      fontWeight: '700',
      boxShadow: 'var(--shadow-yellow)',
    },
    black: {
      backgroundColor: 'var(--color-brand-navy)',
      color: '#FFFFFF',
      border: '1px solid var(--color-brand-navy)',
      fontWeight: '600',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-brand-navy)',
      border: '1.5px solid var(--color-brand-navy)',
      fontWeight: '600',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-brand-navy)',
      border: 'none',
      fontWeight: '600',
    },
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all var(--transition-normal)',
    width: fullWidth ? '100%' : 'auto',
    textAlign: 'center',
    textDecoration: 'none',
    userSelect: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn-dgate btn-${variant} ${className}`}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        if (variant === 'primary' || variant === 'secondary' || variant === 'sage' || variant === 'black') {
          e.currentTarget.style.backgroundColor = 'var(--color-brand-navy-hover)';
          e.currentTarget.style.borderColor = 'var(--color-brand-navy-hover)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(23, 16, 82, 0.28)';
        } else if (variant === 'accent') {
          e.currentTarget.style.backgroundColor = 'var(--color-brand-yellow-hover)';
          e.currentTarget.style.borderColor = 'var(--color-brand-yellow-hover)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-yellow)';
        } else if (variant === 'outline') {
          e.currentTarget.style.borderColor = 'var(--color-brand-yellow)';
          e.currentTarget.style.color = 'var(--color-brand-navy)';
          e.currentTarget.style.backgroundColor = 'var(--color-brand-yellow-light)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'var(--color-brand-beige)';
        }
      }}
      onMouseLeave={(e) => {
        if (disabled || loading) return;
        if (variant === 'primary' || variant === 'secondary' || variant === 'sage' || variant === 'black') {
          e.currentTarget.style.backgroundColor = 'var(--color-brand-navy)';
          e.currentTarget.style.borderColor = 'var(--color-brand-navy)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(23, 16, 82, 0.2)';
        } else if (variant === 'accent') {
          e.currentTarget.style.backgroundColor = 'var(--color-brand-yellow)';
          e.currentTarget.style.borderColor = 'var(--color-brand-yellow)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        } else if (variant === 'outline') {
          e.currentTarget.style.borderColor = 'var(--color-brand-navy)';
          e.currentTarget.style.color = 'var(--color-brand-navy)';
          e.currentTarget.style.backgroundColor = 'transparent';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : 18} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : 18} />}
        </>
      )}
    </button>
  );
}
