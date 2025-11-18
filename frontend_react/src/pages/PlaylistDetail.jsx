import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import TrackList from '../components/TrackList';
import { usePagination } from '../hooks/usePagination';

/**
 * PUBLIC_INTERFACE
 * PlaylistDetail: Displays a single playlist with its tracks.
 */
export default function PlaylistDetail() {
  const { id } = useParams();
  const { api } = useAuth();
  const [meta, setMeta] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [errorMeta, setErrorMeta] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoadingMeta(true);
      setErrorMeta('');
      try {
        const res = await api.get(`/playlists/${encodeURIComponent(id)}`);
        if (!active) return;
        setMeta(res.data || null);
      } catch (e) {
        if (!active) return;
        setErrorMeta(e?.data?.message || e?.message || 'Failed to load playlist');
      } finally {
        if (active) setLoadingMeta(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [api, id]);

  const fetchTracks = useCallback(
    async ({ page, pageSize, signal }) => {
      const res = await api.get(`/playlists/${encodeURIComponent(id)}/tracks?page=${page}&limit=${pageSize}`, { signal });
      return normalizeList(res.data);
    },
    [api, id]
  );
  const tracks = usePagination(fetchTracks, { pageSize: 20, enabled: !!id });

  return (
    <div className="page">
      {loadingMeta ? (
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 16, alignItems: 'center' }}>
          <Skeleton width={120} height={120} radius="12px" />
          <div>
            <Skeleton width="40%" height={18} />
            <div style={{ height: 8 }} />
            <Skeleton width="70%" height={12} />
          </div>
          <Skeleton width={120} height={36} />
        </div>
      ) : errorMeta ? (
        <div role="alert" style={{ color: 'var(--error)' }}>
          {errorMeta}
        </div>
      ) : meta ? (
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 16, alignItems: 'center' }}>
          <div
            aria-hidden="true"
            style={{
              width: 120,
              height: 120,
              borderRadius: 12,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--secondary-500), var(--secondary-200))',
              border: '1px solid var(--border)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {meta.cover ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <img src={meta.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              '🎵'
            )}
          </div>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>{meta.name || 'Playlist'}</h1>
            <p className="page-desc">{meta.description || ''}</p>
          </div>
          <div>
            <Button>Play</Button>
          </div>
        </div>
      ) : null}

      <section style={{ marginTop: 16 }}>
        <TrackList
          tracks={tracks.items}
          loading={tracks.loading && tracks.items.length === 0}
          onPlay={() => {}}
          onAddToPlaylist={() => {}}
        />
        {tracks.error && <div role="alert" style={{ color: 'var(--error)', marginTop: 8 }}>{tracks.error}</div>}
        {tracks.hasMore && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
            <Button onClick={() => tracks.loadMore()} loading={tracks.loading} variant="outline">
              {tracks.loading ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function normalizeList(data) {
  if (!data) return { items: [], total: undefined };
  if (Array.isArray(data)) return { items: data, total: undefined };
  if (Array.isArray(data.items)) return { items: data.items, total: data.total };
  return { items: [], total: undefined };
}
