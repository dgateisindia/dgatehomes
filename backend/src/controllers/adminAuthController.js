/**
 * Admin Authentication Controller
 */

/**
 * Returns authenticated admin profile information for GET /api/admin/me.
 * Exposes strictly necessary public admin fields (clerkUserId, displayName, role).
 * Internal database IDs, timestamps, or tokens are never exposed.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getCurrentAdmin(req, res) {
  const admin = req.admin;

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access this resource.',
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      clerkUserId: admin.clerkUserId,
      displayName: admin.displayName || 'Administrator',
      role: admin.role,
    },
  });
}

module.exports = {
  getCurrentAdmin,
};
