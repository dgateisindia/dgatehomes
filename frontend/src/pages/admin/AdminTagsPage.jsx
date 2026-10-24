import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Tag as TagIcon,
  Search,
  Plus,
  Edit2,
  Power,
  RotateCcw,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  getAdminTags,
  createAdminTag,
  updateAdminTag,
  toggleAdminTagStatus,
} from '../../services/adminMasterDataService';

export default function AdminTagsPage() {
  const { getToken } = useAuth();

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sort_order: 0,
    is_active: true,
  });

  // Confirmation modal for status deactivation
  const [confirmToggleItem, setConfirmToggleItem] = useState(null);
  const [toggling, setToggling] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication token required.');

      const res = await getAdminTags(token, {
        search,
        is_active: statusFilter,
      });
      setTags(res.data || []);
    } catch (err) {
      console.error('[AdminTagsPage] Load error:', err);
      setError(err.message || 'Failed to load property tags.');
    } finally {
      setLoading(false);
    }
  }, [getToken, search, statusFilter]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      slug: '',
      sort_order: 0,
      is_active: true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug || '',
      sort_order: item.sort_order || 0,
      is_active: Boolean(item.is_active),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Tag name is required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const token = await getToken();
      if (editingItem) {
        const res = await updateAdminTag(token, editingItem.id, formData);
        setSuccessBanner(`Tag "${res.data.name}" updated successfully.`);
      } else {
        const res = await createAdminTag(token, formData);
        setSuccessBanner(`Tag "${res.data.name}" created successfully.`);
      }
      setModalOpen(false);
      fetchTags();
    } catch (err) {
      setFormError(err.message || 'Failed to save tag.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteToggleStatus = async () => {
    if (!confirmToggleItem) return;
    setToggling(true);
    setError(null);

    try {
      const token = await getToken();
      const nextActive = !confirmToggleItem.is_active;
      await toggleAdminTagStatus(token, confirmToggleItem.id, nextActive);
      setSuccessBanner(
        `Tag "${confirmToggleItem.name}" has been ${nextActive ? 'activated' : 'deactivated'}.`
      );
      setConfirmToggleItem(null);
      fetchTags();
    } catch (err) {
      setError(err.message || 'Failed to change tag status.');
    } finally {
      setToggling(false);
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
            Property Tags Master Data
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0' }}>
            Curate badges and marketing highlights (e.g. &ldquo;Ready to Move&rdquo;, &ldquo;Gated Community&rdquo;, &ldquo;Lake View&rdquo;).
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
          <Plus size={16} /> Add Tag
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
            placeholder="Search tag name or slug..."
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
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
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
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>Name &amp; Slug</th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>Sort Order</th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569' }}>Status</th>
                <th style={{ padding: '0.85rem 1.1rem', fontWeight: '800', color: '#475569', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center' }}>
                    <Loader2
                      size={26}
                      style={{ color: 'var(--color-yellow-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }}
                    />
                    <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: '600' }}>Loading tags...</div>
                  </td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                    <TagIcon size={34} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--color-black-heading)' }}>
                      No Tags Found
                    </div>
                  </td>
                </tr>
              ) : (
                tags.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.15s' }}>
                    <td style={{ padding: '0.85rem 1.1rem' }}>
                      <div style={{ fontWeight: '800', color: 'var(--color-black-heading)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {item.slug}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1.1rem', fontWeight: '700', color: '#475569' }}>
                      {item.sort_order}
                    </td>
                    <td style={{ padding: '0.85rem 1.1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '100px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          backgroundColor: item.is_active ? '#dcfce7' : '#f1f5f9',
                          color: item.is_active ? '#15803d' : '#64748b',
                        }}
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Tag"
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
                        <button
                          type="button"
                          onClick={() => setConfirmToggleItem(item)}
                          title={item.is_active ? 'Deactivate Tag' : 'Activate Tag'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '4px',
                            border: item.is_active ? '1px solid #fecaca' : '1px solid #bbf7d0',
                            backgroundColor: item.is_active ? '#fef2f2' : '#f0fdf4',
                            color: item.is_active ? '#dc2626' : '#16a34a',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <Power size={12} /> {item.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
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
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-black-heading)', margin: 0 }}>
                {editingItem ? 'Edit Tag' : 'Add Property Tag'}
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
                  Tag Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ready to Move, Lake View, Gated Community"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Slug (Optional - auto-generated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ready-to-move"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
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

                <div style={{ paddingTop: '1.25rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                      style={{ accentColor: 'var(--color-brand-amber)', width: '15px', height: '15px' }}
                    />
                    <span>Active in UI Badges</span>
                  </label>
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
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deactivate / Activate */}
      {confirmToggleItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 110,
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
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-lg)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: confirmToggleItem.is_active ? '#fee2e2' : '#dcfce7',
                color: confirmToggleItem.is_active ? '#dc2626' : '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <Power size={22} />
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 0.4rem', color: 'var(--color-black-heading)' }}>
              {confirmToggleItem.is_active ? 'Deactivate Tag?' : 'Activate Tag?'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 1.25rem' }}>
              Are you sure you want to {confirmToggleItem.is_active ? 'deactivate' : 'activate'}{' '}
              <strong>&ldquo;{confirmToggleItem.name}&rdquo;</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setConfirmToggleItem(null)}
                style={{
                  padding: '0.55rem 1rem',
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
                type="button"
                disabled={toggling}
                onClick={handleExecuteToggleStatus}
                style={{
                  padding: '0.55rem 1.2rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: confirmToggleItem.is_active ? '#dc2626' : '#16a34a',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: toggling ? 'not-allowed' : 'pointer',
                }}
              >
                {toggling ? 'Updating...' : confirmToggleItem.is_active ? 'Yes, Deactivate' : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
