const config = require('./env');

/**
 * Centralized, non-sensitive application settings for Dgate Homes.
 * Safely accessible by administrators for operational overview.
 *
 * Never exposes passwords, API secrets, or private keys.
 */
function getSanitizedSettings() {
  return {
    company: {
      name: 'Dgate Homes',
      tagline: 'Exclusive Luxury Real Estate & High-Value Developments',
      defaultCity: 'Bengaluru',
      officeAddress: '218, 2nd Floor, JP Royale Complex, 13th cross, Sampige Rd, Malleshwaram, Bengaluru, Karnataka 560003',
    },
    contact: {
      phone: '+919876543210',
      phoneDisplay: '+91 98765 43210',
      whatsapp: '+919876543210',
      email: 'contact@dgatehomes.com',
      supportHours: 'Mon - Sun: 9:00 AM - 8:00 PM IST',
    },
    socialLinks: {
      facebook: 'https://facebook.com/dgatehomes',
      instagram: 'https://instagram.com/dgatehomes',
      linkedin: 'https://linkedin.com/company/dgatehomes',
      youtube: 'https://youtube.com/@dgatehomes',
      twitter: 'https://x.com/dgatehomes',
    },
    enquiryPreferences: {
      autoAssignLeads: false,
      instantWhatsappAlerts: true,
      notificationEmail: 'contact@dgatehomes.com',
      workingDays: 'Monday to Sunday',
    },
    system: {
      environment: config.nodeEnv,
      defaultCurrency: 'INR (₹)',
      authProvider: 'Clerk',
      clerkConfigured: Boolean(config.clerk.secretKey && config.clerk.publishableKey),
      clerkKeyPrefix: config.clerk.publishableKey
        ? `${config.clerk.publishableKey.slice(0, 10)}...`
        : 'Not configured',
      storageProvider: 'Cloudinary',
      cloudinaryConfigured: Boolean(
        config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret
      ),
      cloudinaryCloudName: config.cloudinary.cloudName || 'Not configured',
      rateLimitWindowMinutes: Math.round(config.rateLimit.windowMs / 60000),
      rateLimitMaxRequests: config.rateLimit.max,
    },
  };
}

module.exports = {
  getSanitizedSettings,
};
