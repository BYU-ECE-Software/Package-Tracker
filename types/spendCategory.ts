import type { PaginatedResponse } from '@/components/general/data-display/Pagination';

export type SpendCategoryListResponse = PaginatedResponse<SpendCategory>;

export interface SpendCategory {
  id: string;
  code: string;
  description: string;
  visibleToStudents: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSpendCategoryRequest {
  code: string;
  description: string;
  visibleToStudents?: boolean;
}

export interface UpdateSpendCategoryRequest {
  code?: string;
  description?: string;
  visibleToStudents?: boolean;
}

export interface SpendCategoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  visibleToStudents?: boolean;
}
