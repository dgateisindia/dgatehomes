import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { SignIn, useAuth } from '@clerk/clerk-react';
import { ArrowLeft, ShieldCheck, Key, Lock } from 'lucide-react';
import { isClerkConfigured } from '../../config/clerk';
import PrimaryButton from '../../components/common/PrimaryButton';
import DgateLogo from '../../components/common/DgateLogo';

function ClerkNotConfiguredLoginCard() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-brand-walnut)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: '1.75rem', left: '1.75rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#e5ded6',
            fontSize: '0.88rem',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Dgate Homes
        </Link>
      </div>

      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: 'var(--color-brand-walnut-hover)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '2.5rem',
          textAlign: 'center',
          color: '#f9fafb',
        }}
      >
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'rgba(249, 179, 24, 0.2)',
            color: 'var(--color-brand-yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <Key size={24} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem' }}>
          Clerk Key Required
        </h3>

        <p style={{ color: '#e5ded6', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
          Please set your Clerk Publishable Key in <code style={{ color: 'var(--color-brand-yellow)' }}>frontend/.env</code> to activate the Clerk sign-in interface:
        </p>

        <pre
          style={{
            backgroundColor: 'var(--color-brand-navy-active)',
            color: '#F9B318',
            padding: '0.85rem',
            borderRadius: '6px',
            fontSize: '0.82rem',
            textAlign: 'left',
            overflowX: 'auto',
            marginBottom: '1.5rem',
          }}
        >
          VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
        </pre>

        <Link to="/">
          <PrimaryButton variant="accent" style={{ width: '100%' }}>Back to Website</PrimaryButton>
        </Link>
      </div>
    </div>
  );
}

function AdminLoginInner() {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  // If URL attempts to access sign-up subpath, redirect to /admin/login
  if (
    location.pathname.toLowerCase().includes('/sign-up') ||
    location.pathname.toLowerCase().includes('/signup')
  ) {
    return <Navigate to="/admin/login" replace />;
  }

  // If already signed in, redirect directly to admin portal
  if (isLoaded && isSignedIn) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-brand-navy)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
      }}
    >
      {/* Top Brand Bar */}
      <div style={{ position: 'absolute', top: '1.75rem', left: '1.75rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#e5ded6',
            fontSize: '0.88rem',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#e5ded6')}
        >
          <ArrowLeft size={16} /> Back to Dgate Homes
        </Link>
      </div>

      <div style={{ maxWidth: '440px', width: '100%', marginBottom: '1.75rem', textAlign: 'center' }}>
        {/* Official Dgate Homes Brand Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <DgateLogo variant="adminLogin" />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(249, 179, 24, 0.16)', color: 'var(--color-brand-yellow)', padding: '0.35rem 0.85rem', borderRadius: '100px', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
          <ShieldCheck size={14} /> Admin Portal &bull; Login Only
        </div>

        <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
          Administrator Sign In
        </h1>
        <p style={{ color: '#e5ded6', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
          Authorized real estate administrators only. Public registration is disabled.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <SignIn
          routing="path"
          path="/admin/login"
          signUpUrl="/admin/login"
          fallbackRedirectUrl="/admin"
          appearance={{
            variables: {
              colorPrimary: '#171052',
              colorText: '#1F1F24',
              colorBackground: '#ffffff',
              borderRadius: '8px',
            },
            elements: {
              card: {
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
              // Enforce Login Only: hide "Don't have an account? Sign up" and sign-up buttons
              footerAction: { display: 'none' },
              footerAction__signUp: { display: 'none' },
              footerActionText: { display: 'none' },
              footerActionLink: { display: 'none' },
              footerActionLink__signUp: { display: 'none' },
            },
          }}
        />
      </div>

      {/* Scoped CSS to enforce suppression of any sign-up affordances or links */}
      <style>{`
        .cl-rootBox .cl-footerAction,
        .cl-rootBox .cl-footerAction__signUp,
        .cl-rootBox .cl-footerActionText,
        .cl-rootBox .cl-footerActionLink,
        .cl-rootBox .cl-signUp-link,
        .cl-rootBox a[href*="sign-up"],
        .cl-rootBox a[href*="signup"],
        .cl-rootBox [data-localization-key="signIn.start.actionText"],
        .cl-rootBox [data-localization-key="signIn.start.actionLink"] {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

export default function AdminLoginPage() {
  if (!isClerkConfigured) {
    return <ClerkNotConfiguredLoginCard />;
  }

  return <AdminLoginInner />;
}
