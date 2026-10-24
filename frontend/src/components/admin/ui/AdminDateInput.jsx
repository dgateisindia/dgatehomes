import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

/**
 * Standardized HTML5 date input with label and clean borders.
 */
export default function AdminDateInput({
  label,
  value,
  onChange,
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

      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <input
          type="date"
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: '36px',
            padding: '0.45rem 0.65rem',
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
