import { useCallback, useEffect, useRef, useState } from "react";

type FetchPageParams = {
  page: number;
  pageSize: number;
};

type UsePaginatedDataParams<T> = {
  pageSize: number;
  enabled?: boolean;
  dependencies?: unknown[];
  fetchPage: (params: FetchPageParams) => Promise<T[]>;
  onError?: (error: unknown) => void;
};

export function usePaginatedData<T>({
  pageSize,
  enabled = true,
  dependencies = [],
  fetchPage,
  onError,
}: UsePaginatedDataParams<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isMountedRef = useRef(true);

  const loadPage = useCallback(
    async (targetPage: number, replace = false) => {
      try {
        if (targetPage === 0 && replace) {
          setLoadingInitial(true);
        } else {
          setLoadingMore(true);
        }

        const data = await fetchPage({
          page: targetPage,
          pageSize: pageSize + 1,
        });

        if (!isMountedRef.current) {
          return;
        }

        const nextItems = data.slice(0, pageSize);
        const nextHasMore = data.length > pageSize;

        setItems((currentItems) =>
          replace ? nextItems : [...currentItems, ...nextItems],
        );
        setPage(targetPage);
        setHasMore(nextHasMore);
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }

        onError?.(error);
      } finally {
        if (!isMountedRef.current) {
          return;
        }

        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [fetchPage, onError, pageSize],
  );

  const refresh = useCallback(() => {
    if (!enabled) {
      setItems([]);
      setPage(0);
      setHasMore(false);
      return;
    }

    setItems([]);
    setPage(0);
    setHasMore(true);
    loadPage(0, true);
  }, [enabled, loadPage]);

  const loadMore = useCallback(() => {
    if (loadingInitial || loadingMore || !hasMore) {
      return;
    }

    loadPage(page + 1, false);
  }, [hasMore, loadPage, loadingInitial, loadingMore, page]);

  useEffect(() => {
    isMountedRef.current = true;

    refresh();

    return () => {
      isMountedRef.current = false;
    };
  }, dependencies);

  return {
    items,
    setItems,
    loadingInitial,
    loadingMore,
    hasMore,
    refresh,
    loadMore,
  };
}
