'use client';

import { useEffect } from 'react';

interface ClampPageOptions {
  page: number;
  totalPages: number | undefined;
  /** Skip while showing the previous query's data: its totalPages may be stale. */
  isPlaceholderData: boolean;
  setPage: (page: number) => void;
}

/** A link or a deletion can leave you past the last page: move to the last real one. */
export function useClampPage({ page, totalPages, isPlaceholderData, setPage }: ClampPageOptions) {
  useEffect(() => {
    if (!isPlaceholderData && totalPages && page > totalPages) setPage(totalPages);
  }, [isPlaceholderData, page, setPage, totalPages]);
}
