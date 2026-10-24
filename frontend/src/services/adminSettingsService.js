const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Fetches sanitized application settings and runtime configuration.
 * Requires admin authentication.
 *
 * @param {string} token - Clerk authorization JWT
 * @returns {Promise<Object>}
 */
export async function getAdminSettings(token) {
  if (!token) throw new Error('Authentication token is required.');

  const response = await fetch(`${API_BASE_URL}/admin/settings`, {
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
