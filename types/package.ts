import type { User } from './user';
import type { DropdownEntity } from '@/types/dropdown';
import type { PaginatedResponse } from './pagination';
import type { PackageStatus } from '@prisma/client';

export type PackageListResponse = PaginatedResponse<Package>;

export interface Package {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  carrierId: string | null;
  carrier?: DropdownEntity | null;
  senderId: string | null;
  sender?: DropdownEntity | null;
  dateArrived: Date;
  datePickedUp: Date | null;
  recipientId: string;
  recipient?: User;
  checkedInById: string | null;
  checkedInBy?: User | null;
  checkedOutById: string | null;
  checkedOutBy?: User | null;
  pickedUpByUserId: string | null;      // NEW
  pickedUpBy?: User | null;             // NEW
  deliveredToOffice: boolean;
  status: PackageStatus;                // NEW
  notes: string | null;
  notificationSent: boolean;
  notifications?: PackageNotification[];
}

export interface PackageNotification {
  id: string;
  packageId: string;
  recipientId: string;
  subject: string;
  body: string;
  sentAt: Date;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePackageRequest {
  recipientId: string;
  carrierId?: string;
  senderId?: string;
  notes?: string;
  dateArrived?: string;
  checkedInById?: string;
  notificationSent?: boolean; // Added
  emailOptions?: {             // Added
    subject: string;
    body: string;
  };
}

export interface UpdatePackageRequest {
  carrierId?: string;
  senderId?: string;
  dateArrived?: string;
  datePickedUp?: string;
  checkedInById?: string;
  checkedOutById?: string;
  pickedUpByUserId?: string;
  deliveredToOffice?: boolean;
  notes?: string;
  notificationSent?: boolean;
}

export interface PackageQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  recipientId?: string;
  activeOnly?: boolean;
  carrierId?: string;
  senderId?: string;
}