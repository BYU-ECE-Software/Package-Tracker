import type { Package } from './package';
import type { PaginatedResponse } from './pagination';


export type UserListResponse = PaginatedResponse<User>;

export enum UserRole {
  STUDENT = 'STUDENT',
  SECRETARY = 'SECRETARY',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  netId: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  netId: string;
  email: string;
  fullName: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  role?: UserRole;
}

// Query parameters for fetching users
export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  search?: string;
}

// User with packages included
export interface UserWithPackages extends User {
  packages: Package[];
}
