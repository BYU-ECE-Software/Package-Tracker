import type { PaginatedResponse } from '@/components/general/data-display/Pagination';

export type LineMemoOptionListResponse = PaginatedResponse<LineMemoOption>;

// id is a manually-entered Workday code, not a CUID.
export interface LineMemoOption {
  id: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLineMemoOptionRequest {
  id: number;
  description: string;
}

export interface UpdateLineMemoOptionRequest {
  description?: string;
}

export interface LineMemoOptionQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
