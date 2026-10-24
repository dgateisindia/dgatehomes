import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

/**
 * Filter toolbar container with a standard header row (icon, title, reset button)
 * and a responsive grid layout for inputs, selects, and date ranges.
 */
export default function AdminFilterBar({
  children,
  title = 'Filter Records',
  hasActiveFilters = false,
  onReset,
  columns = 'repeat(auto-fit, minmax(200px, 1fr))',
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Filter size={15} style={{ color: 'var(--color-brand-accent)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--color-black-heading)' }}>
            {title}
          </span>
        </div>

        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.76rem',
              fontWeight: '700',
              color: 'var(--color-brand-navy)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
            }}
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: columns,
          gap: '0.85rem',
          alignItems: 'flex-end',
        }}
      >
        {children}
      </div>
    </div>
  );
}
