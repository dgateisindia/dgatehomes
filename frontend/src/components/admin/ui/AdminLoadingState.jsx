import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Standardized loading state for admin cards and tables.
 */
export default function AdminLoadingState({
  message = 'Loading data...',
  padding = '4rem 1.5rem',
}) {
  return (
    <div
      style={{
        padding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
      }}
    >
      <Loader2
        size={28}
        style={{
          color: 'var(--color-brand-amber)',
          animation: 'spin 1s linear infinite',
        }}
      />
      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
        {message}
      </span>
    </div>
  );
}
