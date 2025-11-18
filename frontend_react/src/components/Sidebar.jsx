import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * PUBLIC_INTERFACE
 * Sidebar: Collapsible navigation for core sections, plus a dynamic list of user's playlists.
 * Reacts to 'playlists:updated' events to refresh the list after mutations.
 */
export default function Sidebar({ isOpen, onLinkClick }) {
  const { api, isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setPlaylists([]);
      return;
    }
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/me/playlists');
        if (!active) return;
        const items = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.items) ? res.data.items : [];
        setPlaylists(items.slice(0, 12)); // keep sidebar compact
      } catch {
        // ignore errors in sidebar
      } finally {
        if (active) setLoading(false);
      }
    }
    load();

    const handler = () => load();
    window.addEventListener('playlists:updated', handler);
    return () => {
      active = false;
      window.removeEventListener('playlists:updated', handler);
    };
  }, [api, isAuthenticated]);

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

      {isAuthenticated && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 8px' }}>
            Your Playlists {loading ? '…' : ''}
          </div>
          <div className="nav" style={{ gap: 4 }}>
            {playlists.map((p) => (
              <button
                key={p.id}
                className="nav-link u-interactive"
                onClick={() => {
                  onLinkClick?.();
                  navigate(`/playlists/${encodeURIComponent(p.id)}`);
                }}
                style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: 0 }}
              >
                <span className="nav-ico">♪</span>
                <span className="nav-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
              </button>
            ))}
            {playlists.length === 0 && !loading && (
              <div style={{ padding: '6px 10px', fontSize: 12, color: 'var(--text-muted)' }}>No playlists yet</div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
