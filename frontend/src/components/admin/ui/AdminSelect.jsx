import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Standardized dropdown select for admin filters and forms.
 */
export default function AdminSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'All',
  disabled = false,
  style = {},
  selectStyle = {},
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

      <div style={{ position: 'relative', width: '100%' }}>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: '36px',
            padding: '0.45rem 1.75rem 0.45rem 0.65rem',
            fontSize: '0.82rem',
            color: 'var(--color-text-main)',
            backgroundColor: disabled ? '#f8fafc' : '#ffffff',
            border: focused
              ? '1px solid var(--color-brand-accent)'
              : '1px solid var(--color-border)',
            borderRadius: '6px',
            outline: 'none',
            boxShadow: focused ? '0 0 0 2px rgba(249, 179, 24, 0.25)' : 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            ...selectStyle,
          }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const optVal = typeof opt === 'object' && opt !== null ? opt.value : opt;
            const optLabel = typeof opt === 'object' && opt !== null ? opt.label : opt;
            return (
              <option key={String(optVal)} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>

        <div
          style={{
            position: 'absolute',
            right: '0.65rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );
}
