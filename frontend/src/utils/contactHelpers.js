/**
 * Centralized Contact Helpers for Dgate Homes Admin CRM
 * Provides safe, normalized URL schemes for telephone, WhatsApp, and email actions.
 */

/**
 * Normalizes a phone string into a clean 'tel:' link.
 * @param {string} phone
 * @returns {string}
 */
export function buildPhoneCallUrl(phone) {
  if (!phone) return '#';
  // Strip non-digits and preserve leading + if present
  const cleaned = phone.trim().replace(/[^0-9+]/g, '');
  return `tel:${cleaned}`;
}

/**
 * Normalizes a phone number and builds a WhatsApp web/app link with a polite Dgate Homes greeting.
 * @param {string} phone
 * @param {{ name?: string, propertyTitle?: string }} [context]
 * @returns {string}
 */
export function buildWhatsAppUrl(phone, context = {}) {
  if (!phone) return '#';

  // Extract digits only
  let digits = phone.replace(/[^0-9]/g, '');

  // If 10 digits (standard Indian mobile without country code), prefix 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  const customerName = context.name ? context.name.trim() : 'there';
  const propertyContext = context.propertyTitle
    ? ` regarding your inquiry for "${context.propertyTitle.trim()}"`
    : ' regarding your property inquiry';

  const message = `Hello ${customerName}, this is Dgate Homes${propertyContext}. How can we assist you with details or scheduling a site visit?`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a 'mailto:' link with pre-filled subject and greeting body.
 * @param {string} email
 * @param {{ name?: string, propertyTitle?: string }} [context]
 * @returns {string}
 */
export function buildMailtoUrl(email, context = {}) {
  if (!email) return '#';

  const customerName = context.name ? context.name.trim() : 'Valued Client';
  const propertyTitle = context.propertyTitle ? context.propertyTitle.trim() : null;

  const subject = propertyTitle
    ? `Dgate Homes: Regarding your inquiry for ${propertyTitle}`
    : 'Dgate Homes: Regarding your luxury property inquiry';

  const body = `Dear ${customerName},\n\nThank you for reaching out to Dgate Homes.\n\nRegarding your interest${propertyTitle ? ` in "${propertyTitle}"` : ''}, we would be delighted to share the full brochure, floor plans, pricing sheets, and coordinate a priority site visit at your convenience.\n\nPlease let us know your preferred date and time for a walkthrough or call.\n\nWarm regards,\nClient Relations Team\nDgate Homes`;

  return `mailto:${email.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
