const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

/**
 * Fetches paginated admin activity logs with optional filters.
 * Requires super_admin authorization.
 *
 * @param {string} token - Clerk authorization JWT
 * @param {Object} [params] - Query parameters
 * @returns {Promise<{ data: Array, pagination: Object }>}
 */
export async function getAdminAuditLogs(token, params = {}) {
  if (!token) throw new Error('Authentication token is required.');

  const response = await fetch(`${API_BASE_URL}/admin/audit-logs${buildQuery(params)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * Fetches distinct action and entity type values for UI filter dropdowns.
 *
 * @param {string} token
 * @returns {Promise<{ actions: string[], entityTypes: string[] }>}
 */
export async function getAdminAuditLogFilters(token) {
  if (!token) throw new Error('Authentication token is required.');

  const response = await fetch(`${API_BASE_URL}/admin/audit-logs/filters`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data.data;
}
