import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, LogOut, ArrowLeft, Loader2, Key } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { isClerkConfigured } from '../../config/clerk';
import PrimaryButton from '../common/PrimaryButton';
import Container from '../common/Container';

function ClerkNotConfiguredCard() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fef8eb',
            color: '#855302',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <Key size={28} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-black-heading)', marginBottom: '0.75rem' }}>
          Clerk Configuration Required
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          To access the Dgate Homes Admin Portal, please configure your Clerk Publishable Key in{' '}
          <code style={{ backgroundColor: '#f3f4f6', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>frontend/.env</code>.
        </p>
        <div
          style={{
            backgroundColor: 'var(--color-brand-navy)',
            color: 'var(--color-brand-accent)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            fontFamily: 'monospace',
            textAlign: 'left',
            marginBottom: '1.5rem',
            wordBreak: 'break-all',
          }}
        >
          VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
        </div>
        <Link to="/">
          <PrimaryButton style={{ width: '100%' }}>Back to Public Website</PrimaryButton>
        </Link>
      </div>
    </div>
  );
}

function AdminProtectedInner({ children }) {
  const { isLoaded, isSignedIn, loading, authorized, forbidden, error, adminProfile, signOut } = useAdminAuth();

  // 1. Initial authentication loading state
  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Loader2 size={36} style={{ color: 'var(--color-yellow-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', fontWeight: '600' }}>
          Verifying administrator credentials...
        </p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 2. Redirect unauthenticated users to /admin/login
  if (!isSignedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  // 3. User authenticated with Clerk, but not authorized in MySQL admin_profiles or inactive (HTTP 403)
  if (forbidden || (!authorized && error)) {
    return (
      <Container style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #fee2e2',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-black-heading)', marginBottom: '0.75rem' }}>
            Access Denied
          </h2>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Your account is authenticated via Clerk, but you do not have an active administrator profile in the Dgate Homes database.
          </p>

          <div
            style={{
              backgroundColor: 'var(--color-bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: '1.75rem',
              textAlign: 'left',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>Authorization Error:</div>
            <div style={{ color: '#b91c1c', fontWeight: '600' }}>
              {error || 'Active administrator privileges required (HTTP 403).'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => signOut()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: 'var(--color-black)',
                color: 'var(--color-white)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <LogOut size={16} /> Sign Out of Clerk
            </button>

            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: 'var(--color-bg-subtle)',
                color: 'var(--color-black)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                fontSize: '0.88rem',
                border: '1px solid var(--color-border)',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} /> Public Website
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  // 4. Authorized administrator
  return typeof children === 'function' ? children({ adminProfile }) : children;
}

export default function AdminProtectedRoute({ children }) {
  if (!isClerkConfigured) {
    return <ClerkNotConfiguredCard />;
  }

  return <AdminProtectedInner>{children}</AdminProtectedInner>;
}
