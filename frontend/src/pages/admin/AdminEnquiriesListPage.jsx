import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  UserCheck,
  Building,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Eye,
  MessageCircle,
} from 'lucide-react';
import {
  getAdminEnquiries,
  getActiveAdmins,
} from '../../services/adminEnquiryService';
import { getAdminProperties } from '../../services/adminPropertyService';
import {
  buildPhoneCallUrl,
  buildWhatsAppUrl,
  buildMailtoUrl,
} from '../../utils/contactHelpers';

function formatDateTime(val) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function isFollowUpOverdue(nextFollowUpAt, status) {
  if (!nextFollowUpAt || status === 'closed') return false;
  const d = new Date(nextFollowUpAt);
  return !Number.isNaN(d.getTime()) && d < new Date();
}

export default function AdminEnquiriesListPage() {
  const { getToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL query parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [assignedFilter, setAssignedFilter] = useState(searchParams.get('assigned_to') || '');
  const [propertyFilter, setPropertyFilter] = useState(searchParams.get('property_id') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data state
  const [enquiries, setEnquiries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dropdown reference dependencies
  const [activeAdmins, setActiveAdmins] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);

  // Load auxiliary reference dropdowns once
  useEffect(() => {
    async function loadAuxiliaryData() {
      try {
        const token = await getToken();
        if (!token) return;
        const [adminsData, propsData] = await Promise.all([
          getActiveAdmins(token).catch(() => []),
          getAdminProperties(token, { limit: 100 }).catch(() => ({ data: [] })),
        ]);
        setActiveAdmins(adminsData);
        setPropertiesList(propsData.data || []);
      } catch (err) {
        console.warn('[AdminEnquiriesListPage] Failed to load auxiliary options:', err);
      }
    }
    loadAuxiliaryData();
  }, [getToken]);

  // Sync state with URL search params
  const updateQueryParam = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value !== undefined && value !== null && String(value).trim() !== '') {
            next.set(key, String(value).trim());
          } else {
            next.delete(key);
          }
          if (key !== 'page') {
            next.set('page', '1');
            setCurrentPage(1);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Fetch enquiries on query parameter changes
  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Admin authentication token is missing.');
      }

      const params = {
        page: currentPage,
        limit: 15,
        search: searchTerm,
        status: statusFilter,
        assigned_to: assignedFilter,
        property_id: propertyFilter,
        date_from: dateFrom,
        date_to: dateTo,
        sort: sortBy,
      };

      const res = await getAdminEnquiries(token, params);
      setEnquiries(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('[AdminEnquiriesListPage] Fetch error:', err);
      setError(err.message || 'Failed to load enquiries list.');
    } finally {
      setLoading(false);
    }
  }, [
    getToken,
    currentPage,
    searchTerm,
    statusFilter,
    assignedFilter,
    propertyFilter,
    dateFrom,
    dateTo,
    sortBy,
  ]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setAssignedFilter('');
    setPropertyFilter('');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const statusBadgeConfig = {
    new: { bg: '#fef8eb', text: '#855302', label: 'New' },
    contacted: { bg: '#e0f2fe', text: '#0369a1', label: 'Contacted' },
    in_progress: { bg: '#ede9fe', text: '#6d28d9', label: 'In Progress' },
    closed: { bg: '#f1f5f9', text: '#64748b', label: 'Closed' },
  };

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: 'var(--color-black-heading)',
              margin: 0,
            }}
          >
            Enquiries &amp; Leads Pipeline
          </h1>
          <p
            style={{
              fontSize: '0.85rem',
              color: '#64748b',
              margin: '0.25rem 0 0',
            }}
          >
            Manage buyer and tenant leads, schedule follow-ups, and track CRM activity.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#475569',
              backgroundColor: '#ffffff',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
            }}
          >
            Total: <strong>{pagination.total}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.85rem',
            alignItems: 'center',
          }}
        >
          {/* Search by Name, Phone, Email */}
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateQueryParam('search', searchTerm)}
              onBlur={() => updateQueryParam('search', searchTerm)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                updateQueryParam('status', e.target.value);
              }}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.84rem',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Assigned Admin Filter */}
          <div>
            <select
              value={assignedFilter}
              onChange={(e) => {
                setAssignedFilter(e.target.value);
                updateQueryParam('assigned_to', e.target.value);
              }}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.84rem',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="">All Assignments</option>
              <option value="unassigned">Unassigned</option>
              {activeAdmins.map((admin) => (
                <option key={admin.clerk_user_id} value={admin.clerk_user_id}>
                  {admin.display_name} ({admin.role})
                </option>
              ))}
            </select>
          </div>

          {/* Property Filter */}
          <div>
            <select
              value={propertyFilter}
              onChange={(e) => {
                setPropertyFilter(e.target.value);
                updateQueryParam('property_id', e.target.value);
              }}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.84rem',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="">All Properties</option>
              {propertiesList.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} — {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From */}
          <div>
            <input
              type="date"
              title="Date From"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                updateQueryParam('date_from', e.target.value);
              }}
              style={{
                width: '100%',
                padding: '0.5rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Date Range: To */}
          <div>
            <input
              type="date"
              title="Date To"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                updateQueryParam('date_to', e.target.value);
              }}
              style={{
                width: '100%',
                padding: '0.5rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Sort Selector */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                updateQueryParam('sort', e.target.value);
              }}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.84rem',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="next_follow_up">Sort: Next Follow-up (Earliest First)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.95rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.85rem 1.15rem',
            borderRadius: '6px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            fontWeight: '600',
          }}
        >
          {error}
        </div>
      )}

      {/* Enquiries Table Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.84rem',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>
                  Customer
                </th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>
                  Property / Interest
                </th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>
                  Status
                </th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>
                  Assigned To
                </th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>
                  Next Follow-up
                </th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>
                  Date
                </th>
                <th
                  style={{
                    padding: '0.85rem 1.1rem',
                    fontWeight: '800',
                    color: '#475569',
                    textAlign: 'right',
                  }}
                >
                  Quick Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center' }}>
                    <Loader2
                      size={28}
                      style={{
                        color: 'var(--color-yellow-primary)',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 0.5rem',
                      }}
                    />
                    <div style={{ color: '#64748b', fontSize: '0.84rem', fontWeight: '600' }}>
                      Loading enquiries...
                    </div>
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '3.5rem 1.5rem',
                      textAlign: 'center',
                      color: '#64748b',
                    }}
                  >
                    <MessageSquare size={38} style={{ color: '#cbd5e1', marginBottom: '0.65rem' }} />
                    <div
                      style={{
                        fontSize: '0.96rem',
                        fontWeight: '800',
                        color: 'var(--color-black-heading)',
                      }}
                    >
                      No Enquiries Found
                    </div>
                    <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                      No buyer or tenant leads matched the specified criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => {
                  const badge = statusBadgeConfig[enq.status] || {
                    bg: '#f1f5f9',
                    text: '#64748b',
                    label: enq.status,
                  };
                  const isOverdue = isFollowUpOverdue(enq.next_follow_up_at, enq.status);

                  return (
                    <tr
                      key={enq.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color 0.15s',
                        backgroundColor: isOverdue ? 'rgba(254, 242, 242, 0.45)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isOverdue
                          ? 'rgba(254, 242, 242, 0.75)'
                          : '#fcfcfd';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isOverdue
                          ? 'rgba(254, 242, 242, 0.45)'
                          : 'transparent';
                      }}
                    >
                      {/* Customer Info */}
                      <td style={{ padding: '0.95rem 1.1rem' }}>
                        <Link
                          to={`/admin/enquiries/${enq.id}`}
                          style={{
                            fontWeight: '800',
                            color: 'var(--color-black-heading)',
                            textDecoration: 'none',
                            fontSize: '0.88rem',
                          }}
                        >
                          {enq.name}
                        </Link>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.15rem',
                            marginTop: '0.2rem',
                            fontSize: '0.76rem',
                            color: '#64748b',
                          }}
                        >
                          <span>{enq.phone}</span>
                          {enq.email && <span>{enq.email}</span>}
                        </div>
                      </td>

                      {/* Property Context */}
                      <td style={{ padding: '0.95rem 1.1rem' }}>
                        {enq.property_title ? (
                          <>
                            <div
                              style={{
                                fontWeight: '700',
                                color: '#1e293b',
                                maxWidth: '240px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={enq.property_title}
                            >
                              {enq.property_title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              {enq.property_location || 'Bengaluru'}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                            General Inquiry
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '0.95rem 1.1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.22rem 0.6rem',
                            borderRadius: '100px',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            backgroundColor: badge.bg,
                            color: badge.text,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Assigned Admin */}
                      <td style={{ padding: '0.95rem 1.1rem' }}>
                        {enq.assigned_admin ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              color: '#334155',
                            }}
                          >
                            <UserCheck size={14} style={{ color: '#0284c7' }} />
                            {enq.assigned_admin.display_name}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              fontStyle: 'italic',
                            }}
                          >
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Next Follow-up & Overdue Warning */}
                      <td style={{ padding: '0.95rem 1.1rem' }}>
                        {enq.next_follow_up_at ? (
                          <div>
                            {isOverdue && (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  backgroundColor: '#fee2e2',
                                  color: '#dc2626',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                  fontSize: '0.68rem',
                                  fontWeight: '800',
                                  textTransform: 'uppercase',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                <AlertTriangle size={11} /> Overdue
                              </div>
                            )}
                            <div
                              style={{
                                fontSize: '0.78rem',
                                fontWeight: isOverdue ? '800' : '600',
                                color: isOverdue ? '#b91c1c' : '#334155',
                              }}
                            >
                              {formatDateTime(enq.next_follow_up_at)}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>—</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td style={{ padding: '0.95rem 1.1rem', color: '#64748b', fontSize: '0.76rem' }}>
                        {formatDateTime(enq.created_at)}
                      </td>

                      {/* Quick Contact & View Action Links */}
                      <td style={{ padding: '0.95rem 1.1rem', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          {/* Call Button */}
                          <a
                            href={buildPhoneCallUrl(enq.phone)}
                            title={`Call ${enq.name}`}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#0f172a',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none',
                            }}
                          >
                            <Phone size={13} />
                          </a>

                          {/* WhatsApp Button */}
                          <a
                            href={buildWhatsAppUrl(enq.phone, {
                              name: enq.name,
                              propertyTitle: enq.property_title,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`WhatsApp message to ${enq.name}`}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#059669',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none',
                            }}
                          >
                            <MessageCircle size={13} />
                          </a>

                          {/* Email Button */}
                          {enq.email && (
                            <a
                              href={buildMailtoUrl(enq.email, {
                                name: enq.name,
                                propertyTitle: enq.property_title,
                              })}
                              title={`Send email to ${enq.email}`}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '4px',
                                backgroundColor: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                color: '#0284c7',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none',
                              }}
                            >
                              <Mail size={13} />
                            </a>
                          )}

                          {/* View Detail Link */}
                          <Link
                            to={`/admin/enquiries/${enq.id}`}
                            title="View Full Enquiry Detail"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '4px',
                              backgroundColor: 'var(--color-brand-walnut)',
                              color: 'var(--color-brand-amber)',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              textDecoration: 'none',
                              marginLeft: '0.25rem',
                            }}
                          >
                            <Eye size={12} /> View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              padding: '0.9rem 1.25rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Showing page <strong>{pagination.page}</strong> of{' '}
              <strong>{pagination.totalPages}</strong> ({pagination.total} leads)
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => {
                  const nextPage = currentPage - 1;
                  setCurrentPage(nextPage);
                  updateQueryParam('page', nextPage);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: currentPage <= 1 ? '#94a3b8' : '#334155',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                type="button"
                disabled={currentPage >= pagination.totalPages || loading}
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  updateQueryParam('page', nextPage);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: currentPage >= pagination.totalPages ? '#94a3b8' : '#334155',
                  cursor: currentPage >= pagination.totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
