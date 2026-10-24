const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Fetches the authenticated administrator's profile from the backend.
 *
 * @param {string} token - Clerk session Bearer token
 * @returns {Promise<{ clerkUserId: string, displayName: string, role: string }>}
 */
export async function getAdminMe(token) {
  if (!token) {
    throw new Error('Authentication token is required to fetch admin profile.');
  }

  const response = await fetch(`${API_BASE_URL}/admin/me`, {
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
    error.success = false;
    throw error;
  }

  return data.data;
}
