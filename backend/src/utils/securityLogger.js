const { pool } = require('../config/db');

/**
 * Inserts a security audit event into the security_events table.
 * Does not throw if logging fails, to prevent breaking application flow.
 *
 * @param {Object} event
 * @param {string} [event.clerkUserId]
 * @param {string} event.eventType
 * @param {'info'|'warning'|'critical'} [event.severity='info']
 * @param {string} [event.requestId]
 * @param {string} [event.ipAddress]
 * @param {string} [event.userAgent]
 * @param {Object} [event.metadata]
 * @returns {Promise<number|null>} Inserted ID or null
 */
async function logSecurityEvent({
  clerkUserId = null,
  eventType,
  severity = 'info',
  requestId = null,
  ipAddress = null,
  userAgent = null,
  metadata = null,
}) {
  try {
    if (!eventType) {
      console.warn('[SecurityLogger] eventType is required');
      return null;
    }

    const query = `
      INSERT INTO security_events (
        clerk_user_id,
        event_type,
        severity,
        request_id,
        ip_address,
        user_agent,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const metaJson = metadata ? JSON.stringify(metadata) : null;
    const sanitizedIp = ipAddress ? String(ipAddress).slice(0, 45) : null;
    const sanitizedUa = userAgent ? String(userAgent).slice(0, 500) : null;

    const [result] = await pool.query(query, [
      clerkUserId || null,
      eventType,
      severity,
      requestId || null,
      sanitizedIp,
      sanitizedUa,
      metaJson,
    ]);

    return result.insertId;
  } catch (error) {
    console.error('[SecurityLogger] Failed to record security event:', error.message);
    return null;
  }
}

module.exports = {
  logSecurityEvent,
};
