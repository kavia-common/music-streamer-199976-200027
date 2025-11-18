import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Skeleton from './ui/Skeleton';
import TrackList from './TrackList';

/**
 * PUBLIC_INTERFACE
 * PlaylistEditor: A reusable editor to manage a playlist's details and tracks.
 * Supports optimistic create, rename, delete, add/remove tracks, and simple up/down reordering.
 *
 * Props:
 * - playlistId?: string | undefined  (if undefined, starts as a new playlist draft)
 * - initialName?: string
 * - initialDescription?: string
 * - onSaved?: (playlist) => void     (called after create/rename when server confirms)
 * - onDeleted?: () => void           (called when server confirms delete)
 * - readOnly?: boolean               (disable editing controls)
 *
 * Implementation notes:
 * - Uses generic placeholder API endpoints without hardcoding backend details:
 *   * GET /me/playlists                -> list used elsewhere
 *   * POST /playlists                  -> create { name, description }
 *   * GET /playlists/:id               -> fetch metadata
 *   * PATCH /playlists/:id             -> rename/update { name, description }
 *   * DELETE /playlists/:id            -> delete
 *   * GET /playlists/:id/tracks        -> list tracks
 *   * POST /playlists/:id/tracks       -> add { trackId }
 *   * DELETE /playlists/:id/tracks/:trackId -> remove
 *   * PATCH /playlists/:id/tracks/reorder  -> { trackId, direction: 'up'|'down' }
 *
 * Optimistic UI:
 * - Immediately updates local state for create/rename/delete/track operations.
 * - Reconciles with server response; on error, rolls back local change and surfaces error text.
 */

