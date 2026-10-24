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

/**
 * GET /api/admin/properties
 */
export async function getAdminProperties(token, params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value).trim());
    }
  });

  const queryString = searchParams.toString();
  const url = `/admin/properties${queryString ? `?${queryString}` : ''}`;
  return adminRequest(url, token, { method: 'GET' });
}

/**
 * GET /api/admin/properties/:id
 */
export async function getAdminPropertyById(token, id) {
  const res = await adminRequest(`/admin/properties/${id}`, token, { method: 'GET' });
  return res.data;
}

/**
 * POST /api/admin/properties
 */
export async function createAdminProperty(token, payload) {
  return adminRequest('/admin/properties', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * PUT /api/admin/properties/:id
 */
export async function updateAdminProperty(token, id, payload) {
  return adminRequest(`/admin/properties/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * PATCH /api/admin/properties/:id/status
 */
export async function updateAdminPropertyStatus(token, id, status, reason = null) {
  return adminRequest(`/admin/properties/${id}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
}

/**
 * GET /api/admin/tags
 */
export async function getAdminTags(token) {
  const res = await adminRequest('/admin/tags', token, { method: 'GET' });
  return res.data || [];
}

/**
 * GET /api/admin/projects
 */
export async function getAdminProjects(token) {
  const res = await adminRequest('/admin/projects', token, { method: 'GET' });
  return res.data || [];
}

/**
 * POST /api/admin/properties/:propertyId/images
 * Multipart form upload for one or more property images.
 */
export async function uploadPropertyImages(token, propertyId, formData) {
  if (!token) {
    throw new Error('Authentication token is required.');
  }

  const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}/images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type manually so browser sets multipart/form-data with boundary
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Image upload failed with status ${response.status}`);
    error.status = response.status;
    error.success = false;
    throw error;
  }

  return data;
}

/**
 * PATCH /api/admin/properties/:propertyId/images/:imageId
 * Update image metadata (caption, alt_text) only.
 */
export async function updatePropertyImageMetadata(token, propertyId, imageId, payload) {
  return adminRequest(`/admin/properties/${propertyId}/images/${imageId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({
      caption: payload.caption,
      alt_text: payload.alt_text,
    }),
  });
}

/**
 * PATCH /api/admin/properties/:propertyId/images/reorder
 * Reorder property images atomically.
 * @param {Array<{id: number, sort_order: number}>} imagesOrder
 */
export async function reorderPropertyImages(token, propertyId, imagesOrder) {
  return adminRequest(`/admin/properties/${propertyId}/images/reorder`, token, {
    method: 'PATCH',
    body: JSON.stringify({ images: imagesOrder }),
  });
}

/**
 * PATCH /api/admin/properties/:propertyId/images/:imageId/cover
 * Set a single image as cover for the property.
 */
export async function setPropertyCoverImage(token, propertyId, imageId) {
  return adminRequest(`/admin/properties/${propertyId}/images/${imageId}/cover`, token, {
    method: 'PATCH',
  });
}

/**
 * DELETE /api/admin/properties/:propertyId/images/:imageId
 * Delete a property image from Cloudinary and MySQL.
 */
export async function deletePropertyImage(token, propertyId, imageId) {
  return adminRequest(`/admin/properties/${propertyId}/images/${imageId}`, token, {
    method: 'DELETE',
  });
}

