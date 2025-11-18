import React, { useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import AlbumGrid from '../components/AlbumGrid';
import Button from '../components/ui/Button';
import { usePagination, useInfiniteScroll } from '../hooks/usePagination';

/**
 * PUBLIC_INTERFACE
 * Browse: Explore albums and categories.
 */
export default function Browse() {
  const { api } = useAuth();

  const fetchAlbums = useCallback(
    async ({ page, pageSize, signal }) => {
      const res = await api.get(`/albums?page=${page}&limit=${pageSize}`, { signal });
      return normalizeList(res.data);
    },
    [api]
  );
  const albums = usePagination(fetchAlbums, { pageSize: 16 });

  const { sentinelRef } = useInfiniteScroll(() => {
    if (!albums.loading && albums.hasMore) albums.loadMore();
  });

  return (
    <div className="page">
      <h1 className="page-title">Browse</h1>
      <p className="page-desc">Explore genres, new releases, and more.</p>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <Button size="sm" onClick={() => albums.refresh()} variant="outline">
          Refresh
        </Button>
      </div>

      <div style={{ marginTop: 12 }}>
        <AlbumGrid
          albums={albums.items}
          loading={albums.loading && albums.items.length === 0}
          onSelect={() => {}}
        />
        {albums.error && (
          <div role="alert" style={{ color: 'var(--error)', marginTop: 8 }}>
            {albums.error}
          </div>
        )}
        {albums.hasMore && <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />}
        {albums.loading && albums.items.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <Button loading size="sm" variant="ghost">
              Loading more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeList(data) {
  if (!data) return { items: [], total: undefined };
  if (Array.isArray(data)) return { items: data, total: undefined };
  if (Array.isArray(data.items)) return { items: data.items, total: data.total };
  return { items: [], total: undefined };
}
