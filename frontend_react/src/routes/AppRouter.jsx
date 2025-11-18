import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

/**
 * PUBLIC_INTERFACE
 * AppRouter: Central routing table for the application.
 * Routes:
 * - Public: /, /browse, /search, /login, /signup, /auth/callback
 * - Protected: /library, /playlists, /playlists/:id, /profile, /settings
 */
export default function AppRouter() {
  /** Router configuration with core app routes and auth pages. */
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/search" element={<Search />} />

        {/* Protected routes */}
        <Route path="/library" element={<ProtectedRoute element={<Library />} />} />
        <Route path="/playlists" element={<ProtectedRoute element={<Playlists />} />} />
        <Route path="/playlists/:id" element={<ProtectedRoute element={<PlaylistDetail />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
