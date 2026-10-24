/**
 * Central contact and communication configuration for Dgate Homes.
 * Prevents hardcoding company contact info across components.
 */
export const CONTACT = {
  companyName: 'Dgate Homes',
  tagline: 'Exclusive Luxury Real Estate & High-Value Developments',
  defaultCity: 'Bengaluru',

  // Phone Configuration
  primaryPhone: '9538564300',
  secondaryPhone: '9538562600',
  primaryPhoneDisplay: '+91 95385 64300',
  secondaryPhoneDisplay: '+91 95385 62600',
  primaryPhoneHref: 'tel:+919538564300',
  secondaryPhoneHref: 'tel:+919538562600',

  // Email Configuration
  email: 'dgatehome@gmail.com',
  emailHref: 'mailto:dgatehome@gmail.com',

  // WhatsApp Configuration (Direct to primary contact)
  whatsappNumber: '+919538564300',

  // Physical Location & Operating Hours
  address: '218, 2nd Floor, JP Royale Complex, 13th cross, Sampige Rd, Malleshwaram, Bengaluru, Karnataka 560003',
  supportHours: 'Mon - Sun: 9:00 AM - 8:00 PM IST',

  socialLinks: {
    facebook: 'https://facebook.com/dgatehomes',
    instagram: 'https://instagram.com/dgatehomes',
    linkedin: 'https://linkedin.com/company/dgatehomes',
    youtube: 'https://youtube.com/@dgatehomes',
    twitter: 'https://x.com/dgatehomes',
  },

  /**
   * Generates a pre-filled WhatsApp click-to-chat URL for a specific property.
   * @param {string} [propertyTitle]
   * @param {string} [slug]
   * @returns {string}
   */
  getWhatsAppUrl(propertyTitle, slug) {
    const cleanNumber = this.whatsappNumber.replace(/[^0-9]/g, '');
    let text = `Hello Dgate Homes, I am interested in your luxury property listings.`;
    if (propertyTitle) {
      text = `Hello Dgate Homes, I am interested in "${propertyTitle}". Please share the brochure, pricing, and site visit availability.`;
      if (slug && typeof window !== 'undefined') {
        text += `\nProperty Link: ${window.location.origin}/properties/${slug}`;
      }
    }
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
  },

  /**
   * Generates telephone click-to-call link.
   * @param {boolean} [secondary=false]
   * @returns {string}
   */
  getTelUrl(secondary = false) {
    return secondary ? this.secondaryPhoneHref : this.primaryPhoneHref;
  },

  /**
   * Generates mailto link.
   * @param {string} [subject]
   * @returns {string}
   */
  getMailtoUrl(subject = 'Inquiry from Dgate Homes Website') {
    return `mailto:${this.email}?subject=${encodeURIComponent(subject)}`;
  },
};

/**
 * Backward-compatible wrapper for existing components that import CONTACT_CONFIG.
 */
export const CONTACT_CONFIG = {
  ...CONTACT,
  phoneDisplay: CONTACT.primaryPhoneDisplay,
  phoneRaw: '+91' + CONTACT.primaryPhone,
};
