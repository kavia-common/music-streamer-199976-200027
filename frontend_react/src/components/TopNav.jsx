import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Avatar from './ui/Avatar';
import { Link, useNavigate } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * TopNav: App top navigation with menu button, search placeholder, and user menu.
 * - Provides an accessible dropdown linking to Profile, Settings, and Logout.
 */
export default function TopNav({ onMenuToggle }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const initials = (user?.name || user?.email || 'U').slice(0, 1).toUpperCase();

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

      <div className="topnav-right" ref={ref}>
        <button
          className="icon-btn"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="avatar">
            <Avatar size="sm" name={user?.name || initials} src={user?.avatar || user?.image} />
          </span>
          <span className="user-name">{isAuthenticated ? (user?.name || user?.email || 'User') : 'Guest'}</span>
        </button>
        {open && (
          <nav
            role="menu"
            aria-label="User menu"
            style={{
              position: 'absolute',
              right: 16,
              top: 'calc(var(--topnav-h) - 6px)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-lg)',
              padding: 8,
              display: 'grid',
              gap: 4,
              minWidth: 180,
              zIndex: 50,
            }}
          >
            {isAuthenticated ? (
              <>
                <MenuLink to="/profile" onPick={() => setOpen(false)}>Profile</MenuLink>
                <MenuLink to="/settings" onPick={() => setOpen(false)}>Settings</MenuLink>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />
                <button
                  role="menuitem"
                  className="u-interactive"
                  onClick={() => {
                    setOpen(false);
                    logout();
                    navigate('/');
                  }}
                  style={menuBtnStyle}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <MenuLink to="/login" onPick={() => setOpen(false)}>Sign in</MenuLink>
                <MenuLink to="/signup" onPick={() => setOpen(false)}>Sign up</MenuLink>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

function MenuLink({ to, children, onPick }) {
  return (
    <Link to={to} role="menuitem" onClick={onPick} style={menuBtnStyle}>
      {children}
    </Link>
  );
}

const menuBtnStyle = {
  textDecoration: 'none',
  color: 'var(--text)',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid transparent',
  background: 'transparent',
  textAlign: 'left',
  cursor: 'pointer',
  display: 'block',
};
