/**
 * Clerk Configuration
 */

export const CLERK_PUBLISHABLE_KEY =
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim();

/**
 * Checks if a valid-looking Clerk publishable key has been configured.
 * Clerk publishable keys typically start with 'pk_test_' or 'pk_live_'.
 */
export const isClerkConfigured = Boolean(
  CLERK_PUBLISHABLE_KEY &&
    (CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') ||
      CLERK_PUBLISHABLE_KEY.startsWith('pk_live_'))
);
