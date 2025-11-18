import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Callback from '../pages/Callback';

// Simple placeholder pages for initial scaffolding
const Home = () => (
  <div className="page">
    <h1 className="page-title">Home</h1>
    <p className="page-desc">Discover new music and top charts.</p>
  </div>
);

const Browse = () => (
  <div className="page">
    <h1 className="page-title">Browse</h1>
    <p className="page-desc">Explore genres, new releases, and podcasts.</p>
  </div>
);

const Library = () => (
  <div className="page">
    <h1 className="page-title">Your Library</h1>
    <p className="page-desc">Albums, artists, and saved songs.</p>
  </div>
);

const Playlists = () => (
  <div className="page">
    <h1 className="page-title">Playlists</h1>
    <p className="page-desc">Create and manage your playlists.</p>
  </div>
);

// PUBLIC_INTERFACE
export default function AppRouter() {
  /** Router configuration with core app routes and auth pages. */
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<Callback />} />

        {/* Some routes can remain public */}
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />

        {/* Protected routes */}
        <Route path="/library" element={<ProtectedRoute element={<Library />} />} />
        <Route path="/playlists" element={<ProtectedRoute element={<Playlists />} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
