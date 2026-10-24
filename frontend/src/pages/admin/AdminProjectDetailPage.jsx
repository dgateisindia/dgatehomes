import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  ArrowLeft,
  Landmark,
  Building,
  MapPin,
  Calendar,
  Layers,
  Edit2,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Archive,
  Eye,
  RotateCcw,
} from 'lucide-react';
import {
  getAdminProjectById,
  updateAdminProject,
  updateAdminProjectStatus,
  getAdminProjectUnitTypes,
  createAdminProjectUnitType,
  updateAdminProjectUnitType,
} from '../../services/adminMasterDataService';
import { formatPrice, formatArea } from '../../utils/formatters';

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
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function toInputDate(val) {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export default function AdminProjectDetailPage() {
  const { id } = useParams();
  const { getToken } = useAuth();

  const [project, setProject] = useState(null);
  const [unitTypes, setUnitTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Edit Project Modal
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [projectFormError, setProjectFormError] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    launch_date: '',
    possession_date: '',
    status: 'draft',
  });

  // Add / Edit Unit Type Modal
  const [unitTypeModalOpen, setUnitTypeModalOpen] = useState(false);
  const [editingUnitType, setEditingUnitType] = useState(null);
  const [unitTypeSubmitting, setUnitTypeSubmitting] = useState(false);
  const [unitTypeFormError, setUnitTypeFormError] = useState(null);
  const [unitTypeForm, setUnitTypeForm] = useState({
    name: '',
    bedrooms: 2,
    bathrooms: 2,
    area: '',
    area_unit: 'sqft',
    base_price: '',
    units_total: '',
    units_available: '',
    possession_date: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication token required.');

      const [projData, unitTypesData] = await Promise.all([
        getAdminProjectById(token, id),
        getAdminProjectUnitTypes(token, id),
      ]);

      setProject(projData);
      setUnitTypes(unitTypesData || []);
    } catch (err) {
      console.error('[AdminProjectDetailPage] Load error:', err);
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  }, [getToken, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Quick Status Transition
  const handleQuickStatusChange = async (nextStatus) => {
    if (!project || statusUpdating) return;
    setStatusUpdating(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication token required.');

      await updateAdminProjectStatus(token, project.id, nextStatus);
      setProject((prev) => ({ ...prev, status: nextStatus }));
      setSuccessBanner(`Project status successfully changed to "${nextStatus.toUpperCase()}".`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update project status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Open Edit Project Modal
  const handleOpenEditProject = () => {
    if (!project) return;
    setProjectForm({
      name: project.name || '',
      description: project.description || '',
      location: project.location || '',
      address: project.address || '',
      launch_date: toInputDate(project.launch_date),
      possession_date: toInputDate(project.possession_date),
      status: project.status || 'draft',
    });
    setProjectFormError(null);
    setEditProjectModalOpen(true);
  };

  // Save Project Details
  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      setProjectFormError('Project title is required.');
      return;
    }
    if (!projectForm.location.trim()) {
      setProjectFormError('Location is required.');
      return;
    }

    if (
      projectForm.launch_date &&
      projectForm.possession_date &&
      projectForm.possession_date < projectForm.launch_date
    ) {
      setProjectFormError('Possession date cannot be earlier than the launch date.');
      return;
    }

    setProjectSubmitting(true);
    setProjectFormError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication token required.');

      await updateAdminProject(token, project.id, {
        name: projectForm.name.trim(),
        description: projectForm.description.trim() || null,
        location: projectForm.location.trim(),
        address: projectForm.address.trim() || null,
        launch_date: projectForm.launch_date || null,
        possession_date: projectForm.possession_date || null,
        status: projectForm.status,
      });

      setProject((prev) => ({
        ...prev,
        ...projectForm,
      }));
      setEditProjectModalOpen(false);
      setSuccessBanner('Project information updated successfully.');
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      setProjectFormError(err.message || 'Failed to update project.');
    } finally {
      setProjectSubmitting(false);
    }
  };

  // Open Add Unit Type Modal
  const handleOpenAddUnitType = () => {
    setEditingUnitType(null);
    setUnitTypeForm({
      name: '',
      bedrooms: 2,
      bathrooms: 2,
      area: '',
      area_unit: 'sqft',
      base_price: '',
      units_total: '',
      units_available: '',
      possession_date: '',
    });
    setUnitTypeFormError(null);
    setUnitTypeModalOpen(true);
  };

  // Open Edit Unit Type Modal
  const handleOpenEditUnitType = (unit) => {
    setEditingUnitType(unit);
    setUnitTypeForm({
      name: unit.name || '',
      bedrooms: unit.bedrooms !== null && unit.bedrooms !== undefined ? unit.bedrooms : 0,
      bathrooms: unit.bathrooms !== null && unit.bathrooms !== undefined ? unit.bathrooms : 0,
      area: unit.area !== null && unit.area !== undefined ? unit.area : '',
      area_unit: unit.area_unit || 'sqft',
      base_price: unit.base_price !== null && unit.base_price !== undefined ? unit.base_price : '',
      units_total: unit.units_total !== null && unit.units_total !== undefined ? unit.units_total : '',
      units_available: unit.units_available !== null && unit.units_available !== undefined ? unit.units_available : '',
      possession_date: toInputDate(unit.possession_date),
    });
    setUnitTypeFormError(null);
    setUnitTypeModalOpen(true);
  };

  // Save Unit Type
  const handleSaveUnitType = async (e) => {
    e.preventDefault();
    if (!unitTypeForm.name.trim()) {
      setUnitTypeFormError('Unit configuration name is required (e.g., 2 BHK Premium).');
      return;
    }
    const areaNum = parseFloat(unitTypeForm.area);
    if (!unitTypeForm.area || isNaN(areaNum) || areaNum <= 0) {
      setUnitTypeFormError('Area must be a valid positive number.');
      return;
    }

    const totalVal = unitTypeForm.units_total !== '' ? parseInt(unitTypeForm.units_total, 10) : null;
    const availVal = unitTypeForm.units_available !== '' ? parseInt(unitTypeForm.units_available, 10) : null;

    if (totalVal !== null && availVal !== null && availVal > totalVal) {
      setUnitTypeFormError('Available units cannot exceed total units.');
      return;
    }

    setUnitTypeSubmitting(true);
    setUnitTypeFormError(null);

    const payload = {
      name: unitTypeForm.name.trim(),
      bedrooms: parseInt(unitTypeForm.bedrooms, 10) || 0,
      bathrooms: parseInt(unitTypeForm.bathrooms, 10) || 0,
      area: areaNum,
      area_unit: unitTypeForm.area_unit,
      base_price: unitTypeForm.base_price ? parseFloat(unitTypeForm.base_price) : null,
      units_total: totalVal,
      units_available: availVal,
      possession_date: unitTypeForm.possession_date || null,
    };

    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication token required.');

      if (editingUnitType) {
        await updateAdminProjectUnitType(token, project.id, editingUnitType.id, payload);
        setUnitTypes((prev) =>
          prev.map((item) => (item.id === editingUnitType.id ? { ...item, ...payload } : item))
        );
        setSuccessBanner(`Unit configuration "${payload.name}" updated successfully.`);
      } else {
        const res = await createAdminProjectUnitType(token, project.id, payload);
        setUnitTypes((prev) => [...prev, { id: res.data?.id, ...payload }]);
        setSuccessBanner(`Unit configuration "${payload.name}" added successfully.`);
      }

      setUnitTypeModalOpen(false);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      setUnitTypeFormError(err.message || 'Failed to save unit type.');
    } finally {
      setUnitTypeSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-medium text-slate-700 truncate max-w-xs">
          {project ? project.name : 'Loading project...'}
        </span>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="font-bold underline ml-4 hover:text-red-900 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
          <p className="text-xs font-medium text-slate-500">Loading project details & unit types...</p>
        </div>
      ) : project ? (
        <>
          {/* Project Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: STATUS_CONFIG[project.status]?.bg || '#f1f5f9',
                      color: STATUS_CONFIG[project.status]?.text || '#64748b',
                    }}
                  >
                    {STATUS_CONFIG[project.status]?.label || project.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID #{project.id}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {project.name}
                </h1>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>{project.location}</span>
                  </div>
                  {project.address && (
                    <div className="text-slate-500 truncate max-w-md">
                      Address: {project.address}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Transitions */}
                {project.status === 'draft' && (
                  <button
                    onClick={() => handleQuickStatusChange('published')}
                    disabled={statusUpdating}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Publish Project
                  </button>
                )}
                {project.status === 'published' && (
                  <button
                    onClick={() => handleQuickStatusChange('archived')}
                    disabled={statusUpdating}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-800 text-white shadow-sm transition-all disabled:opacity-50"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive Project
                  </button>
                )}
                {project.status === 'archived' && (
                  <button
                    onClick={() => handleQuickStatusChange('draft')}
                    disabled={statusUpdating}
                    style={{ backgroundColor: 'var(--color-brand-walnut)', color: '#ffffff' }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" style={{ color: 'var(--color-brand-amber)' }} />
                    Restore to Draft
                  </button>
                )}

                <button
                  onClick={handleOpenEditProject}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all border border-slate-200/60"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Project Details
                </button>
              </div>
            </div>

            {/* Quick Metrics & Dates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">Launch Date</span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(project.launch_date)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">Possession Date</span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(project.possession_date)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">Configured Unit Types</span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  {unitTypes.length} {unitTypes.length === 1 ? 'type' : 'types'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">Linked Properties</span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {project.properties_count || 0} listings
                </span>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100/60 text-slate-700 text-xs leading-relaxed">
                <h4 className="font-bold text-slate-900 mb-1 text-[11px] uppercase tracking-wider text-amber-900/80">
                  Project Description
                </h4>
                <p className="whitespace-pre-line">{project.description}</p>
              </div>
            )}
          </div>

          {/* Unit Types Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5" style={{ color: 'var(--color-brand-amber)' }} />
                  Project Unit Types & Inventories
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Floor configurations, BHK configurations, unit inventories, and base pricing.
                </p>
              </div>

              <button
                onClick={handleOpenAddUnitType}
                style={{ backgroundColor: 'var(--color-brand-walnut)', color: '#ffffff' }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" style={{ color: 'var(--color-brand-amber)' }} />
                Add Unit Type
              </button>
            </div>

            {/* Unit Types Table */}
            {unitTypes.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <h3 className="text-xs font-bold text-slate-700">No Unit Types Configured Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Define floor plans, BHK options, and inventory counts for this master development.
                </p>
                <button
                  onClick={handleOpenAddUnitType}
                  style={{ backgroundColor: 'var(--color-brand-walnut)', color: '#ffffff' }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" style={{ color: 'var(--color-brand-amber)' }} />
                  Add First Unit Type
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Configuration Name</th>
                      <th className="py-3 px-4">BHK / Baths</th>
                      <th className="py-3 px-4">Built-up Area</th>
                      <th className="py-3 px-4">Base Price</th>
                      <th className="py-3 px-4">Units Total</th>
                      <th className="py-3 px-4">Units Available</th>
                      <th className="py-3 px-4">Possession</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {unitTypes.map((unit) => {
                      const avail = unit.units_available;
                      const total = unit.units_total;
                      const isLowStock = total && avail !== null && avail <= 2 && avail > 0;
                      const isSoldOut = total && avail === 0;

                      return (
                        <tr key={unit.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {unit.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            <span className="font-semibold text-slate-800">
                              {unit.bedrooms > 0 ? `${unit.bedrooms} BHK` : 'Studio/Plot'}
                            </span>
                            {unit.bathrooms > 0 && (
                              <span className="text-slate-400 ml-1.5 font-normal">
                                • {unit.bathrooms} {unit.bathrooms === 1 ? 'Bath' : 'Baths'}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                            {formatArea(unit.area, unit.area_unit)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                            {unit.base_price ? formatPrice(unit.base_price) : 'On Request'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono">
                            {unit.units_total !== null && unit.units_total !== undefined
                              ? unit.units_total
                              : '—'}
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            {unit.units_available !== null && unit.units_available !== undefined ? (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                  isSoldOut
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : isLowStock
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {isSoldOut ? 'Sold Out' : `${unit.units_available} left`}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {formatDate(unit.possession_date)}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditUnitType(unit)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-slate-500" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Edit Project Details Modal */}
      {editProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-500" />
                Edit Project Information
              </h3>
              <button
                onClick={() => setEditProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-6 space-y-4">
              {projectFormError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {projectFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="e.g. Prestige Lakefront"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.location}
                    onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                    placeholder="e.g. Whitefield, Bengaluru"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={projectForm.address}
                  onChange={(e) => setProjectForm({ ...projectForm, address: e.target.value })}
                  placeholder="e.g. Survey No. 42, Varthur Main Road"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Launch Date</label>
                  <input
                    type="date"
                    value={projectForm.launch_date}
                    onChange={(e) => setProjectForm({ ...projectForm, launch_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Possession Date</label>
                  <input
                    type="date"
                    value={projectForm.possession_date}
                    onChange={(e) => setProjectForm({ ...projectForm, possession_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Comprehensive description of the residential / commercial development..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={projectSubmitting}
                  style={{ backgroundColor: 'var(--color-brand-walnut)', color: '#ffffff' }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {projectSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Unit Type Modal */}
      {unitTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                {editingUnitType ? `Edit Unit Type: ${editingUnitType.name}` : 'Add Project Unit Type'}
              </h3>
              <button
                onClick={() => setUnitTypeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUnitType} className="p-6 space-y-4">
              {unitTypeFormError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {unitTypeFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unit Configuration Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={unitTypeForm.name}
                  onChange={(e) => setUnitTypeForm({ ...unitTypeForm, name: e.target.value })}
                  placeholder="e.g. 3 BHK Grand Luxury, 2 BHK Classic"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bedrooms (BHK)</label>
                  <input
                    type="number"
                    min="0"
                    value={unitTypeForm.bedrooms}
                    onChange={(e) => setUnitTypeForm({ ...unitTypeForm, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={unitTypeForm.bathrooms}
                    onChange={(e) => setUnitTypeForm({ ...unitTypeForm, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={unitTypeForm.area}
                    onChange={(e) => setUnitTypeForm({ ...unitTypeForm, area: e.target.value })}
                    placeholder="e.g. 1650"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={unitTypeForm.area_unit}
                    onChange={(e) => setUnitTypeForm({ ...unitTypeForm, area_unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="sqft">sq.ft</option>
                    <option value="sqm">sq.m</option>
                    <option value="acre">Acres</option>
                    <option value="gunta">Guntas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Price (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitTypeForm.base_price}
                  onChange={(e) => setUnitTypeForm({ ...unitTypeForm, base_price: e.target.value })}
                  placeholder="e.g. 12500000 (₹ 1.25 Cr)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Units Planned</label>
                  <input
                    type="number"
                    min="0"
                    value={unitTypeForm.units_total}
                    onChange={(e) => setUnitTypeForm({ ...unitTypeForm, units_total: e.target.value })}
                    placeholder="e.g. 40"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Available Units</label>
                  <input
                    type="number"
                    min="0"
                    value={unitTypeForm.units_available}
                    onChange={(e) => setUnitTypeForm({ ...unitTypeForm, units_available: e.target.value })}
                    placeholder="e.g. 12"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Possession Date</label>
                <input
                  type="date"
                  value={unitTypeForm.possession_date}
                  onChange={(e) => setUnitTypeForm({ ...unitTypeForm, possession_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUnitTypeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unitTypeSubmitting}
                  style={{ backgroundColor: 'var(--color-brand-walnut)', color: '#ffffff' }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {unitTypeSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {editingUnitType ? 'Save Changes' : 'Create Unit Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
