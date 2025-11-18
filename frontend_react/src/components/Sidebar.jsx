import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Sidebar: Collapsible navigation for core sections.
 */
export default function Sidebar({ isOpen, onLinkClick }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Sidebar">
      <nav className="nav">
        <NavLink to="/" end className="nav-link" onClick={onLinkClick}>
          <span className="nav-ico">🏠</span>
          <span className="nav-text">Home</span>
        </NavLink>
        <NavLink to="/browse" className="nav-link" onClick={onLinkClick}>
          <span className="nav-ico">🧭</span>
          <span className="nav-text">Browse</span>
        </NavLink>
        <NavLink to="/library" className="nav-link" onClick={onLinkClick}>
          <span className="nav-ico">📚</span>
          <span className="nav-text">Library</span>
        </NavLink>
        <NavLink to="/playlists" className="nav-link" onClick={onLinkClick}>
          <span className="nav-ico">🎵</span>
          <span className="nav-text">Playlists</span>
        </NavLink>
      </nav>
    </aside>
  );
}
