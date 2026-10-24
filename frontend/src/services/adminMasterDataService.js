const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper to execute authenticated admin API requests.
 */
async function adminRequest(endpoint, token, options = {}) {
  if (!token) {
    throw new Error('Authentication token is required.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.success = false;
    throw error;
  }

  return data;
}

function buildQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      sp.set(k, String(v).trim());
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

/* ==========================================================================
   1. AMENITIES
   ========================================================================== */

export async function getAdminAmenities(token, params = {}) {
  return adminRequest(`/admin/amenities${buildQuery(params)}`, token, { method: 'GET' });
}

export async function createAdminAmenity(token, payload) {
  return adminRequest('/admin/amenities', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminAmenity(token, id, payload) {
  return adminRequest(`/admin/amenities/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function toggleAdminAmenityStatus(token, id, isActive) {
  return adminRequest(`/admin/amenities/${id}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
}

/* ==========================================================================
   2. PROPERTY TYPES
   ========================================================================== */

export async function getAdminPropertyTypes(token, params = {}) {
  return adminRequest(`/admin/property-types${buildQuery(params)}`, token, { method: 'GET' });
}

export async function createAdminPropertyType(token, payload) {
  return adminRequest('/admin/property-types', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminPropertyType(token, id, payload) {
  return adminRequest(`/admin/property-types/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function toggleAdminPropertyTypeStatus(token, id, isActive) {
  return adminRequest(`/admin/property-types/${id}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
}

/* ==========================================================================
   3. PROPERTY TAGS
   ========================================================================== */

export async function getAdminTags(token, params = {}) {
  return adminRequest(`/admin/tags${buildQuery(params)}`, token, { method: 'GET' });
}

export async function createAdminTag(token, payload) {
  return adminRequest('/admin/tags', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminTag(token, id, payload) {
  return adminRequest(`/admin/tags/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function toggleAdminTagStatus(token, id, isActive) {
  return adminRequest(`/admin/tags/${id}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
}

/* ==========================================================================
   4. PROJECTS
   ========================================================================== */

export async function getAdminProjects(token, params = {}) {
  return adminRequest(`/admin/projects${buildQuery(params)}`, token, { method: 'GET' });
}

export async function getAdminProjectById(token, id) {
  const res = await adminRequest(`/admin/projects/${id}`, token, { method: 'GET' });
  return res.data;
}

export async function createAdminProject(token, payload) {
  return adminRequest('/admin/projects', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminProject(token, id, payload) {
  return adminRequest(`/admin/projects/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminProjectStatus(token, id, status) {
  return adminRequest(`/admin/projects/${id}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/* ==========================================================================
   5. PROJECT UNIT TYPES
   ========================================================================== */

export async function getAdminProjectUnitTypes(token, projectId) {
  const res = await adminRequest(`/admin/projects/${projectId}/unit-types`, token, { method: 'GET' });
  return res.data || [];
}

export async function createAdminProjectUnitType(token, projectId, payload) {
  return adminRequest(`/admin/projects/${projectId}/unit-types`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminProjectUnitType(token, projectId, unitTypeId, payload) {
  return adminRequest(`/admin/projects/${projectId}/unit-types/${unitTypeId}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
