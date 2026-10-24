import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

/**
 * Standardized error message container with optional retry button.
 */
export default function AdminErrorState({
  error,
  onRetry,
  style = {},
}) {
  if (!error) return null;

  return (
    <div
      style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '10px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        color: '#991b1b',
        fontSize: '0.82rem',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
        <AlertCircle size={17} style={{ color: '#dc2626', flexShrink: 0 }} />
        <span style={{ fontWeight: '500' }}>{error}</span>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            backgroundColor: '#ffffff',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            color: '#b91c1c',
            fontWeight: '700',
            fontSize: '0.76rem',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={12} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
