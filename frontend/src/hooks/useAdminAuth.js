import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { getAdminMe } from '../services/adminAuthService';

/**
 * Hook to manage admin authentication and backend authorization state.
 */
export function useAdminAuth() {
  const { isSignedIn, isLoaded: isAuthLoaded, getToken } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();

  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState(null);

  const verifyAuthorization = useCallback(async () => {
    if (!isAuthLoaded || !isUserLoaded) {
      return;
    }

    if (!isSignedIn) {
      setAdminProfile(null);
      setAuthorized(false);
      setForbidden(false);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setForbidden(false);

      const token = await getToken();
      if (!token) {
        throw new Error('Unable to retrieve Clerk session token.');
      }

      const profile = await getAdminMe(token);
      setAdminProfile(profile);
      setAuthorized(true);
      setForbidden(false);
    } catch (err) {
      console.error('[useAdminAuth] Authorization verification failed:', err.message);
      setAdminProfile(null);
      setAuthorized(false);

      if (err.status === 403) {
        setForbidden(true);
        setError('Access denied. Active administrator privileges required.');
      } else if (err.status === 401) {
        setError('Session expired or invalid credentials. Please sign in again.');
      } else {
        setError(err.message || 'Unable to connect to authorization service.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, getToken]);

  useEffect(() => {
    verifyAuthorization();
  }, [verifyAuthorization]);

  return {
    isLoaded: isAuthLoaded && isUserLoaded,
    isSignedIn,
    user,
    adminProfile,
    loading,
    authorized,
    forbidden,
    error,
    signOut,
    refetch: verifyAuthorization,
  };
}
