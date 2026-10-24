/**
 * Generates a URL-friendly slug from a property title.
 *
 * @param {string} title - Property title
 * @returns {string} Base slug (max 190 chars)
 */
function slugifyTitle(title) {
  if (!title || typeof title !== 'string') {
    return `property-${Date.now()}`;
  }

  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 190)
    .replace(/-+$/, '');

  return base || `property-${Date.now()}`;
}

module.exports = {
  slugifyTitle,
};
