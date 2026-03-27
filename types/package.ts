import { User } from './user';

export interface Carrier {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Sender {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Package {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  carrierId: string | null;
  carrier?: Carrier | null;
  senderId: string | null;
  sender?: Sender | null;
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
