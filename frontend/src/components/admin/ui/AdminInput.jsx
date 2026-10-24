import React, { useState } from 'react';

/**
 * Standardized input component with optional label and leading icon.
 */
export default function AdminInput({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = 'text',
  disabled = false,
  style = {},
  inputStyle = {},
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0, ...style }}>
      {label && (
        <label
          style={{
            fontSize: '0.74rem',
            fontWeight: '700',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '0.65rem',
              color: focused ? 'var(--color-brand-accent)' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            <Icon size={14} />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: '36px',
            padding: Icon ? '0.45rem 0.65rem 0.45rem 2rem' : '0.45rem 0.65rem',
            fontSize: '0.82rem',
            color: 'var(--color-text-main)',
            backgroundColor: disabled ? '#f8fafc' : '#ffffff',
            border: focused
              ? '1px solid var(--color-brand-accent)'
              : '1px solid var(--color-border)',
            borderRadius: '6px',
            outline: 'none',
            boxShadow: focused ? '0 0 0 2px rgba(249, 179, 24, 0.25)' : 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            ...inputStyle,
          }}
          {...props}
        />
      </div>
    </div>
  );
}
