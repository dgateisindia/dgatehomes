import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import Container from '../../components/common/Container';
import PrimaryButton from '../../components/common/PrimaryButton';

export default function AdminPlaceholderPage({ title, description }) {
  return (
    <div style={{ padding: '2.5rem 1.5rem' }}>
      <Container>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: '620px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(249, 179, 24, 0.16)',
              color: 'var(--color-brand-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Construction size={30} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-black-heading)', marginBottom: '0.75rem' }}>
            {title || 'Module Coming Soon'}
          </h2>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            {description ||
              'Management CRUD operations for this module will be implemented in subsequent phases. Return to the dashboard to monitor live platform metrics.'}
          </p>

          <Link to="/admin">
            <PrimaryButton style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </PrimaryButton>
          </Link>
        </div>
      </Container>
    </div>
  );
}
