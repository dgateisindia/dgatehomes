import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  RefreshCw,
  Search,
  User,
  Terminal,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import {
  AdminPageContainer,
  AdminPageHeader,
  AdminCard,
  AdminFilterBar,
  AdminInput,
  AdminSelect,
  AdminDateInput,
  AdminTable,
  AdminBadge,
  AdminEmptyState,
  AdminLoadingState,
  AdminErrorState,
} from '../../components/admin/ui';
import {
  getAdminSecurityEvents,
  getAdminSecurityEventFilters,
} from '../../services/adminSecurityEventService';

function formatDate(val) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

function getSeverityBadgeProps(severity = 'info') {
  switch (severity.toLowerCase()) {
    case 'critical':
      return { variant: 'critical', icon: ShieldAlert, label: 'CRITICAL' };
    case 'warning':
      return { variant: 'warning', icon: AlertTriangle, label: 'WARNING' };
    default:
      return { variant: 'info', icon: Info, label: 'INFO' };
  }
}

export default function AdminSecurityEventsPage() {
  const { getToken } = useAuth();

  const [events, setEvents] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ eventTypes: [], severities: [] });
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [clerkUserFilter, setClerkUserFilter] = useState('');
  const [requestIdFilter, setRequestIdFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load distinct filter options on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const token = await getToken();
        if (token) {
          const opts = await getAdminSecurityEventFilters(token);
          setFilterOptions(opts || { eventTypes: [], severities: [] });
        }
      } catch (err) {
        console.warn('[AdminSecurityEventsPage] Could not load filter options:', err.message);
      }
    }
    loadFilters();
  }, [getToken]);

  const fetchEvents = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error('Authentication token required.');

        const res = await getAdminSecurityEvents(token, {
          severity: severityFilter,
          event_type: eventTypeFilter,
          clerk_user_id: clerkUserFilter,
          request_id: requestIdFilter,
          start_date: startDate,
          end_date: endDate,
          page: currentPage,
          limit: 25,
        });

        setEvents(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('[AdminSecurityEventsPage] Fetch error:', err);
        setError(err.message || 'Failed to load security events.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      getToken,
      severityFilter,
      eventTypeFilter,
      clerkUserFilter,
      requestIdFilter,
      startDate,
      endDate,
      currentPage,
    ]
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleResetFilters = () => {
    setSeverityFilter('');
    setEventTypeFilter('');
    setClerkUserFilter('');
    setRequestIdFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    severityFilter || eventTypeFilter || clerkUserFilter || requestIdFilter || startDate || endDate
  );

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const copyToClipboard = (text, key, e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <AdminPageContainer>
      {/* Page Header */}
      <AdminPageHeader
        icon={ShieldAlert}
        title="Security Event Telemetry"
        subtitle="Forensic logging of access violations, unauthorized attempts, and threat monitoring."
        badgeText="Super Admin"
        badgeColor="#b91c1c"
        badgeBg="#fee2e2"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#475569',
                backgroundColor: '#ffffff',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
              }}
            >
              Incidents Logged: <strong style={{ color: '#0f172a' }}>{pagination.total}</strong>
            </span>

            <button
              type="button"
              onClick={() => fetchEvents(true)}
              disabled={loading || refreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: 'var(--color-black-heading)',
                cursor: loading || refreshing ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'background-color 0.15s ease',
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
              <span>{refreshing ? 'Refreshing...' : 'Refresh Events'}</span>
            </button>
          </div>
        }
      />

      {/* Filter Card */}
      <AdminCard padding="1.15rem 1.35rem">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Severity Pills Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginRight: '0.35rem' }}>
                Severity:
              </span>
              {[
                { key: '', label: 'All Severities' },
                { key: 'info', label: 'Info' },
                { key: 'warning', label: 'Warning' },
                { key: 'critical', label: 'Critical' },
              ].map((pill) => {
                const isSelected = severityFilter === pill.key;
                return (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => {
                      setSeverityFilter(pill.key);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #0f172a' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  color: 'var(--color-yellow-hover)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Detailed Inputs Grid */}
          <AdminFilterBar
            title="Search Event Parameters"
            hasActiveFilters={false}
            columns="repeat(auto-fit, minmax(210px, 1fr))"
          >
            <AdminInput
              label="Event Type"
              placeholder="e.g. UNAUTHORIZED..."
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            />

            <AdminInput
              label="Clerk User ID"
              icon={User}
              placeholder="e.g. user_..."
              value={clerkUserFilter}
              onChange={(e) => {
                setClerkUserFilter(e.target.value);
                setCurrentPage(1);
              }}
            />

            <AdminInput
              label="Request ID"
              icon={Terminal}
              placeholder="e.g. req_..."
              value={requestIdFilter}
              onChange={(e) => {
                setRequestIdFilter(e.target.value);
                setCurrentPage(1);
              }}
            />

            <AdminDateInput
              label="From Date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />

            <AdminDateInput
              label="To Date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </AdminFilterBar>
        </div>
      </AdminCard>

      {/* Error State */}
      <AdminErrorState error={error} onRetry={() => fetchEvents()} />

      {/* Main Table Card */}
      <AdminCard padding="0">
        {loading ? (
          <AdminLoadingState message="Retrieving security telemetry events..." />
        ) : events.length === 0 ? (
          <AdminEmptyState
            icon={ShieldCheck}
            title="No Security Incidents Found"
            description="All platform operations appear secure with no flagged access attempts in this time window."
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    padding: '0.45rem 0.95rem',
                    backgroundColor: 'var(--color-yellow-primary)',
                    color: '#0f172a',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Clear Filters
                </button>
              ) : null
            }
          />
        ) : (
          <AdminTable
            pagination={pagination}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            loading={loading}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid var(--color-border)',
                  color: '#64748b',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                <th style={{ padding: '0.85rem 1.15rem' }}>Timestamp</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Severity</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Event Type</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>User / Actor</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Request ID</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Origin IP</th>
                <th style={{ padding: '0.85rem 1.15rem', textAlign: 'right' }}>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => {
                const isExpanded = expandedId === evt.id;
                const sevProps = getSeverityBadgeProps(evt.severity);
                const shortReqId = evt.request_id ? `${evt.request_id.slice(0, 14)}...` : '—';
                const shortClerkId = evt.clerk_user_id ? `${evt.clerk_user_id.slice(0, 14)}...` : '—';

                return (
                  <React.Fragment key={evt.id}>
                    <tr
                      onClick={() => toggleExpand(evt.id)}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: isExpanded ? '#fef8eb' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isExpanded) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isExpanded) e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      {/* Timestamp */}
                      <td style={{ padding: '0.9rem 1.15rem', color: '#475569', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                        {formatDate(evt.created_at)}
                      </td>

                      {/* Severity Badge */}
                      <td style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap' }}>
                        <AdminBadge variant={sevProps.variant} icon={sevProps.icon}>
                          {sevProps.label}
                        </AdminBadge>
                      </td>

                      {/* Event Type */}
                      <td style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontWeight: '700',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            color: '#0f172a',
                          }}
                        >
                          {evt.event_type}
                        </span>
                      </td>

                      {/* User / Actor */}
                      <td style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>
                          {evt.admin_display_name || 'Anonymous / Unregistered'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.74rem',
                            color: '#94a3b8',
                            fontFamily: 'monospace',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                          title={evt.clerk_user_id}
                        >
                          <span>{shortClerkId}</span>
                          {evt.clerk_user_id && (
                            <button
                              type="button"
                              onClick={(e) => copyToClipboard(evt.clerk_user_id, `clerk-${evt.id}`, e)}
                              style={{
                                color: '#94a3b8',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                              }}
                              title="Copy Clerk User ID"
                            >
                              {copiedKey === `clerk-${evt.id}` ? (
                                <CheckCircle2 size={11} style={{ color: '#16a34a' }} />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Request ID */}
                      <td style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontFamily: 'monospace',
                            fontSize: '0.78rem',
                            color: '#64748b',
                          }}
                          title={evt.request_id}
                        >
                          <span>{shortReqId}</span>
                          {evt.request_id && (
                            <button
                              type="button"
                              onClick={(e) => copyToClipboard(evt.request_id, `req-${evt.id}`, e)}
                              style={{
                                color: '#94a3b8',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                              }}
                              title="Copy Request ID"
                            >
                              {copiedKey === `req-${evt.id}` ? (
                                <CheckCircle2 size={11} style={{ color: '#16a34a' }} />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Origin IP */}
                      <td style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>
                        {evt.ip_address || '—'}
                      </td>

                      {/* Expand Toggle */}
                      <td style={{ padding: '0.9rem 1.15rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.3rem 0.55rem',
                            backgroundColor: isExpanded ? 'var(--color-yellow-light)' : '#f1f5f9',
                            color: isExpanded ? '#92400e' : '#475569',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable JSON Metadata Drawer */}
                    {isExpanded && (
                      <tr style={{ backgroundColor: '#fdfbf7', borderBottom: '1px solid var(--color-border)' }}>
                        <td colSpan={7} style={{ padding: '1.25rem 1.5rem' }}>
                          <div
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid var(--color-border)',
                              borderRadius: '8px',
                              padding: '1rem',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                color: '#64748b',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>Incident Metadata Payload</span>
                              {evt.metadata && (
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    copyToClipboard(JSON.stringify(evt.metadata, null, 2), `meta-${evt.id}`, e)
                                  }
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                  }}
                                >
                                  {copiedKey === `meta-${evt.id}` ? 'Copied' : 'Copy JSON'}
                                </button>
                              )}
                            </div>
                            {evt.metadata ? (
                              <pre
                                style={{
                                  margin: 0,
                                  fontSize: '0.76rem',
                                  fontFamily: 'monospace',
                                  color: '#0f172a',
                                  backgroundColor: '#f8fafc',
                                  padding: '0.75rem',
                                  borderRadius: '6px',
                                  maxHeight: '220px',
                                  overflowY: 'auto',
                                  lineHeight: 1.5,
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {JSON.stringify(evt.metadata, null, 2)}
                              </pre>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem 0' }}>
                                No custom telemetry payload provided
                              </span>
                            )}
                          </div>

                          {/* Client Telemetry Bar */}
                          <div
                            style={{
                              marginTop: '1rem',
                              padding: '0.65rem 0.85rem',
                              backgroundColor: '#ffffff',
                              borderRadius: '6px',
                              border: '1px solid var(--color-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '0.75rem',
                              fontSize: '0.75rem',
                              color: '#64748b',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                              <span>
                                <strong style={{ color: '#0f172a' }}>Full Request ID:</strong>{' '}
                                <code style={{ fontFamily: 'monospace' }}>{evt.request_id || '—'}</code>
                              </span>
                              <span>
                                <strong style={{ color: '#0f172a' }}>Origin IP:</strong>{' '}
                                <code style={{ fontFamily: 'monospace' }}>{evt.ip_address || '—'}</code>
                              </span>
                            </div>

                            {evt.user_agent && (
                              <div
                                style={{
                                  maxWidth: '480px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontFamily: 'monospace',
                                  fontSize: '0.72rem',
                                  color: '#64748b',
                                }}
                                title={evt.user_agent}
                              >
                                User Agent: {evt.user_agent}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </AdminTable>
        )}
      </AdminCard>
    </AdminPageContainer>
  );
}
