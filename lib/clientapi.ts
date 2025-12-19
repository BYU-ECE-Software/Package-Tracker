// ============================================
// 5. CLIENT API FUNCTIONS (lib/api/packages.ts)
// ============================================

import type { Package, PackageQueryParams, CreatePackageRequest, UpdatePackageRequest } from '@/types/package';

export async function fetchPackages(params: PackageQueryParams) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const res = await fetch(`/api/packages?${searchParams}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) throw new Error('Failed to fetch packages');
  return res.json();
}

export async function fetchPackageById(id: string): Promise<Package> {
  const res = await fetch(`/api/packages/${id}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) throw new Error('Failed to fetch package');
  return res.json();
}

export async function createPackage(data: CreatePackageRequest): Promise<Package> {
  const res = await fetch('/api/packages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) throw new Error('Failed to create package');
  return res.json();
}

export async function updatePackage(id: string, data: UpdatePackageRequest): Promise<Package> {
  const res = await fetch(`/api/packages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) throw new Error('Failed to update package');
  return res.json();
}

export async function deletePackage(id: string): Promise<void> {
  const res = await fetch(`/api/packages/${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) throw new Error('Failed to delete package');
}

export async function checkInPackage(id: string, employeeId: string, location?: string): Promise<Package> {
  const res = await fetch(`/api/packages/${id}/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, location }),
  });
  
  if (!res.ok) throw new Error('Failed to check in package');
  return res.json();
}

export async function checkOutPackage(id: string, employeeId: string): Promise<Package> {
  const res = await fetch(`/api/packages/${id}/check-out`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId }),
  });
  
  if (!res.ok) throw new Error('Failed to check out package');
  return res.json();
}

// ============================================
// lib/api/users.ts - User API Functions
// ============================================

import type { User, UserRole } from '@/types/package';

// Query parameters for fetching users
export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  search?: string;
}

// Request types for creating/updating users
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

// Response type for paginated user list
export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// User with packages included
export interface UserWithPackages extends User {
  orderedPackages: any[]; // Use your Package type here
}

/**
 * Fetch all users with optional filtering and pagination
 */
export async function fetchUsers(params: UserQueryParams): Promise<UserListResponse> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const res = await fetch(`/api/users?${searchParams}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch users' }));
    throw new Error(error.error || 'Failed to fetch users');
  }
  
  return res.json();
}

/**
 * Fetch a single user by ID with their packages
 */
export async function fetchUserById(id: string): Promise<UserWithPackages> {
  const res = await fetch(`/api/users/${id}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('User not found');
    }
    const error = await res.json().catch(() => ({ error: 'Failed to fetch user' }));
    throw new Error(error.error || 'Failed to fetch user');
  }
  
  return res.json();
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to create user' }));
    throw new Error(error.error || 'Failed to create user');
  }
  
  return res.json();
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('User not found');
    }
    const error = await res.json().catch(() => ({ error: 'Failed to update user' }));
    throw new Error(error.error || 'Failed to update user');
  }
  
  return res.json();
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('User not found');
    }
    const error = await res.json().catch(() => ({ error: 'Failed to delete user' }));
    throw new Error(error.error || 'Failed to delete user');
  }
}

/**
 * Fetch users by role (convenience function)
 */
export async function fetchUsersByRole(role: UserRole): Promise<User[]> {
  const response = await fetchUsers({ role, pageSize: 1000 });
  return response.data;
}

/**
 * Fetch all students (convenience function)
 */
export async function fetchStudents(): Promise<User[]> {
  return fetchUsersByRole('STUDENT');
}

/**
 * Fetch all employees (secretaries and admins) (convenience function)
 */
export async function fetchEmployees(): Promise<User[]> {
  const response = await fetchUsers({ pageSize: 1000 });
  return response.data.filter(u => u.role === 'SECRETARY' || u.role === 'ADMIN');
}

/**
 * Search users by name, netId, or email
 */
export async function searchUsers(searchTerm: string): Promise<User[]> {
  const response = await fetchUsers({ search: searchTerm, pageSize: 50 });
  return response.data;
}