'use client';

import { useCallback, useState } from 'react';

export type UsePaginationOptions = {
  initialPage?: number;
  initialPageSize?: number;
};

export type Pagination = {
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  reset: () => void;
};

export function usePagination({
  initialPage = 1,
  initialPageSize = 25,
}: UsePaginationOptions = {}): Pagination {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setPage = useCallback((page: number) => {
    setCurrentPage((prev) => (prev === page ? prev : page));
  }, []);

  // Changing page size from the middle of a long list and staying on the
  // same page number would usually land past the end, so snap back to 1.
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  const reset = useCallback(() => setCurrentPage(1), []);

  return { currentPage, pageSize, setPage, setPageSize, reset };
}
