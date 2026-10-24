import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

/**
 * Route guard component that restricts access to super_admin users only.
 * If user is authenticated as a standard admin, displays an access restricted message.
 */
export default function AdminSuperAdminRoute({ children }) {
  const { adminProfile, loading } = useAdminAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1rem',
        }}
      >
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
          Verifying security privileges...
        </span>
      </div>
    );
  }

  if (adminProfile?.role !== 'super_admin') {
    return (
      <div style={{ padding: '2rem', maxWidth: '640px', margin: '4rem auto' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #fecaca',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <ShieldAlert size={28} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            Super Administrator Required
          </h2>

          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 1.75rem 0' }}>
            This resource contains sensitive audit trails and platform security events. Access is strictly limited
            to verified super administrators. Your current account role is{' '}
            <strong style={{ color: '#0f172a' }}>{adminProfile?.role || 'admin'}</strong>.
          </p>

          <Link
            to="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              backgroundColor: 'var(--color-yellow-primary)',
              color: '#0f172a',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'background-color 0.15s',
            }}
          >
            <ArrowLeft size={16} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
