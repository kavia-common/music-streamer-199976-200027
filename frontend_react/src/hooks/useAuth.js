import { useContext } from 'react';
import { AuthContext } from '../state/authContext.jsx';

/**
 * PUBLIC_INTERFACE
 * useAuth: React hook to access authentication context.
 * Throws an error if used outside of <AuthProvider>.
 */
export function useAuth() {
  /** Returns the AuthContext value; ensures provider presence. */
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
