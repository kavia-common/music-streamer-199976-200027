import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Callback from '../pages/Callback';
import Home from '../pages/Home';
import Browse from '../pages/Browse';
import Search from '../pages/Search';
import Library from '../pages/Library';
import PlaylistDetail from '../pages/PlaylistDetail';
import Playlists from '../pages/Playlists';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import { ErrorBoundary } from '../components/ErrorBoundary';
import usePageView from '../hooks/usePageView';

/**
 * PUBLIC_INTERFACE
 * AppRouter: Central routing table for the application.
 * Routes:
 * - Public: /, /browse, /search, /login, /signup, /auth/callback
 * - Protected: /library, /playlists, /playlists/:id, /profile, /settings
 * Adds a catch-all 404 route and wraps content routes with ErrorBoundary.
 * Also triggers a page view telemetry event on route changes via usePageView().
 */
export default function AppRouter() {
  // Trigger page view logs on navigation changes
  usePageView();

  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route
          index
          element={
            <ErrorBoundary>
              <Home />
            </ErrorBoundary>
          }
        />
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <Home />
            </ErrorBoundary>
          }
        />
        <Route
          path="/browse"
          element={
            <ErrorBoundary>
              <Browse />
            </ErrorBoundary>
          }
        />
        <Route
          path="/search"
          element={
            <ErrorBoundary>
              <Search />
            </ErrorBoundary>
          }
        />

        {/* Auth */}
        <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
        <Route path="/signup" element={<ErrorBoundary><Signup /></ErrorBoundary>} />
        <Route path="/auth/callback" element={<ErrorBoundary><Callback /></ErrorBoundary>} />

        {/* Protected routes */}
        <Route
          path="/library"
          element={
            <ProtectedRoute
              element={
                <ErrorBoundary>
                  <Library />
                </ErrorBoundary>
              }
            />
          }
        />
        <Route
          path="/playlists"
          element={
            <ProtectedRoute
              element={
                <ErrorBoundary>
                  <Playlists />
                </ErrorBoundary>
              }
            />
          }
        />
        <Route
          path="/playlists/:id"
          element={
            <ProtectedRoute
              element={
                <ErrorBoundary>
                  <PlaylistDetail />
                </ErrorBoundary>
              }
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              element={
                <ErrorBoundary>
                  <Profile />
                </ErrorBoundary>
              }
            />
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute
              element={
                <ErrorBoundary>
                  <Settings />
                </ErrorBoundary>
              }
            />
          }
        />

        {/* Catch-all 404 */}
        <Route
          path="*"
          element={
            <ErrorBoundary>
              <NotFound />
            </ErrorBoundary>
          }
        />
      </Routes>
    </Suspense>
  );
}
