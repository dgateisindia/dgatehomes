const adminProfileRepository = require('../repositories/adminProfileRepository');

/**
 * Validates and retrieves the authorized admin profile for a verified Clerk user ID.
 *
 * @param {string} clerkUserId - Clerk user ID
 * @returns {Promise<{ authorized: boolean, reason?: string, admin?: Object }>}
 */
async function authorizeAdminUser(clerkUserId) {
  if (!clerkUserId) {
    return { authorized: false, reason: 'MISSING_CLERK_ID' };
  }

  const profile = await adminProfileRepository.findByClerkUserId(clerkUserId);

  if (!profile) {
    return { authorized: false, reason: 'PROFILE_NOT_FOUND' };
  }

  // Verify that the admin account is marked active
  if (!profile.is_active) {
    return { authorized: false, reason: 'ACCOUNT_INACTIVE' };
  }

  // Return safe sanitized admin data
  return {
    authorized: true,
    admin: {
      id: profile.id,
      clerkUserId: profile.clerk_user_id,
      displayName: profile.display_name || 'Administrator',
      role: profile.role, // 'admin' | 'super_admin'
    },
  };
}

module.exports = {
  authorizeAdminUser,
};
