import type { User } from './user';
import type { SpendCategory } from './spendCategory';
import type { LineMemoOption } from './lineMemoOption';
import type { Professor } from './professor';
import type { DropdownEntity } from '@/types/general/DropdownEntity';
import type { PaginatedResponse } from '@/components/general/data-display/Pagination';
import type { Status } from '@prisma/client';

export type OrderListResponse = PaginatedResponse<Order>;

export interface Item {
  id: string;
  name: string;
  quantity: number;
  status: Status;
  link: string | null;
  file: string | null;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  requestDate: Date;
  status: Status;
  shippingPreference: string | null;
  purpose: string;
  workTag: string;
  cartLink: string | null;
  comment: string | null;

  tax: number | null;
  total: number | null;

  userId: string;
  user?: User;

  vendorId: string;
  vendor?: DropdownEntity;

  professorId: string;
  professor?: Professor;

  spendCategoryId: string;
  spendCategory?: SpendCategory;

  lineMemoOptionId: number | null;
  lineMemoOption?: LineMemoOption | null;

  purchasedById: string | null;
  purchasedBy?: User | null;
  creditCard: boolean | null;
  purchaseDate: Date | null;
  receipt: string[];
  adminComment: string | null;

  items?: Item[];

  createdAt: Date;
  updatedAt: Date;
}

// Inline item payload used when creating an order in a single request.
export interface CreateOrderItem {
  name: string;
  quantity: number;
  status?: Status;
  link?: string | null;
}

export interface CreateOrderRequest {
  requestDate: Date | string;
  vendorId: string;
  professorId: string;
  spendCategoryId: string;
  purpose: string;
  workTag: string;
  items: CreateOrderItem[];

  // Optional fields
  shippingPreference?: string | null;
  comment?: string | null;
  cartLink?: string | null;
  lineMemoOptionId?: number | null;
  tax?: number | null;
  total?: number | null;

  // User resolution: while the route is public, we connectOrCreate by netId
  // from these three fields. Once auth is wired, this will be replaced by a
  // session lookup and these fields will be dropped from the payload.
  fullName: string;
  netId: string;
  email: string;
}

export interface UpdateOrderRequest {
  requestDate?: Date | string;
  status?: Status;
  shippingPreference?: string | null;
  purpose?: string;
  workTag?: string;
  cartLink?: string | null;
  comment?: string | null;
  adminComment?: string | null;

  tax?: number | null;
  total?: number | null;

  vendorId?: string;
  professorId?: string;
  spendCategoryId?: string;
  lineMemoOptionId?: number | null;

  purchasedById?: string | null;
  creditCard?: boolean | null;
  purchaseDate?: Date | string | null;
}

export interface UpdateItemRequest {
  name?: string;
  quantity?: number;
  status?: Status;
  link?: string | null;
}

export interface OrderQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';

  status?: Status;
  userId?: string;
  professorId?: string;
  spendCategoryId?: string;
  vendorId?: string;
  purchasedById?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  query?: string;
}
