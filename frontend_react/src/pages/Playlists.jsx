import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PlaylistList from '../components/PlaylistList';
import Button from '../components/ui/Button';
import PlaylistEditor from '../components/PlaylistEditor';
import Skeleton from '../components/ui/Skeleton';

/**
 * PUBLIC_INTERFACE
 * Playlists: Management hub for user playlists.
 * - Lists user's playlists with navigation.
 * - Provides a create flow via PlaylistEditor.
 * - Allows inline edit (rename/delete) by selecting a playlist to edit.
 *
 * Endpoints (placeholder, not hardcoded beyond relative paths):
 * GET /me/playlists
 * POST /playlists
 * PATCH /playlists/:id
 * DELETE /playlists/:id
 * GET /playlists/:id
 * GET /playlists/:id/tracks
 * POST /playlists/:id/tracks
 * DELETE /playlists/:id/tracks/:trackId
 * PATCH /playlists/:id/tracks/reorder
 */
export default function Playlists() {
  const { api } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState(null); // set to playlist id to edit

  const loadPlaylists = useCallback(async () => {
    setLoadingList(true);
    setError('');
    try {
      const res = await api.get('/me/playlists');
      const items = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.items) ? res.data.items : [];
      setList(items);
    } catch (e) {
      setError(e?.data?.message || e?.message || 'Failed to load playlists');
    } finally {
      setLoadingList(false);
    }
  }, [api]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const onSelect = (p) => navigate(`/playlists/${encodeURIComponent(p.id)}`);

  // Sidebar sync: expose a custom event so Sidebar can refresh its local view (if needed)
  const dispatchSidebarRefresh = () => {
    try {
      window.dispatchEvent(new CustomEvent('playlists:updated'));
    } catch {
      // ignore
    }
  };

  const onCreatedOrUpdated = useCallback(
    (p) => {
      // optimistic refresh of list
      setList((prev) => {
        const idx = prev.findIndex((x) => x.id === p.id);
        if (idx === -1) return [p, ...prev];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...p };
        return copy;
      });
      setShowCreate(false);
      setEditId(null);
      dispatchSidebarRefresh();
    },
    [] // no deps
  );

  const onDeleted = useCallback(() => {
    // After delete, refetch list (safer than local removal in case of cascades)
    loadPlaylists();
    setEditId(null);
    dispatchSidebarRefresh();
  }, [loadPlaylists]);

  const currentEdit = useMemo(() => list.find((p) => p.id === editId) || null, [editId, list]);

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Your Playlists</h1>
          <p className="page-desc">Create, edit, and manage your playlists.</p>
        </div>
        <div>
          {!showCreate ? (
            <Button onClick={() => setShowCreate(true)}>New Playlist</Button>
          ) : (
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Close
            </Button>
          )}
        </div>
      </div>

      <section style={{ marginTop: 16 }}>
        {loadingList ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <Skeleton height={140} />
            <Skeleton height={140} />
          </div>
        ) : error ? (
          <div role="alert" style={{ color: 'var(--error)' }}>
            {error}
          </div>
        ) : list.length === 0 ? (
          <div className="u-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong>You have no playlists yet.</strong>
                <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>Create your first playlist to get started.</div>
              </div>
              <Button onClick={() => setShowCreate(true)}>Create Playlist</Button>
            </div>
          </div>
        ) : (
          <>
            <PlaylistList playlists={list} onSelect={onSelect} />
            <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>
              Tip: Click a playlist card to open it, or select one below to edit details.
            </div>
          </>
        )}
      </section>

      <section style={{ marginTop: 16 }}>
        {showCreate && (
          <PlaylistEditor
            api={api}
            onSaved={(p) => {
              onCreatedOrUpdated(p);
              // also navigate into playlist detail after create
              if (p?.id) navigate(`/playlists/${encodeURIComponent(p.id)}`);
            }}
          />
        )}

        {currentEdit ? (
          <div style={{ marginTop: showCreate ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Edit: {currentEdit.name}</h2>
              <Button size="sm" variant="outline" onClick={() => setEditId(null)}>
                Close editor
              </Button>
            </div>
            <div style={{ height: 8 }} />
            <PlaylistEditor
              api={api}
              playlistId={currentEdit.id}
              initialName={currentEdit.name}
              initialDescription={currentEdit.description || ''}
              onSaved={onCreatedOrUpdated}
              onDeleted={onDeleted}
            />
          </div>
        ) : null}
      </section>

      {!loadingList && list.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <div className="u-card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Edit</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {list.map((p) => (
                <Button key={p.id} size="sm" variant="outline" onClick={() => setEditId(p.id)}>
                  Edit “{p.name}”
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
