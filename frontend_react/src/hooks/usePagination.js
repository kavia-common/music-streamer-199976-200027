import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * usePagination: Hook to paginate through API results using a page param.
 * Accepts a fetcher function with signature fetcher({ page, pageSize, signal }).
 * Returns items, loading, error, hasMore, refresh, and loadMore.
 */
export function usePagination(fetcher, { pageSize = 20, startPage = 1, enabled = true } = {}) {
  /** Manage paginated list fetching with incremental loadMore and refresh. */
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(startPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const abortRef = useRef(null);

  const reset = useCallback(() => {
    setItems([]);
    setPage(startPage);
    setHasMore(true);
    setError('');
  }, [startPage]);

  const refresh = useCallback(async () => {
    reset();
    await new Promise((r) => setTimeout(r, 0));
    return loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  const loadMore = useCallback(
    async (fresh = false) => {
      if (!enabled || loading) return;
      if (!fresh && !hasMore) return;

      setLoading(true);
      setError('');

      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch {
          // ignore
        }
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const nextPage = fresh ? startPage : page;

      try {
        const res = await fetcher({
          page: nextPage,
          pageSize,
          signal: controller.signal,
        });

        const list = Array.isArray(res?.items) ? res.items : [];
        const total = typeof res?.total === 'number' ? res.total : undefined;
        const reachedEnd =
          list.length < pageSize || (typeof total === 'number' && items.length + list.length >= total);

        setItems((prev) => (fresh ? list : [...prev, ...list]));
        setPage((p) => (fresh ? startPage + 1 : p + 1));
        setHasMore(!reachedEnd);
      } catch (e) {
        if (e?.name === 'AbortError') return;
        const message = e?.data?.message || e?.message || 'Failed to load data';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [enabled, fetcher, hasMore, items.length, loading, page, pageSize, startPage]
  );

  useEffect(() => {
    if (!enabled) return;
    if (items.length === 0 && hasMore && !loading) {
      loadMore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const state = useMemo(
    () => ({ items, loading, error, hasMore, page }),
    [items, loading, error, hasMore, page]
  );

  return { ...state, refresh, loadMore, reset };
}

/**
 * PUBLIC_INTERFACE
 * useInfiniteScroll: Observer-based trigger for infinite scroll.
 * Provide a ref to attach to the sentinel element.
 */
export function useInfiniteScroll(callback, { root = null, rootMargin = '200px', threshold = 0 } = {}) {
  /** Creates an intersection observer to invoke callback when sentinel is visible. */
  const sentinelRef = useRef(null);
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cbRef.current?.();
          }
        });
      },
      { root, rootMargin, threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold]);

  return { sentinelRef };
}
