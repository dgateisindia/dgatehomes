import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  Building,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  AlertCircle,
  Tag,
  ArrowRight,
  Archive,
  Layers,
  Calendar,
  AlertTriangle,
  User,
  TrendingUp,
} from 'lucide-react';
import { getDashboardSummary } from '../../services/adminDashboardService';
import { formatPrice } from '../../utils/formatters';

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to retrieve admin authentication token.');
      }
      const result = await getDashboardSummary(token);
      setData(result);
    } catch (err) {
      console.error('[AdminDashboardPage] Failed to fetch summary:', err);
      setError(err.message || 'Failed to load dashboard summary metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const summary = data?.summary || {
    totalProperties: 0,
    publishedProperties: 0,
    draftProperties: 0,
    archivedProperties: 0,
    featuredProperties: 0,
    propertiesPublishedThisMonth: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    contactedEnquiries: 0,
    inProgressEnquiries: 0,
    closedEnquiries: 0,
    overdueFollowUps: 0,
    enquiriesToday: 0,
    enquiriesThisWeek: 0,
  };

  const recentEnquiries = data?.recentEnquiries || [];
  const recentProperties = data?.recentProperties || [];
  const upcomingFollowUps = data?.upcomingFollowUps || [];

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
            Dashboard Overview
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
            Real-time platform metrics, inquiry pipeline, scheduled follow-ups, and inventory status.
          </p>
        </div>

        <button
          onClick={() => fetchSummary(true)}
          disabled={loading || refreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.95rem',
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: '700',
            color: 'var(--color-black)',
            cursor: loading || refreshing ? 'not-allowed' : 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <RefreshCw
            size={14}
            style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              color: 'var(--color-yellow-hover)',
            }}
          />
          {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Overdue Follow-ups Alert Banner */}
      {summary.overdueFollowUps > 0 && (
        <div
          style={{
            backgroundColor: '#fef8eb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            color: '#855302',
            fontSize: '0.88rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertTriangle size={18} style={{ color: '#d19a22', flexShrink: 0 }} />
            <span>
              <strong>Action Needed:</strong> You have <strong>{summary.overdueFollowUps}</strong> enquiry follow-up
              {summary.overdueFollowUps === 1 ? '' : 's'} that {summary.overdueFollowUps === 1 ? 'is' : 'are'} overdue.
            </span>
          </div>
          <Link
            to="/admin/enquiries"
            style={{
              backgroundColor: 'var(--color-brand-walnut)',
              color: '#ffffff',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            Review Leads <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
            color: '#991b1b',
            fontSize: '0.88rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchSummary()}
            style={{
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              border: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Metrics Cards Grid */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.35rem',
                minHeight: '130px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '40%', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '4px' }} />
                <div style={{ width: '28px', height: '28px', backgroundColor: '#e5e7eb', borderRadius: '6px' }} />
              </div>
              <div style={{ width: '35%', height: '28px', backgroundColor: '#e5e7eb', borderRadius: '4px', margin: '0.75rem 0' }} />
              <div style={{ width: '60%', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Card 1: Total Properties */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.35rem',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Properties
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(249, 179, 24, 0.16)',
                  color: 'var(--color-brand-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building size={17} />
              </div>
            </div>

            <div style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--color-black-heading)', lineHeight: 1.1, marginBottom: '0.85rem' }}>
              {summary.totalProperties}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                {summary.publishedProperties} Published
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#fef8eb', color: '#855302' }}>
                {summary.draftProperties} Draft
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                {summary.archivedProperties} Archived
              </span>
            </div>
          </div>

          {/* Card 2: Total Enquiries */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.35rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Enquiries
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageSquare size={17} />
              </div>
            </div>

            <div style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--color-black-heading)', lineHeight: 1.1, marginBottom: '0.85rem' }}>
              {summary.totalEnquiries}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#fef8eb', color: '#855302' }}>
                {summary.newEnquiries} New
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                {summary.inProgressEnquiries} In Progress
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                {summary.closedEnquiries} Closed
              </span>
            </div>
          </div>

          {/* Card 3: Published Properties (Active Inventory) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.35rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Published Listings
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={17} />
              </div>
            </div>

            <div style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--color-black-heading)', lineHeight: 1.1, marginBottom: '0.45rem' }}>
              {summary.publishedProperties}
            </div>

            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: '600' }}>
              {summary.propertiesPublishedThisMonth} published this month
            </div>
          </div>

          {/* Card 4: Featured Properties */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.35rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Featured Properties
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(249, 179, 24, 0.16)',
                  color: 'var(--color-brand-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={17} />
              </div>
            </div>

            <div style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--color-black-heading)', lineHeight: 1.1, marginBottom: '0.45rem' }}>
              {summary.featuredProperties}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
              Showcased on Home page
            </div>
          </div>
        </div>
      )}

      {/* Secondary Velocity & Time Metrics Ribbon */}
      {!loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '0.2rem' }}>
              Enquiries Created Today
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              {summary.enquiriesToday}
            </span>
          </div>

          <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '0.2rem' }}>
              Enquiries This Week
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              {summary.enquiriesThisWeek}
            </span>
          </div>

          <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '0.2rem' }}>
              Contacted Leads
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              {summary.contactedEnquiries}
            </span>
          </div>

          <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '0.2rem' }}>
              Overdue Follow-ups
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: summary.overdueFollowUps > 0 ? '#dc2626' : '#16a34a' }}>
              {summary.overdueFollowUps}
            </span>
          </div>
        </div>
      )}

      {/* Tables Grid: Recent Enquiries, Recent Properties, and Upcoming Follow-ups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {/* Table 1: Recent Enquiries */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.15rem 1.35rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={17} style={{ color: 'var(--color-yellow-primary)' }} />
                <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
                  Recent Enquiries
                </h2>
              </div>
              <Link
                to="/admin/enquiries"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--color-yellow-hover)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                View All <ArrowRight size={13} />
              </Link>
            </div>

            {/* Table Content */}
            <div style={{ flex: 1, overflowX: 'auto' }}>
              {loading ? (
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: '38px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
                  ))}
                </div>
              ) : recentEnquiries.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <MessageSquare size={36} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-black-heading)' }}>
                    No Enquiries Yet
                  </div>
                  <p style={{ fontSize: '0.82rem', maxWidth: '320px', margin: '0.35rem auto 0' }}>
                    Public buyer and tenant leads submitted through property listings will appear here.
                  </p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Client</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Property</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnquiries.map((enq) => {
                      const statusStyles = {
                        new: { bg: '#fef8eb', text: '#855302' },
                        contacted: { bg: '#e0f2fe', text: '#0369a1' },
                        in_progress: { bg: '#e0f2fe', text: '#0369a1' },
                        closed: { bg: '#f1f5f9', text: '#64748b' },
                      }[enq.status] || { bg: '#f1f5f9', text: '#64748b' };

                      return (
                        <tr key={enq.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.15s' }}>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: '700', color: 'var(--color-black)' }}>{enq.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{enq.phone}</div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                            <div style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {enq.propertyTitle || 'General Enquiry'}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '100px',
                                backgroundColor: statusStyles.bg,
                                color: statusStyles.text,
                                textTransform: 'uppercase',
                                letterSpacing: '0.4px',
                              }}
                            >
                              {enq.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.78rem' }}>
                            {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Table 2: Recent Properties */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.15rem 1.35rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={17} style={{ color: 'var(--color-yellow-primary)' }} />
                <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
                  Recent Properties
                </h2>
              </div>
              <Link
                to="/admin/properties"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--color-yellow-hover)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                View All <ArrowRight size={13} />
              </Link>
            </div>

            {/* Table Content */}
            <div style={{ flex: 1, overflowX: 'auto' }}>
              {loading ? (
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: '38px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
                  ))}
                </div>
              ) : recentProperties.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <Building size={36} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-black-heading)' }}>
                    No Properties Added Yet
                  </div>
                  <p style={{ fontSize: '0.82rem', maxWidth: '320px', margin: '0.35rem auto 0' }}>
                    Property listings created by administrators will be summarized here.
                  </p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Property</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Price</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProperties.map((prop) => {
                      const statusStyles = {
                        published: { bg: '#dcfce7', text: '#15803d' },
                        draft: { bg: '#fef8eb', text: '#855302' },
                        archived: { bg: '#f1f5f9', text: '#64748b' },
                      }[prop.status] || { bg: '#f1f5f9', text: '#64748b' };

                      return (
                        <tr key={prop.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.15s' }}>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: '700', color: 'var(--color-black)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prop.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                              <span>{prop.location}</span>
                              <span>•</span>
                              <span style={{ textTransform: 'capitalize' }}>{prop.propertyType}</span>
                              {prop.isFeatured && (
                                <span style={{ color: 'var(--color-yellow-hover)', display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontWeight: '800', fontSize: '0.7rem' }}>
                                  ★ Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: 'var(--color-black)' }}>
                            {formatPrice(prop.price, prop.listingType)}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '100px',
                                backgroundColor: statusStyles.bg,
                                color: statusStyles.text,
                                textTransform: 'uppercase',
                                letterSpacing: '0.4px',
                              }}
                            >
                              {prop.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.78rem' }}>
                            {prop.createdAt ? new Date(prop.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Panel 3: Upcoming Follow-ups Schedule */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.15rem 1.35rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={17} style={{ color: 'var(--color-yellow-hover)' }} />
              <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
                Upcoming &amp; Scheduled Follow-ups
              </h2>
            </div>
            <Link
              to="/admin/enquiries"
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: 'var(--color-yellow-hover)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Manage Enquiries <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ flex: 1, overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[1, 2].map((i) => (
                  <div key={i} style={{ height: '38px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
                ))}
              </div>
            ) : upcomingFollowUps.length === 0 ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <Clock size={32} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-black-heading)' }}>
                  No Pending Follow-ups
                </div>
                <p style={{ fontSize: '0.8rem', maxWidth: '320px', margin: '0.25rem auto 0' }}>
                  All follow-up tasks are up to date. Schedule new reminders directly from enquiry details.
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Lead Customer</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Property of Interest</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Assigned Representative</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b' }}>Scheduled Due Date</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#64748b', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingFollowUps.map((fu) => (
                    <tr key={fu.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-black)' }}>{fu.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{fu.phone}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                        <div style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fu.propertyTitle || 'Direct General Inquiry'}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                        <span style={{ fontWeight: '600' }}>{fu.assignedAdminName || 'Unassigned'}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '700', color: fu.isOverdue ? '#dc2626' : '#0f172a' }}>
                          {new Date(fu.nextFollowUpAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {fu.isOverdue && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: '800',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              display: 'inline-block',
                              marginTop: '0.15rem',
                            }}
                          >
                            OVERDUE
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <Link
                          to={`/admin/enquiries/${fu.id}`}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            color: '#0f172a',
                            textDecoration: 'none',
                          }}
                        >
                          View Lead
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
