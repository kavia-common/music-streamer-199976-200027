import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute: Guards routes requiring authentication.
 * Usage: <ProtectedRoute element={<Dashboard />} />
 * - Redirects to /login if not authenticated, preserving the return path via ?redirect=<path>.
 */
export default function ProtectedRoute({ element }) {
  /** Enforces authentication and redirects unauthenticated users. */
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return element;
}
