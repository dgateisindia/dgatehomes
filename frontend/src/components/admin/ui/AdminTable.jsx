import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Standardized data table container with sticky header and optional pagination footer.
 */
export default function AdminTable({
  children,
  pagination,
  onPageChange,
  loading = false,
  style = {},
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, ...style }}>
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table
          className="admin-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.84rem',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          {children}
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--color-bg)',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <div>
            Showing page <strong style={{ color: 'var(--color-text-main)' }}>{pagination.page}</strong> of{' '}
            <strong style={{ color: 'var(--color-text-main)' }}>{pagination.totalPages}</strong> (
            {pagination.total} total records)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => onPageChange && onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1 || loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: pagination.page <= 1 || loading ? '#cbd5e1' : 'var(--color-text-main)',
                cursor: pagination.page <= 1 || loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s',
              }}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                padding: '0.25rem 0.65rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-text-main)',
              }}
            >
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                onPageChange && onPageChange(Math.min(pagination.totalPages, pagination.page + 1))
              }
              disabled={pagination.page >= pagination.totalPages || loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: pagination.page >= pagination.totalPages || loading ? '#cbd5e1' : 'var(--color-text-main)',
                cursor: pagination.page >= pagination.totalPages || loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s',
              }}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
