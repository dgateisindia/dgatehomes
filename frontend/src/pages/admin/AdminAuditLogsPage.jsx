import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  History,
  RefreshCw,
  Search,
  User,
  Terminal,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  FileText,
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
import { getAdminAuditLogs, getAdminAuditLogFilters } from '../../services/adminAuditLogService';

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

function getActionBadgeVariant(action = '') {
  const upper = action.toUpperCase();
  if (upper.includes('CREATE')) return 'success';
  if (upper.includes('STATUS') || upper.includes('ASSIGN') || upper.includes('UPDATE')) return 'warning';
  if (upper.includes('DELETE') || upper.includes('ARCHIVE') || upper.includes('DEACTIVATE')) return 'danger';
  if (upper.includes('IMAGE') || upper.includes('MEDIA')) return 'info';
  return 'neutral';
}

export default function AdminAuditLogsPage() {
  const { getToken } = useAuth();

  const [logs, setLogs] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ actions: [], entityTypes: [] });
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
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
          const opts = await getAdminAuditLogFilters(token);
          setFilterOptions(opts || { actions: [], entityTypes: [] });
        }
      } catch (err) {
        console.warn('[AdminAuditLogsPage] Could not load distinct filter options:', err.message);
      }
    }
    loadFilters();
  }, [getToken]);

  const fetchLogs = useCallback(
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

        const res = await getAdminAuditLogs(token, {
          action: actionFilter,
          entity_type: entityTypeFilter,
          clerk_user_id: clerkUserFilter,
          request_id: requestIdFilter,
          start_date: startDate,
          end_date: endDate,
          page: currentPage,
          limit: 25,
        });

        setLogs(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('[AdminAuditLogsPage] Fetch error:', err);
        setError(err.message || 'Failed to load audit logs.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      getToken,
      actionFilter,
      entityTypeFilter,
      clerkUserFilter,
      requestIdFilter,
      startDate,
      endDate,
      currentPage,
    ]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setActionFilter('');
    setEntityTypeFilter('');
    setClerkUserFilter('');
    setRequestIdFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    actionFilter || entityTypeFilter || clerkUserFilter || requestIdFilter || startDate || endDate
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
        icon={History}
        title="Audit Activity Logs"
        subtitle="Forensic ledger of administrative actions, entity mutations, and operational updates."
        badgeText="Super Admin"
        badgeColor="#855302"
        badgeBg="#fef8eb"
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
              Total Logs: <strong style={{ color: '#0f172a' }}>{pagination.total}</strong>
            </span>

            <button
              type="button"
              onClick={() => fetchLogs(true)}
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
              <span>{refreshing ? 'Refreshing...' : 'Refresh Logs'}</span>
            </button>
          </div>
        }
      />

      {/* Filter Card */}
      <AdminCard padding="1.15rem 1.35rem">
        <AdminFilterBar
          title="Filter Activity Ledger"
          hasActiveFilters={hasActiveFilters}
          onReset={handleResetFilters}
          columns="repeat(auto-fit, minmax(210px, 1fr))"
        >
          <AdminSelect
            label="Action Type"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="All Action Types"
            options={filterOptions.actions}
          />

          <AdminSelect
            label="Entity Scope"
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="All Entity Scopes"
            options={filterOptions.entityTypes}
          />

          <AdminInput
            label="Clerk User ID"
            icon={User}
            placeholder="e.g. user_2..."
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
      </AdminCard>

      {/* Error State */}
      <AdminErrorState error={error} onRetry={() => fetchLogs()} />

      {/* Main Table Card */}
      <AdminCard padding="0">
        {loading ? (
          <AdminLoadingState message="Retrieving administrative audit logs..." />
        ) : logs.length === 0 ? (
          <AdminEmptyState
            icon={History}
            title="No Activity Logs Found"
            description="There are no recorded admin actions matching your current filter criteria."
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
                <th style={{ padding: '0.85rem 1.15rem' }}>Action</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Entity</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Actor / Admin</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Request ID</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Origin IP</th>
                <th style={{ padding: '0.85rem 1.15rem', textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const isExpanded = expandedId === log.id;
                const badgeVariant = getActionBadgeVariant(log.action);
                const shortReqId = log.request_id ? `${log.request_id.slice(0, 14)}...` : '—';
                const shortClerkId = log.clerk_user_id ? `${log.clerk_user_id.slice(0, 14)}...` : '—';

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => toggleExpand(log.id)}
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
                        {formatDate(log.created_at)}
                      </td>

                      {/* Action Badge */}
                      <td style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap' }}>
                        <AdminBadge variant={badgeVariant}>{log.action}</AdminBadge>
                      </td>

                      {/* Entity */}
                      <td style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>{log.entity_type}</span>
                        {log.entity_id && (
                          <span
                            style={{
                              marginLeft: '0.4rem',
                              color: '#64748b',
                              fontSize: '0.76rem',
                              fontFamily: 'monospace',
                            }}
                          >
                            #{log.entity_id}
                          </span>
                        )}
                      </td>

                      {/* Actor / Admin */}
                      <td style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>
                          {log.admin_display_name || 'System / Admin'}
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
                          title={log.clerk_user_id}
                        >
                          <span>{shortClerkId}</span>
                          {log.clerk_user_id && (
                            <button
                              type="button"
                              onClick={(e) => copyToClipboard(log.clerk_user_id, `clerk-${log.id}`, e)}
                              style={{
                                color: '#94a3b8',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                              }}
                              title="Copy Clerk User ID"
                            >
                              {copiedKey === `clerk-${log.id}` ? (
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
                          title={log.request_id}
                        >
                          <span>{shortReqId}</span>
                          {log.request_id && (
                            <button
                              type="button"
                              onClick={(e) => copyToClipboard(log.request_id, `req-${log.id}`, e)}
                              style={{
                                color: '#94a3b8',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                              }}
                              title="Copy Request ID"
                            >
                              {copiedKey === `req-${log.id}` ? (
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
                        {log.ip_address || '—'}
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

                    {/* Expandable JSON Detail Drawer */}
                    {isExpanded && (
                      <tr style={{ backgroundColor: '#fdfbf7', borderBottom: '1px solid var(--color-border)' }}>
                        <td colSpan={7} style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                            {/* Old Values */}
                            <div
                              style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
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
                                <span>Previous State (old_values)</span>
                                {log.old_values && (
                                  <button
                                    type="button"
                                    onClick={(e) =>
                                      copyToClipboard(JSON.stringify(log.old_values, null, 2), `old-${log.id}`, e)
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
                                    {copiedKey === `old-${log.id}` ? 'Copied' : 'Copy JSON'}
                                  </button>
                                )}
                              </div>
                              {log.old_values ? (
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
                                  {JSON.stringify(log.old_values, null, 2)}
                                </pre>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem 0' }}>
                                  No previous state (initial creation or unrecorded)
                                </span>
                              )}
                            </div>

                            {/* New Values */}
                            <div
                              style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
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
                                <span>Applied State (new_values)</span>
                                {log.new_values && (
                                  <button
                                    type="button"
                                    onClick={(e) =>
                                      copyToClipboard(JSON.stringify(log.new_values, null, 2), `new-${log.id}`, e)
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
                                    {copiedKey === `new-${log.id}` ? 'Copied' : 'Copy JSON'}
                                  </button>
                                )}
                              </div>
                              {log.new_values ? (
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
                                  {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem 0' }}>
                                  No updated state payload recorded
                                </span>
                              )}
                            </div>
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
                                <code style={{ fontFamily: 'monospace' }}>{log.request_id || '—'}</code>
                              </span>
                              <span>
                                <strong style={{ color: '#0f172a' }}>Actor ID:</strong>{' '}
                                <code style={{ fontFamily: 'monospace' }}>{log.clerk_user_id || '—'}</code>
                              </span>
                            </div>

                            {log.user_agent && (
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
                                title={log.user_agent}
                              >
                                User Agent: {log.user_agent}
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
