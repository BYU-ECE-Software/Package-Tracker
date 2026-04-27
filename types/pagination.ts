export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
}

export interface PaginationProps {
  totalItems: number;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  setPageSize: (size: number) => void;

  // Cosmetic / configurability
  itemLabel?: string;          // default 'Items', shown next to the page-size selector
  pageSizeOptions?: number[];  // default [10, 25, 50, 100]
  delta?: number;              // default 1, sibling pages shown on each side of current
  className?: string;          // extra classes appended to the outer wrapper
}