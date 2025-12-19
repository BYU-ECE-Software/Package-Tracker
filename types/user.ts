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