import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Empty state container when no records match or exist.
 */
export default function AdminEmptyState({
  icon: Icon = Inbox,
  title = 'No Records Found',
  description = 'There are no records matching your current filter criteria.',
  action,
  padding = '3.5rem 1.5rem',
}) {
  return (
    <div
      style={{
        padding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <Icon size={24} />
      </div>

      <h4
        style={{
          fontSize: '0.98rem',
          fontWeight: '800',
          color: 'var(--color-black-heading)',
          margin: '0 0 0.35rem 0',
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: '0.82rem',
          color: '#64748b',
          maxWidth: '380px',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {action && <div style={{ marginTop: '1.25rem' }}>{action}</div>}
    </div>
  );
}