// PUBLIC_INTERFACE
export default function PlaylistEditor({
  api,
  playlistId,
  initialName = '',
  initialDescription = '',
  onSaved,
  onDeleted,
  readOnly = false,
}) {
  const isNew = !playlistId;

  // Local state
  const [meta, setMeta] = useState({ id: playlistId, name: initialName, description: initialDescription });
  const [tracks, setTracks] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(!isNew);
  const [loadingTracks, setLoadingTracks] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load existing playlist meta and tracks if editing
  useEffect(() => {
    if (!playlistId) return;
    let active = true;

    async function loadMeta() {
      setLoadingMeta(true);
      setError('');
      try {
        const res = await api.get(`/playlists/${encodeURIComponent(playlistId)}`);
        if (!active) return;
        const d = res.data || {};
        setMeta({ id: d.id || playlistId, name: d.name || '', description: d.description || '' });
      } catch (e) {
        if (!active) return;
        setError(e?.data?.message || e?.message || 'Failed to load playlist');
      } finally {
        if (active) setLoadingMeta(false);
      }
    }

    async function loadTracks() {
      setLoadingTracks(true);
      try {
        const res = await api.get(`/playlists/${encodeURIComponent(playlistId)}/tracks`);
        if (!active) return;
        const items = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.items) ? res.data.items : [];
        setTracks(items);
      } catch (e) {
        if (!active) return;
        setError((prev) => prev || e?.data?.message || e?.message || 'Failed to load tracks');
      } finally {
        if (active) setLoadingTracks(false);
      }
    }

    loadMeta();
    loadTracks();

    return () => {
      active = false;
    };
  }, [api, playlistId]);

  const canSave = useMemo(() => (meta.name || '').trim().length > 0, [meta.name]);

  // Create or update playlist
  const onSave = useCallback(async () => {
    if (readOnly || !canSave) return;
    setSaving(true);
    setError('');

    if (isNew) {
      // Optimistically assume creation
      const optimistic = { ...meta };
      try {
        const res = await api.post('/playlists', { name: meta.name, description: meta.description || '' });
        const saved = res.data || {};
        const finalMeta = { id: saved.id || optimistic.id, name: saved.name || optimistic.name, description: saved.description || optimistic.description };
        setMeta(finalMeta);
        // notify parent
        onSaved?.(finalMeta);
      } catch (e) {
        setError(e?.data?.message || e?.message || 'Failed to create playlist');
      } finally {
        setSaving(false);
      }
    } else {
      // rename/update
      const prev = { ...meta };
      try {
        await api.patch(`/playlists/${encodeURIComponent(meta.id)}`, {
          name: meta.name,
          description: meta.description || '',
        });
        onSaved?.(meta);
      } catch (e) {
        setMeta(prev); // rollback
        setError(e?.data?.message || e?.message || 'Failed to save changes');
      } finally {
        setSaving(false);
      }
    }
  }, [api, canSave, isNew, meta, onSaved, readOnly]);

  const onDelete = useCallback(async () => {
    if (readOnly) return;
    if (!meta.id) return;
    const prev = { meta, tracks };
    // optimistic: clear
    setMeta((m) => ({ ...m, deleting: true }));
    try {
      await api.delete(`/playlists/${encodeURIComponent(meta.id)}`);
      onDeleted?.();
    } catch (e) {
      // rollback
      setMeta(prev.meta);
      setTracks(prev.tracks);
      setError(e?.data?.message || e?.message || 'Failed to delete playlist');
    }
  }, [api, meta, onDeleted, readOnly, tracks]);

  // Track operations
  const addTrack = useCallback(
    async (track) => {
      if (readOnly) return;
      if (!meta.id) {
        setError('Save the playlist before adding tracks.');
        return;
      }
      const exists = tracks.some((t) => t.id === track.id);
      if (exists) return;
      // optimistic add
      const prev = [...tracks];
      setTracks((list) => [...list, track]);
      try {
        await api.post(`/playlists/${encodeURIComponent(meta.id)}/tracks`, { trackId: track.id });
      } catch (e) {
        // rollback
        setTracks(prev);
        setError(e?.data?.message || e?.message || 'Failed to add track');
      }
    },
    [api, meta.id, readOnly, tracks]
  );

  const removeTrack = useCallback(
    async (trackId) => {
      if (readOnly) return;
      if (!meta.id) return;
      const idx = tracks.findIndex((t) => t.id === trackId);
      if (idx === -1) return;
      const prev = [...tracks];
      // optimistic remove
      setTracks((list) => list.filter((t) => t.id !== trackId));
      try {
        await api.delete(`/playlists/${encodeURIComponent(meta.id)}/tracks/${encodeURIComponent(trackId)}`);
      } catch (e) {
        setTracks(prev);
        setError(e?.data?.message || e?.message || 'Failed to remove track');
      }
    },
    [api, meta.id, readOnly, tracks]
  );

  const moveTrack = useCallback(
    async (trackId, direction) => {
      if (readOnly) return;
      if (!meta.id) return;
      const index = tracks.findIndex((t) => t.id === trackId);
      if (index === -1) return;
      const delta = direction === 'up' ? -1 : 1;
      const target = index + delta;
      if (target < 0 || target >= tracks.length) return;

      const prev = [...tracks];
      const next = [...tracks];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      setTracks(next);

      try {
        await api.patch(`/playlists/${encodeURIComponent(meta.id)}/tracks/reorder`, { trackId, direction });
      } catch (e) {
        setTracks(prev);
        setError(e?.data?.message || e?.message || 'Failed to reorder track');
      }
    },
    [api, meta.id, readOnly, tracks]
  );

  // UI helpers
  const onNameChange = (e) => setMeta((m) => ({ ...m, name: e.target.value }));
  const onDescChange = (e) => setMeta((m) => ({ ...m, description: e.target.value }));

  return (
    <div>
      <section className="u-card" style={{ padding: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{isNew ? 'Create Playlist' : 'Edit Playlist'}</h2>
        <div style={{ height: 8 }} />
        {loadingMeta ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <Skeleton height={16} />
            <Skeleton height={16} />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            <Input label="Name" placeholder="My Playlist" value={meta.name} onChange={onNameChange} disabled={readOnly} required />
            <Input label="Description" placeholder="Optional description" value={meta.description || ''} onChange={onDescChange} disabled={readOnly} />
            {error && (
              <div role="alert" style={{ color: 'var(--error)', fontSize: 13 }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              {!readOnly && (
                <Button onClick={onSave} loading={saving} disabled={!canSave}>
                  {isNew ? 'Create' : 'Save'}
                </Button>
              )}
              {!isNew && !readOnly && (
                <Button variant="danger" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      {!isNew && (
        <section style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Tracks</h3>
          </div>
          <div style={{ marginTop: 8 }}>
            {loadingTracks ? (
              <TrackList tracks={[]} loading />
            ) : tracks.length === 0 ? (
              <div className="u-card" style={{ padding: 12, color: 'var(--text-muted)' }}>
                No tracks in this playlist yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {tracks.map((t, i) => (
                  <div
                    key={t.id || i}
                    className="u-card"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 10,
                      padding: 8,
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{t.title || 'Track'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.artist || ''}</div>
                    </div>
                    {!readOnly && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button size="sm" variant="outline" onClick={() => moveTrack(t.id, 'up')} disabled={i === 0}>
                          ↑
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => moveTrack(t.id, 'down')} disabled={i === tracks.length - 1}>
                          ↓
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => removeTrack(t.id)}>
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
