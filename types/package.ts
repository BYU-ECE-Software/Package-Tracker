import type { User } from './user';
import type { DropdownEntity } from '@/components/ui/admin/DropdownEditor';
import type { PaginatedResponse } from './pagination';

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
  deliveredToOffice: boolean;
  notes: string | null;
  notificationSent: boolean;
}

export interface CreatePackageRequest {
  recipientId: string;
  carrierId?: string;
  senderId?: string;
  notes?: string;
  dateArrived?: string;
  checkedInById?: string;
}

export interface UpdatePackageRequest {
  carrierId?: string;
  senderId?: string;
  dateArrived?: string;
  datePickedUp?: string;
  checkedInById?: string;
  checkedOutById?: string;
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
}
