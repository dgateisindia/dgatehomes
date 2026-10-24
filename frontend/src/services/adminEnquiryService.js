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
 * GET /api/admin/enquiries
 */
export async function getAdminEnquiries(token, params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value).trim());
    }
  });

  const queryString = searchParams.toString();
  const url = `/admin/enquiries${queryString ? `?${queryString}` : ''}`;
  return adminRequest(url, token, { method: 'GET' });
}

/**
 * GET /api/admin/enquiries/:id
 */
export async function getAdminEnquiryById(token, id) {
  const res = await adminRequest(`/admin/enquiries/${id}`, token, { method: 'GET' });
  return res.data;
}

/**
 * PATCH /api/admin/enquiries/:id/status
 */
export async function updateAdminEnquiryStatus(token, id, payload) {
  return adminRequest(`/admin/enquiries/${id}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * PATCH /api/admin/enquiries/:id/assign
 */
export async function assignAdminEnquiry(token, id, payload) {
  return adminRequest(`/admin/enquiries/${id}/assign`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * POST /api/admin/enquiries/:id/follow-up
 */
export async function addAdminEnquiryFollowUp(token, id, payload) {
  return adminRequest(`/admin/enquiries/${id}/follow-up`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * POST /api/admin/enquiries/:id/note
 */
export async function addAdminEnquiryNote(token, id, payload) {
  return adminRequest(`/admin/enquiries/${id}/note`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/admin/admins
 */
export async function getActiveAdmins(token) {
  const res = await adminRequest('/admin/admins', token, { method: 'GET' });
  return res.data || [];
}
