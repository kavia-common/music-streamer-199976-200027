import React from 'react';

/**
 * PUBLIC_INTERFACE
 * TopNav: App top navigation with menu button, search placeholder, and user menu placeholder.
 */
export default function TopNav({ onMenuToggle }) {
  return (
    <header className="topnav" role="banner">
      <div className="topnav-left">
        <button
          className="icon-btn menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <div className="brand">
          <span className="brand-mark">♫</span>
          <span className="brand-name">Oceanify</span>
        </div>
      </div>

      <div className="topnav-center">
        <div className="search">
          <span aria-hidden="true" className="search-icon">🔎</span>
          <input
            type="search"
            className="search-input"
            placeholder="Search for songs, artists, or podcasts"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="topnav-right">
        <button className="icon-btn" aria-haspopup="menu" aria-expanded="false">
          <span className="avatar">U</span>
          <span className="user-name">User</span>
        </button>
      </div>
    </header>
  );
}
