import type { Package } from './package';
import type { PaginatedResponse } from './pagination';
import type { Role } from '@prisma/client';

export type UserListResponse = PaginatedResponse<User>;

export interface User {
  id: string;
  netId: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  netId: string;
  email: string;
  fullName: string;
  role?: Role;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  role?: Role;
}

// Query parameters for fetching users
export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  role?: Role;
  search?: string;
}

// User with packages included
export interface UserWithPackages extends User {
  packages: Package[];
}
