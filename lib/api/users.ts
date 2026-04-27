// ============================================
// lib/api/users.ts - User API Functions
// ============================================

import { type
  User,
  UserListResponse,
  UserQueryParams,
  UserWithPackages,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/types/user';
import { UserRole } from '@prisma/client';

/**
 * Fetch all users with optional filtering and pagination
 */
export async function fetchUsers(params: UserQueryParams = {}): Promise<UserListResponse> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const qs = searchParams.toString();
  
  const res = await fetch(`/api/users?${qs}`, {
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
  return fetchUsersByRole(UserRole.STUDENT);
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