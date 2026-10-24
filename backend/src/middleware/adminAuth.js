const { getAuth } = require('@clerk/express');
const adminAuthService = require('../services/adminAuthService');
const { logSecurityEvent } = require('../utils/securityLogger');

/**
 * Reusable middleware to verify Clerk authentication and active admin authorization.
 *
 * Flow:
 * 1. Read verified Clerk auth state via getAuth(req).
 * 2. If no valid Clerk session/token -> return 401 unauthenticated.
 * 3. Extract Clerk user ID.
 * 4. Query MySQL admin_profiles for this clerk_user_id.
 * 5. Verify account is active (is_active = 1).
 * 6. If not active or profile missing -> return 403 forbidden.
 * 7. Attach sanitized admin profile to req.admin.
 *
 * Never logs authorization headers, secrets, or tokens.
 */
async function requireAuth(req, res, next) {
  try {
    let clerkUserId = null;

    if (req.auth && typeof req.auth === 'function') {
      try {
        const auth = getAuth(req);
        clerkUserId = auth?.userId;
      } catch (authError) {
        console.error('[Admin Auth] Clerk token verification error:', authError.message);
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Invalid or unverified credentials.',
        });
      }
    } else if (req.auth && typeof req.auth === 'object') {
      clerkUserId = req.auth.userId || null;
    } else {
      // Attempt getAuth(req) directly if req.auth is branded differently
      try {
        const auth = getAuth(req);
        clerkUserId = auth?.userId;
      } catch (e) {
        clerkUserId = null;
      }
    }

    // 1. Check if user is authenticated with Clerk
    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access this resource.',
      });
    }

    // 2. Query MySQL admin_profiles for authorization
    const authResult = await adminAuthService.authorizeAdminUser(clerkUserId);

    if (!authResult.authorized) {
      logSecurityEvent({
        clerkUserId,
        eventType: 'UNAUTHORIZED_ADMIN_LOGIN_ATTEMPT',
        severity: 'warning',
        requestId: req.headers['x-request-id'] || null,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        metadata: { path: req.originalUrl, method: req.method },
      }).catch(() => {});

      return res.status(403).json({
        success: false,
        message: 'Access denied. Active administrator privileges required.',
      });
    }

    // 3. Attach safe admin data to request
    req.admin = authResult.admin;
    return next();
  } catch (error) {
    console.error('[Admin Auth] Authorization processing error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during authentication.',
    });
  }
}

/**
 * Reusable middleware to verify that authenticated user has at least 'admin' or 'super_admin' role.
 */
function requireAdmin(req, res, next) {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access this resource.',
    });
  }

  const role = req.admin.role;
  if (role !== 'admin' && role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }

  return next();
}

/**
 * Reusable middleware to verify that authenticated user has 'super_admin' role.
 */
function requireSuperAdmin(req, res, next) {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access this resource.',
    });
  }

  if (req.admin.role !== 'super_admin') {
    logSecurityEvent({
      clerkUserId: req.admin.clerk_user_id,
      eventType: 'UNAUTHORIZED_SUPER_ADMIN_ACCESS_ATTEMPT',
      severity: 'warning',
      requestId: req.headers['x-request-id'] || null,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      metadata: { path: req.originalUrl, method: req.method, role: req.admin.role },
    }).catch(() => {});

    return res.status(403).json({
      success: false,
      message: 'Access denied. Super administrator privileges required.',
    });
  }

  return next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
};
