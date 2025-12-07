import { useState, useEffect, useRef, useCallback } from 'react';

interface PaginationMeta {
  hasNext: boolean;
  [key: string]: any;
}

interface PaginationResponse {
  success: boolean;
  data: {
    [key: string]: any;
    meta: PaginationMeta;
  };
  message?: string;
  error?: string;
  status?: number;
}

type UseInfiniteScrollOptions = {
  fetchFn: (params?: any) => Promise<PaginationResponse>;
  limit?: number;
  threshold?: number;
  dataKey: string; // The key in response.data that contains the array (e.g., 'profiles', 'buyers', 'orders')
}


export function useInfinitePagination<T, M>(options: UseInfiniteScrollOptions) {
  const { fetchFn, limit = 10, threshold = 0.1, dataKey } = options;

  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [meta, setMeta] = useState<M | null>(null);

  const loadItems = useCallback(
    async (pageNum: number, reset = false, additionalParams: any = {}) => {
      try {
        if (reset) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const response = await fetchFn({
          page: pageNum,
          limit,
          ...additionalParams
        });

        if (response.success && response.data) {
          const newItems = response.data[dataKey] as T[];
          setItems((prev) => (reset ? newItems : [...prev, ...newItems]));
          setHasMore(response.data.meta.hasNext);
          setMeta(response.data.meta as M);
        }
      } catch (error) {
        console.error('Failed to load items:', error);
        throw error;
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [fetchFn, limit, dataKey]
  );

  useEffect(() => {
    if (page > 1) {
      loadItems(page);
    }
  }, [loadItems, page]);

  // Reset function to reload from page 1
  const reset = useCallback(
    (additionalParams: any = {}) => {
      setPage(1);
      return loadItems(1, true, additionalParams);
    },
    [loadItems]
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, threshold]);

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    observerTarget,
    loadItems,
    reset,
    setItems,
    meta
  };
}
