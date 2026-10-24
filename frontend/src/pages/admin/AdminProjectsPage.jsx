import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  Landmark,
  Search,
  Plus,
  Edit2,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  Loader2,
  CheckCircle2,
  X,
  FileText,
  Archive,
  Eye,
  MapPin,
  Building,
} from 'lucide-react';
import {
  getAdminProjects,
  createAdminProject,
  updateAdminProject,
  updateAdminProjectStatus,
} from '../../services/adminMasterDataService';

const STATUS_CONFIG = {
  draft: { label: 'Draft', bg: '#fef8eb', text: '#855302' },
  published: { label: 'Published', bg: '#dcfce7', text: '#15803d' },
  archived: { label: 'Archived', bg: '#f1f5f9', text: '#64748b' },
};

function formatDate(val) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function AdminProjectsPage() {
  const { getToken } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    launch_date: '',
    possession_date: '',
    status: 'draft',
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication token required.');

      const res = await getAdminProjects(token, {
        search,
        status: statusFilter,
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error('[AdminProjectsPage] Load error:', err);
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [getToken, search, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      address: '',
      launch_date: '',
      possession_date: '',
      status: 'draft',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingItem(p);
    setFormData({
      name: p.name,
      description: p.description || '',
      location: p.location || '',
      address: p.address || '',
      launch_date: p.launch_date ? String(p.launch_date).slice(0, 10) : '',
      possession_date: p.possession_date ? String(p.possession_date).slice(0, 10) : '',
      status: p.status || 'draft',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      setFormError('Project name and location are required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const token = await getToken();
      if (editingItem) {
        const res = await updateAdminProject(token, editingItem.id, formData);
        setSuccessBanner(`Project "${res.data.name}" updated successfully.`);
      } else {
        const res = await createAdminProject(token, formData);
        setSuccessBanner(`Project "${res.data.name}" created successfully.`);
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      setFormError(err.message || 'Failed to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusTransition = async (projectId, newStatus) => {
    setError(null);
    try {
      const token = await getToken();
      const res = await updateAdminProjectStatus(token, projectId, newStatus);
      setSuccessBanner(`Project status updated to ${newStatus.toUpperCase()}.`);
      fetchProjects();
    } catch (err) {
      setError(err.message || 'Failed to update project status.');
    }
  };

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
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
            Developer Projects Directory
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0' }}>
            Manage master-planned real estate projects, launch schedules, and unit inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.15rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'var(--color-black-heading)',
            color: 'var(--color-yellow-primary)',
            fontSize: '0.84rem',
            fontWeight: '800',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add Project
        </button>
      </div>

      {/* Notifications */}
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
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: '800' }}
          >
            ✕
          </button>
        </div>
      )}

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

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '1.15rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search project name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="">All Project Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('');
            }}
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
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Table Card */}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>Project &amp; Location</th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>Status</th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>Timeline</th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>Unit Types</th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>Properties</th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3.5rem', textAlign: 'center' }}>
                    <Loader2
                      size={26}
                      style={{ color: 'var(--color-yellow-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }}
                    />
                    <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: '600' }}>Loading projects...</div>
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                    <Landmark size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--color-black-heading)' }}>
                      No Projects Found
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((p) => {
                  const statusInfo = STATUS_CONFIG[p.status] || {
                    label: p.status,
                    bg: '#f1f5f9',
                    text: '#64748b',
                  };

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '0.95rem 1.1rem' }}>
                        <Link
                          to={`/admin/projects/${p.id}`}
                          style={{
                            fontWeight: '800',
                            color: 'var(--color-black-heading)',
                            fontSize: '0.88rem',
                            textDecoration: 'none',
                          }}
                        >
                          {p.name}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                          <MapPin size={12} /> {p.location}
                        </div>
                      </td>

                      <td style={{ padding: '0.95rem 1.1rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '100px',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.text,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      <td style={{ padding: '0.95rem 1.1rem', fontSize: '0.76rem', color: '#475569' }}>
                        <div>Launch: <strong>{formatDate(p.launch_date)}</strong></div>
                        <div style={{ marginTop: '0.15rem' }}>Possession: <strong>{formatDate(p.possession_date)}</strong></div>
                      </td>

                      <td style={{ padding: '0.95rem 1.1rem' }}>
                        <Link
                          to={`/admin/projects/${p.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.76rem',
                            fontWeight: '700',
                            color: '#0284c7',
                            textDecoration: 'none',
                          }}
                        >
                          <Layers size={13} /> {p.unit_types_count} Unit Types
                        </Link>
                      </td>

                      <td style={{ padding: '0.95rem 1.1rem', fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>
                        {p.properties_count}
                      </td>

                      <td style={{ padding: '0.95rem 1.1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Project Details"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '4px',
                              border: '1px solid var(--color-border)',
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={12} /> Edit
                          </button>

                          {/* Quick Publish / Move to Draft button */}
                          {p.status !== 'published' ? (
                            <button
                              type="button"
                              onClick={() => handleStatusTransition(p.id, 'published')}
                              title="Publish Project"
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: '4px',
                                border: '1px solid #bbf7d0',
                                backgroundColor: '#f0fdf4',
                                color: '#16a34a',
                                fontSize: '0.74rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Publish
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStatusTransition(p.id, 'draft')}
                              title="Move to Draft"
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: '4px',
                                border: '1px solid #fde68a',
                                backgroundColor: '#fef8eb',
                                color: '#855302',
                                fontSize: '0.74rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Draft
                            </button>
                          )}

                          <Link
                            to={`/admin/projects/${p.id}`}
                            title="Manage Project & Unit Types"
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
                            }}
                          >
                            <Eye size={12} /> Open <ArrowRight size={11} />
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
      </div>

      {/* Add / Edit Project Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '560px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
                {editingItem ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Project Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dgate Signature Meadows"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Micro-Market / Location <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hebbal, Bengaluru"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
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
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot 108, Outer Ring Road, Hebbal"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
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
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe master plan vision, architect, total land area, and luxury amenities..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Launch Date
                  </label>
                  <input
                    type="date"
                    value={formData.launch_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, launch_date: e.target.value }))}
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
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Possession Date
                  </label>
                  <input
                    type="date"
                    value={formData.possession_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, possession_date: e.target.value }))}
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
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '0.55rem 0.95rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--color-black-heading)',
                    color: 'var(--color-yellow-primary)',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Saving...' : editingItem ? 'Save Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
