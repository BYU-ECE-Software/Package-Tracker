// ============================================
// 2. TYPESCRIPT TYPES (types/package.ts)
// ============================================

import { User } from './user';

export enum PackageStatus {
  AWAITING_ARRIVAL = 'AWAITING_ARRIVAL',
  ARRIVED = 'ARRIVED',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  PICKED_UP = 'PICKED_UP',
  RETURNED_TO_SENDER = 'RETURNED_TO_SENDER',
  LOST = 'LOST',
}

export interface Package {
  id: string;
  trackingNumber: string | null;
  carrier: string | null;
  sender: string | null;
  status: PackageStatus;
  expectedArrivalDate: Date | null;
  dateArrived: Date | null;
  datePickedUp: Date | null;
  studentId: string;
  student?: User;
  checkedInById: string | null;
  checkedInBy?: User | null;
  checkedOutById: string | null;
  checkedOutBy?: User | null;
  notes: string | null;
  location: string | null;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types
export interface CreatePackageRequest {
  trackingNumber?: string;
  carrier?: string;
  sender?: string;
  expectedArrivalDate?: string;
  studentId: string;
  notes?: string;
  location?: string;
}

export interface AddPackageData {
  studentId: string;
  trackingNumber?: string;
  carrier?: string;
  sender?: string;
  expectedArrivalDate?: string;
  location?: string;
  notes?: string;
}

export interface UpdatePackageRequest {
  trackingNumber?: string;
  carrier?: string;
  sender?: string;
  status?: PackageStatus;
  expectedArrivalDate?: string;
  dateArrived?: string;
  datePickedUp?: string;
  checkedInById?: string;
  checkedOutById?: string;
  notes?: string;
  location?: string;
  notificationSent?: boolean;
}

export interface PackageQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  status?: PackageStatus;
  studentId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}