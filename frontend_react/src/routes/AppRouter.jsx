import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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
  /** Router configuration with core app routes. */
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/library" element={<Library />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
