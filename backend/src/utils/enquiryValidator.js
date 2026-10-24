const PHONE_REGEX = /^\+?[0-9\s\-()]{5,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates and sanitizes payload for POST /api/enquiries
 * @param {Record<string, any>} body
 * @returns {{ isValid: boolean, errors?: string[], data?: { property_id: number, name: string, phone: string, email: string | null, message: string | null, source: string } }}
 */
function validateEnquiryPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      errors: ['Request payload must be a valid JSON object'],
    };
  }

  // 1. property_id: required, valid positive integer
  if (body.property_id === undefined || body.property_id === null || body.property_id === '') {
    errors.push('property_id is required');
  }
  const parsedPropertyId = Number(body.property_id);
  if (!Number.isInteger(parsedPropertyId) || parsedPropertyId <= 0) {
    errors.push('property_id must be a positive integer');
  }

  // 2. name: required, string, trimmed, 2-150 chars
  if (body.name === undefined || body.name === null) {
    errors.push('name is required');
  }
  const trimmedName = typeof body.name === 'string' ? body.name.trim() : '';
  if (trimmedName.length === 0) {
    if (!errors.includes('name is required')) errors.push('name is required and cannot be empty');
  } else if (trimmedName.length < 2) {
    errors.push('name must be at least 2 characters');
  } else if (trimmedName.length > 150) {
    errors.push('name must not exceed 150 characters');
  }

  // 3. phone: required, string, trimmed, 5-30 chars, format
  if (body.phone === undefined || body.phone === null) {
    errors.push('phone is required');
  }
  const trimmedPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (trimmedPhone.length === 0) {
    if (!errors.includes('phone is required')) errors.push('phone is required and cannot be empty');
  } else if (!PHONE_REGEX.test(trimmedPhone)) {
    errors.push('phone must be a valid phone number (between 5 and 30 digits/characters)');
  }

  // 4. email: optional, valid format, max 254 chars
  let cleanedEmail = null;
  if (body.email !== undefined && body.email !== null && String(body.email).trim() !== '') {
    const trimmedEmail = String(body.email).trim();
    if (trimmedEmail.length > 254) {
      errors.push('email must not exceed 254 characters');
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.push('email must be a valid email address');
    } else {
      cleanedEmail = trimmedEmail.toLowerCase();
    }
  }

  // 5. message: optional, max 2000 chars
  let cleanedMessage = null;
  if (body.message !== undefined && body.message !== null && String(body.message).trim() !== '') {
    const trimmedMessage = String(body.message).trim();
    if (trimmedMessage.length > 2000) {
      errors.push('message must not exceed 2000 characters');
    } else {
      cleanedMessage = trimmedMessage;
    }
  }

  // 6. source: optional, default "website", max 100 chars
  let cleanedSource = 'website';
  if (body.source !== undefined && body.source !== null && String(body.source).trim() !== '') {
    const trimmedSource = String(body.source).trim();
    if (trimmedSource.length > 100) {
      errors.push('source must not exceed 100 characters');
    } else {
      cleanedSource = trimmedSource;
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    data: {
      property_id: parsedPropertyId,
      name: trimmedName,
      phone: trimmedPhone,
      email: cleanedEmail,
      message: cleanedMessage,
      source: cleanedSource,
    },
  };
}

module.exports = {
  validateEnquiryPayload,
};
