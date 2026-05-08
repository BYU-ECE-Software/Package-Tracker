import type { User } from './user';
import type { DropdownEntity } from '@/types/general/DropdownEntity';
import type { PaginatedResponse } from '@/components/general/data-display/Pagination';
import type { NotificationType } from '@prisma/client';

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
  checkedInById: string;
  checkedInBy?: User;
  checkedOutById: string | null;
  checkedOutBy?: User | null;
  pickedUpByUserId: string | null;      // NEW
  pickedUpBy?: User | null;             // NEW
  deliveredToOffice: boolean;
  notes: string | null;
  notifications?: PackageNotification[];
}

export interface PackageNotification {
  id: string;
  packageId: string;
  recipientId: string;
  type: NotificationType;
  subject: string;
  body: string;
  sentAt: Date;
}

export interface CreatePackageRequest {
  recipientId: string;
  carrierId?: string;
  senderId?: string;
  notes?: string;
  dateArrived?: Date | string;
  checkedInById: string;
  emailOptions?: {
    subject: string;
    body: string;
  };
}

export interface UpdatePackageRequest {
  carrierId?: string;
  senderId?: string;
  dateArrived?: Date | string;
  datePickedUp?: Date | string;
  checkedInById?: string;
  checkedOutById?: string;
  pickedUpByUserId?: string;
  deliveredToOffice?: boolean;
  notes?: string;
}

export interface PackageQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  recipientId?: string;
  activeOnly?: boolean;
  carrierId?: string;
  senderId?: string;
}