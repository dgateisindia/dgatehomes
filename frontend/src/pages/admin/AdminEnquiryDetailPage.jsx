import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  FileText,
  Send,
  MessageSquare,
  MessageCircle,
  ExternalLink,
  Loader2,
  ShieldAlert,
  Archive,
  RefreshCw,
  PlusCircle,
  Star,
} from 'lucide-react';
import {
  getAdminEnquiryById,
  updateAdminEnquiryStatus,
  assignAdminEnquiry,
  addAdminEnquiryFollowUp,
  addAdminEnquiryNote,
  getActiveAdmins,
} from '../../services/adminEnquiryService';
import {
  buildPhoneCallUrl,
  buildWhatsAppUrl,
  buildMailtoUrl,
} from '../../utils/contactHelpers';
import { formatPrice } from '../../utils/formatters';

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

function toDatetimeLocal(val) {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '';
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export default function AdminEnquiryDetailPage() {
  const { id } = useParams();
  const { getToken } = useAuth();

  const [data, setData] = useState(null);
  const [activeAdmins, setActiveAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // Form states for workflow actions
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });
  const [assignForm, setAssignForm] = useState({ assigned_to_clerk_user_id: '', note: '' });
  const [followUpForm, setFollowUpForm] = useState({ next_follow_up_at: '', note: '' });
  const [noteContent, setNoteContent] = useState('');

  // Submitting states
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  const loadEnquiry = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication token is required.');

      const [enquiryBundle, adminsList] = await Promise.all([
        getAdminEnquiryById(token, id),
        getActiveAdmins(token).catch(() => []),
      ]);

      setData(enquiryBundle);
      setActiveAdmins(adminsList);

      if (enquiryBundle?.enquiry) {
        setStatusForm({
          status: enquiryBundle.enquiry.status,
          note: '',
        });
        setAssignForm({
          assigned_to_clerk_user_id:
            enquiryBundle.enquiry.assigned_to_clerk_user_id || '',
          note: '',
        });
        setFollowUpForm({
          next_follow_up_at: toDatetimeLocal(enquiryBundle.enquiry.next_follow_up_at),
          note: '',
        });
      }
    } catch (err) {
      console.error('[AdminEnquiryDetailPage] Load error:', err);
      setError(err.message || 'Failed to load enquiry details.');
    } finally {
      setLoading(false);
    }
  }, [getToken, id]);

  useEffect(() => {
    loadEnquiry();
  }, [loadEnquiry]);

  // Handlers for workflow actions
  const handleUpdateStatus = async (targetStatus = null) => {
    const finalStatus = targetStatus || statusForm.status;
    if (!finalStatus) return;

    setSubmittingStatus(true);
    setError(null);
    setSuccessBanner(null);

    try {
      const token = await getToken();
      const updated = await updateAdminEnquiryStatus(token, id, {
        status: finalStatus,
        note: statusForm.note.trim() || undefined,
      });

      setData(updated.data);
      setStatusForm((prev) => ({ ...prev, status: finalStatus, note: '' }));
      setSuccessBanner(`Enquiry status updated to ${finalStatus.toUpperCase()}.`);
    } catch (err) {
      setError(err.message || 'Failed to update enquiry status.');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    if (!assignForm.assigned_to_clerk_user_id) return;

    setSubmittingAssign(true);
    setError(null);
    setSuccessBanner(null);

    try {
      const token = await getToken();
      const updated = await assignAdminEnquiry(token, id, {
        assigned_to_clerk_user_id: assignForm.assigned_to_clerk_user_id,
        note: assignForm.note.trim() || undefined,
      });

      setData(updated.data);
      setAssignForm((prev) => ({ ...prev, note: '' }));
      setSuccessBanner('Enquiry successfully assigned.');
    } catch (err) {
      setError(err.message || 'Failed to assign enquiry.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpForm.next_follow_up_at) return;

    setSubmittingFollowUp(true);
    setError(null);
    setSuccessBanner(null);

    try {
      const token = await getToken();
      const updated = await addAdminEnquiryFollowUp(token, id, {
        next_follow_up_at: followUpForm.next_follow_up_at,
        note: followUpForm.note.trim() || undefined,
      });

      setData(updated.data);
      setFollowUpForm((prev) => ({ ...prev, note: '' }));
      setSuccessBanner('Next follow-up successfully scheduled.');
    } catch (err) {
      setError(err.message || 'Failed to schedule follow-up.');
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSubmittingNote(true);
    setError(null);
    setSuccessBanner(null);

    try {
      const token = await getToken();
      const updated = await addAdminEnquiryNote(token, id, {
        note: noteContent.trim(),
      });

      setData(updated.data);
      setNoteContent('');
      setSuccessBanner('Internal note added to activity timeline.');
    } catch (err) {
      setError(err.message || 'Failed to add note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.85rem',
        }}
      >
        <Loader2
          size={32}
          style={{
            color: 'var(--color-yellow-primary)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>
          Loading enquiry #{id} details...
        </span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Link
          to="/admin/enquiries"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '1rem',
          }}
        >
          <ArrowLeft size={15} /> Back to Enquiries
        </Link>
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '1.25rem',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 0.4rem' }}>
            Enquiry Not Found
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  const enquiry = data.enquiry;
  const property = data.property;
  const assignedAdmin = data.assignedAdmin;
  const activities = data.activities || [];

  const isOverdue =
    enquiry.next_follow_up_at &&
    enquiry.status !== 'closed' &&
    new Date(enquiry.next_follow_up_at) < new Date();

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    padding: '1.35rem 1.5rem',
    marginBottom: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
  };

  const statusBadgeConfig = {
    new: { bg: '#fef8eb', text: '#855302', label: 'New Lead' },
    contacted: { bg: '#e0f2fe', text: '#0369a1', label: 'Contacted' },
    in_progress: { bg: '#ede9fe', text: '#6d28d9', label: 'In Progress' },
    closed: { bg: '#f1f5f9', text: '#64748b', label: 'Closed' },
  };

  const badge = statusBadgeConfig[enquiry.status] || {
    bg: '#f1f5f9',
    text: '#64748b',
    label: enquiry.status,
  };

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Quick Actions Header */}
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
          <Link
            to="/admin/enquiries"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#64748b',
              textDecoration: 'none',
              marginBottom: '0.4rem',
            }}
          >
            <ArrowLeft size={14} /> Back to Enquiries Pipeline
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: '900',
                color: 'var(--color-black-heading)',
                margin: 0,
              }}
            >
              Enquiry #{enquiry.id}: {enquiry.name}
            </h1>

            <span
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                backgroundColor: badge.bg,
                color: badge.text,
              }}
            >
              {badge.label}
            </span>

            {isOverdue && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '100px',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                }}
              >
                <AlertTriangle size={12} /> Overdue Follow-up
              </span>
            )}
          </div>
        </div>

        {/* Quick Close / Reopen Header Button */}
        <div>
          {enquiry.status !== 'closed' ? (
            <button
              type="button"
              disabled={submittingStatus}
              onClick={() => handleUpdateStatus('closed')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: submittingStatus ? 'not-allowed' : 'pointer',
              }}
            >
              <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
              Close Enquiry
            </button>
          ) : (
            <button
              type="button"
              disabled={submittingStatus}
              onClick={() => handleUpdateStatus('in_progress')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: '1px solid var(--color-brand-accent)',
                backgroundColor: 'rgba(249, 179, 24, 0.16)',
                color: '#825a05',
                fontSize: '0.82rem',
                fontWeight: '800',
                cursor: submittingStatus ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={14} />
              Reopen Enquiry
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '0.85rem 1.15rem',
            borderRadius: '6px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            fontWeight: '600',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={17} />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontWeight: '800',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Notification */}
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

      {/* Main 2-Column Grid: Left (Customer & Actions), Right (Property & Timeline) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Column 1: Customer Profile & Workflow Actions */}
        <div>
          {/* Customer Profile Card with Contact Links */}
          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.65rem',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <User size={18} style={{ color: 'var(--color-yellow-primary)' }} />
              <h2
                style={{
                  fontSize: '1.05rem',
                  fontWeight: '800',
                  color: 'var(--color-black-heading)',
                  margin: 0,
                }}
              >
                Customer Contact &amp; Details
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                  Full Name
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--color-black-heading)' }}>
                  {enquiry.name}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                  Phone Number
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1e293b' }}>
                  {enquiry.phone}
                </div>
              </div>

              {enquiry.email && (
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                    Email Address
                  </span>
                  <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1e293b' }}>
                    {enquiry.email}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                    Lead Source
                  </span>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>
                    {enquiry.source || 'Website'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                    Created Date
                  </span>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>
                    {formatDateTime(enquiry.created_at)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                    First Contacted
                  </span>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>
                    {formatDateTime(enquiry.first_contacted_at)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                    Last Activity
                  </span>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>
                    {formatDateTime(enquiry.last_activity_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Centralized Action Buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.6rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <a
                href={buildPhoneCallUrl(enquiry.phone)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-brand-walnut)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                }}
              >
                <Phone size={14} style={{ color: 'var(--color-yellow-primary)' }} />
                Call
              </a>

              <a
                href={buildWhatsAppUrl(enquiry.phone, {
                  name: enquiry.name,
                  propertyTitle: property?.title,
                })}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem',
                  borderRadius: '6px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>

              <a
                href={enquiry.email ? buildMailtoUrl(enquiry.email, {
                  name: enquiry.name,
                  propertyTitle: property?.title,
                }) : '#'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem',
                  borderRadius: '6px',
                  backgroundColor: enquiry.email ? '#0284c7' : '#e2e8f0',
                  color: enquiry.email ? '#ffffff' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  pointerEvents: enquiry.email ? 'auto' : 'none',
                }}
              >
                <Mail size={14} />
                Email
              </a>
            </div>
          </div>

          {/* Customer Message Box */}
          {enquiry.message && (
            <div style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  marginBottom: '0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  color: '#64748b',
                  textTransform: 'uppercase',
                }}
              >
                <MessageSquare size={14} />
                Inquiry Message Submitted by Customer
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  color: '#1e293b',
                  backgroundColor: '#f8fafc',
                  padding: '0.85rem 1rem',
                  borderRadius: '6px',
                  borderLeft: '3px solid var(--color-yellow-primary)',
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{enquiry.message}&rdquo;
              </p>
            </div>
          )}

          {/* Workflow Action 1: Status Transition */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: '0.94rem',
                fontWeight: '800',
                color: 'var(--color-black-heading)',
                margin: '0 0 0.85rem',
              }}
            >
              Update Lead Status
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>
                  Target Status
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>
                  Transition Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spoke with client, requested brochure"
                  value={statusForm.note}
                  onChange={(e) => setStatusForm((prev) => ({ ...prev, note: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="button"
                disabled={submittingStatus || statusForm.status === enquiry.status}
                onClick={() => handleUpdateStatus()}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--color-black-heading)',
                  color: 'var(--color-yellow-primary)',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: submittingStatus || statusForm.status === enquiry.status ? 'not-allowed' : 'pointer',
                  opacity: statusForm.status === enquiry.status ? 0.6 : 1,
                }}
              >
                {submittingStatus ? 'Updating Status...' : 'Apply Status Change'}
              </button>
            </div>
          </div>

          {/* Workflow Action 2: Admin Assignment */}
          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.85rem',
              }}
            >
              <h3
                style={{
                  fontSize: '0.94rem',
                  fontWeight: '800',
                  color: 'var(--color-black-heading)',
                  margin: 0,
                }}
              >
                Assign Administrator
              </h3>
              {assignedAdmin && (
                <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: '700' }}>
                  Current: {assignedAdmin.display_name}
                </span>
              )}
            </div>

            <form onSubmit={handleAssignAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>
                  Assign To
                </label>
                <select
                  required
                  value={assignForm.assigned_to_clerk_user_id}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, assigned_to_clerk_user_id: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                >
                  <option value="">Select an active administrator</option>
                  {activeAdmins.map((admin) => (
                    <option key={admin.clerk_user_id} value={admin.clerk_user_id}>
                      {admin.display_name} ({admin.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>
                  Assignment Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead assigned for premium luxury villa walkthrough"
                  value={assignForm.note}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, note: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingAssign || !assignForm.assigned_to_clerk_user_id}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--color-brand-walnut)',
                  color: 'var(--color-brand-accent)',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: submittingAssign || !assignForm.assigned_to_clerk_user_id ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingAssign ? 'Assigning...' : 'Save Assignment'}
              </button>
            </form>
          </div>

          {/* Workflow Action 3: Schedule Follow-up */}
          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.85rem',
              }}
            >
              <h3
                style={{
                  fontSize: '0.94rem',
                  fontWeight: '800',
                  color: 'var(--color-black-heading)',
                  margin: 0,
                }}
              >
                Schedule Follow-up
              </h3>
              {enquiry.next_follow_up_at && (
                <span
                  style={{
                    fontSize: '0.73rem',
                    fontWeight: '700',
                    color: isOverdue ? '#dc2626' : '#334155',
                  }}
                >
                  {isOverdue ? 'Overdue: ' : 'Scheduled: '}
                  {formatDateTime(enquiry.next_follow_up_at)}
                </span>
              )}
            </div>

            <form onSubmit={handleScheduleFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>
                  Next Follow-up Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={followUpForm.next_follow_up_at}
                  onChange={(e) => setFollowUpForm((prev) => ({ ...prev, next_follow_up_at: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>
                  Follow-up Agenda / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call to discuss payment schedule and loan eligibility"
                  value={followUpForm.note}
                  onChange={(e) => setFollowUpForm((prev) => ({ ...prev, note: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingFollowUp || !followUpForm.next_follow_up_at}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--color-brand-walnut)',
                  color: 'var(--color-brand-accent)',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: submittingFollowUp || !followUpForm.next_follow_up_at ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingFollowUp ? 'Saving Schedule...' : 'Schedule Follow-up'}
              </button>
            </form>
          </div>

          {/* Workflow Action 4: Add Internal Note */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: '0.94rem',
                fontWeight: '800',
                color: 'var(--color-black-heading)',
                margin: '0 0 0.85rem',
              }}
            >
              Add Internal CRM Note
            </h3>

            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                required
                rows={3}
                placeholder="Write an internal note about client requirements, negotiations, or preferences..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />

              <button
                type="submit"
                disabled={submittingNote || !noteContent.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--color-brand-walnut)',
                  color: 'var(--color-brand-accent)',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: submittingNote || !noteContent.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                <PlusCircle size={14} />
                {submittingNote ? 'Saving Note...' : 'Add Note to Timeline'}
              </button>
            </form>
          </div>
        </div>

        {/* Column 2: Associated Property Context & Activity Timeline */}
        <div>
          {/* Associated Property Summary Card */}
          {property ? (
            <div style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.85rem',
                  paddingBottom: '0.65rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <Building size={18} style={{ color: 'var(--color-yellow-primary)' }} />
                <h2
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: '800',
                    color: 'var(--color-black-heading)',
                    margin: 0,
                  }}
                >
                  Property Details &amp; Context
                </h2>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: '900',
                    color: 'var(--color-black-heading)',
                    margin: '0 0 0.25rem',
                  }}
                >
                  {property.title}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  {property.location}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.45rem',
                    fontSize: '1.25rem',
                    fontWeight: '900',
                    color: 'var(--color-black-heading)',
                    marginBottom: '0.85rem',
                  }}
                >
                  {formatPrice(property.price, property.listing_type)}
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                    ({property.listing_type === 'rent' ? 'For Rent' : 'For Sale'})
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: '0.6rem',
                    backgroundColor: '#f8fafc',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b' }}>Type:</span>{' '}
                    <strong>{property.property_type || 'Residential'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>BHK:</span>{' '}
                    <strong>{property.bedrooms ? `${property.bedrooms} BHK` : '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Area:</span>{' '}
                    <strong>{property.area ? `${property.area} ${property.area_unit}` : '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Status:</span>{' '}
                    <strong style={{ textTransform: 'capitalize' }}>{property.status}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <Link
                    to={`/admin/properties/${property.id}/edit`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      textDecoration: 'none',
                    }}
                  >
                    Edit Property in Admin
                  </Link>

                  {property.slug && (
                    <Link
                      to={`/properties/${property.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.8rem',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                      }}
                    >
                      View Live Listing <ExternalLink size={12} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={cardStyle}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                This is a general inquiry not tied to a specific property listing.
              </div>
            </div>
          )}

          {/* Full Enquiry Activity Timeline */}
          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.65rem',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <Clock size={18} style={{ color: 'var(--color-yellow-primary)' }} />
              <h2
                style={{
                  fontSize: '1.05rem',
                  fontWeight: '800',
                  color: 'var(--color-black-heading)',
                  margin: 0,
                }}
              >
                Activity Timeline ({activities.length})
              </h2>
            </div>

            {activities.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.82rem', padding: '1rem 0' }}>
                No activity records found.
              </div>
            ) : (
              <div
                style={{
                  position: 'relative',
                  paddingLeft: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {/* Timeline vertical line */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    bottom: '8px',
                    left: '7px',
                    width: '2px',
                    backgroundColor: '#e2e8f0',
                  }}
                />

                {activities.map((act) => {
                  return (
                    <div
                      key={act.id}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                      }}
                    >
                      {/* Timeline dot */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '-1.5rem',
                          top: '3px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor:
                            act.activity_type === 'created'
                              ? 'var(--color-yellow-primary)'
                              : act.activity_type === 'closed'
                              ? '#64748b'
                              : act.activity_type === 'follow_up_added'
                              ? '#0284c7'
                              : '#16a34a',
                          border: '2px solid #ffffff',
                          boxShadow: '0 0 0 2px #e2e8f0',
                        }}
                      />

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          flexWrap: 'wrap',
                          gap: '0.4rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            color: 'var(--color-black-heading)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {act.activity_type.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {formatDateTime(act.created_at)}
                        </span>
                      </div>

                      {/* Actor Badge */}
                      <div style={{ fontSize: '0.73rem', color: '#64748b' }}>
                        By: <strong>{act.actor_display_name}</strong>
                      </div>

                      {/* Status Transition Badge (if present) */}
                      {act.new_status && (
                        <div style={{ marginTop: '0.2rem' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              textTransform: 'uppercase',
                            }}
                          >
                            {act.old_status ? `${act.old_status} → ${act.new_status}` : act.new_status}
                          </span>
                        </div>
                      )}

                      {/* Note Content */}
                      {act.note && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#334155',
                            backgroundColor: '#f8fafc',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '4px',
                            marginTop: '0.25rem',
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          {act.note}
                        </div>
                      )}

                      {/* Scheduled Follow-up info */}
                      {act.next_follow_up_at && (
                        <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: '700', marginTop: '0.2rem' }}>
                          Target Date: {formatDateTime(act.next_follow_up_at)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
