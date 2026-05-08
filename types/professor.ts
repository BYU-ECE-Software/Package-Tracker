import type { PaginatedResponse } from '@/components/general/data-display/Pagination';

export type ProfessorListResponse = PaginatedResponse<Professor>;

export interface Professor {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfessorRequest {
  firstName: string;
  lastName: string;
  title?: string | null;
  email?: string | null;
}

export interface UpdateProfessorRequest {
  firstName?: string;
  lastName?: string;
  title?: string | null;
  email?: string | null;
}

export interface ProfessorQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
