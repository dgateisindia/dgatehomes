const { getSanitizedSettings } = require('../config/settings');

/**
 * GET /api/admin/settings
 * Returns non-sensitive operational application settings and environment telemetry.
 * Requires admin authentication.
 */
function getSettings(req, res) {
  try {
    const settings = getSanitizedSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('[AdminSettingsController] Failed to retrieve settings:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve application settings.',
    });
  }
}

module.exports = {
  getSettings,
};
