import type { QueryClient, QueryKey } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/api';

export type PaginatedSnapshot<T> = [QueryKey, PaginatedResult<T> | undefined][];

/**
 * Optimistically removes an item from every cached page under `queryKey` (adjusting totals)
 * and returns the previous pages so a failed request can put them back.
 */
export const removeFromPaginatedCache = <T extends { _id: string }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string,
): PaginatedSnapshot<T> => {
  const snapshot = queryClient.getQueriesData<PaginatedResult<T>>({ queryKey });

  queryClient.setQueriesData<PaginatedResult<T>>({ queryKey }, (page) => {
    if (!page?.items.some((item) => item._id === id)) return page;
    const total = Math.max(0, page.meta.total - 1);
    return {
      items: page.items.filter((item) => item._id !== id),
      meta: { ...page.meta, total, totalPages: Math.ceil(total / page.meta.limit) },
    };
  });

  return snapshot;
};

/** Replaces an item (matched by _id) on every cached page under `queryKey`. */
export const replaceInPaginatedCache = <T extends { _id: string }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  item: T,
): void => {
  queryClient.setQueriesData<PaginatedResult<T>>({ queryKey }, (page) =>
    page?.items.some((existing) => existing._id === item._id)
      ? {
          ...page,
          items: page.items.map((existing) => (existing._id === item._id ? item : existing)),
        }
      : page,
  );
};

export const restorePaginatedCache = <T>(
  queryClient: QueryClient,
  snapshot: PaginatedSnapshot<T> | undefined,
): void => {
  snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
};
