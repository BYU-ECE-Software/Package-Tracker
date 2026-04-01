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
}