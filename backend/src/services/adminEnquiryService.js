const AppError = require('../utils/appError');
const adminEnquiryRepository = require('../repositories/adminEnquiryRepository');

const VALID_STATUSES = ['new', 'contacted', 'in_progress', 'closed'];

/**
 * Validates and converts an enquiry ID parameter into a positive integer.
 */
function parseEnquiryId(rawId) {
  const enquiryId = Number(rawId);
  if (!Number.isInteger(enquiryId) || enquiryId < 1) {
    throw new AppError('Enquiry ID must be a valid positive integer.', 400);
  }
  return enquiryId;
}

/**
 * Converts a Date object or valid date/time string into a MySQL-compatible 'YYYY-MM-DD HH:mm:ss' string.
 */
function toMysqlDatetimeString(input) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    throw new AppError('Invalid date/time format. Please provide a valid ISO date or datetime string.', 400);
  }
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Retrieves paginated enquiries with filters.
 */
async function listEnquiries(queryParams = {}) {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 15));

  let status = queryParams.status ? String(queryParams.status).trim() : '';
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError(`Invalid status filter "${status}". Allowed values: ${VALID_STATUSES.join(', ')}.`, 400);
  }

  const sort = queryParams.sort === 'next_follow_up' ? 'next_follow_up' : 'newest';

  let propertyId = null;
  if (queryParams.property_id) {
    propertyId = Number(queryParams.property_id);
    if (!Number.isInteger(propertyId) || propertyId < 1) {
      throw new AppError('property_id filter must be a positive integer.', 400);
    }
  }

  // Validate date range format YYYY-MM-DD if provided
  let dateFrom = queryParams.date_from ? String(queryParams.date_from).trim() : '';
  let dateTo = queryParams.date_to ? String(queryParams.date_to).trim() : '';

  if (dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
    throw new AppError('date_from must be in YYYY-MM-DD format.', 400);
  }
  if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
    throw new AppError('date_to must be in YYYY-MM-DD format.', 400);
  }

  return adminEnquiryRepository.findAdminEnquiries({
    search: queryParams.search ? String(queryParams.search).trim() : '',
    status,
    assigned_to: queryParams.assigned_to ? String(queryParams.assigned_to).trim() : '',
    property_id: propertyId,
    date_from: dateFrom,
    date_to: dateTo,
    sort,
    page,
    limit,
  });
}

/**
 * Retrieves single enquiry details, property summary, assigned admin, and activity timeline.
 */
async function getEnquiryById(rawId) {
  const enquiryId = parseEnquiryId(rawId);
  const result = await adminEnquiryRepository.findAdminEnquiryById(enquiryId);

  if (!result) {
    throw new AppError('Enquiry not found.', 404);
  }

  return result;
}

/**
 * Updates an enquiry's status in an atomic MySQL transaction with activity logging.
 */
async function updateEnquiryStatus(rawId, payload = {}, adminContext) {
  const enquiryId = parseEnquiryId(rawId);

  const newStatus = payload.status ? String(payload.status).trim() : '';
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new AppError(`Invalid status "${newStatus}". Allowed values: ${VALID_STATUSES.join(', ')}.`, 400);
  }

  const note = payload.note && typeof payload.note === 'string' ? payload.note.trim() : null;
  if (note && note.length > 2000) {
    throw new AppError('Status update note must not exceed 2000 characters.', 400);
  }

  // Verify enquiry exists
  const existing = await adminEnquiryRepository.findAdminEnquiryById(enquiryId);
  if (!existing) {
    throw new AppError('Enquiry not found.', 404);
  }

  const updated = await adminEnquiryRepository.updateEnquiryStatusTransaction(
    enquiryId,
    newStatus,
    note,
    adminContext
  );

  return updated;
}

/**
 * Assigns an enquiry to an active administrator in an atomic MySQL transaction.
 */
async function assignEnquiry(rawId, payload = {}, adminContext) {
  const enquiryId = parseEnquiryId(rawId);

  const targetClerkUserId = payload.assigned_to_clerk_user_id
    ? String(payload.assigned_to_clerk_user_id).trim()
    : '';

  if (!targetClerkUserId) {
    throw new AppError('assigned_to_clerk_user_id is required.', 400);
  }

  // Verify target admin exists and is active in admin_profiles
  const targetAdmin = await adminEnquiryRepository.findAdminByClerkUserId(targetClerkUserId);
  if (!targetAdmin || !targetAdmin.is_active) {
    throw new AppError('The specified administrator does not exist or is inactive.', 400);
  }

  // Verify enquiry exists
  const existing = await adminEnquiryRepository.findAdminEnquiryById(enquiryId);
  if (!existing) {
    throw new AppError('Enquiry not found.', 404);
  }

  const note = payload.note && typeof payload.note === 'string' ? payload.note.trim() : null;
  if (note && note.length > 1000) {
    throw new AppError('Assignment note must not exceed 1000 characters.', 400);
  }

  const updated = await adminEnquiryRepository.assignEnquiryTransaction(
    enquiryId,
    targetAdmin,
    note,
    adminContext
  );

  return updated;
}

/**
 * Schedules a follow-up for an enquiry in an atomic MySQL transaction.
 */
async function addEnquiryFollowUp(rawId, payload = {}, adminContext) {
  const enquiryId = parseEnquiryId(rawId);

  if (!payload.next_follow_up_at) {
    throw new AppError('next_follow_up_at is required for scheduling a follow-up.', 400);
  }

  const mysqlDatetime = toMysqlDatetimeString(payload.next_follow_up_at);

  const note = payload.note && typeof payload.note === 'string' ? payload.note.trim() : null;
  if (note && note.length > 2000) {
    throw new AppError('Follow-up note must not exceed 2000 characters.', 400);
  }

  // Verify enquiry exists
  const existing = await adminEnquiryRepository.findAdminEnquiryById(enquiryId);
  if (!existing) {
    throw new AppError('Enquiry not found.', 404);
  }

  const updated = await adminEnquiryRepository.addFollowUpTransaction(
    enquiryId,
    mysqlDatetime,
    note,
    adminContext
  );

  return updated;
}

/**
 * Adds an internal note to an enquiry in an atomic MySQL transaction.
 */
async function addEnquiryNote(rawId, payload = {}, adminContext) {
  const enquiryId = parseEnquiryId(rawId);

  const note = payload.note ? String(payload.note).trim() : '';
  if (!note) {
    throw new AppError('Note content is required.', 400);
  }
  if (note.length > 2000) {
    throw new AppError('Note content must not exceed 2000 characters.', 400);
  }

  // Verify enquiry exists
  const existing = await adminEnquiryRepository.findAdminEnquiryById(enquiryId);
  if (!existing) {
    throw new AppError('Enquiry not found.', 404);
  }

  const updated = await adminEnquiryRepository.addNoteTransaction(
    enquiryId,
    note,
    adminContext
  );

  return updated;
}

/**
 * Returns active administrators for dropdown assignment selectors.
 */
async function listActiveAdmins() {
  return adminEnquiryRepository.findActiveAdmins();
}

module.exports = {
  listEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  assignEnquiry,
  addEnquiryFollowUp,
  addEnquiryNote,
  listActiveAdmins,
};
