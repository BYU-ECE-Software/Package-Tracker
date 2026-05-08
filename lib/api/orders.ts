// ============================================
// lib/api/orders.ts - Order & Item API Functions
// ============================================

import type {
  Order,
  Item,
  OrderListResponse,
  OrderQueryParams,
  CreateOrderRequest,
  UpdateOrderRequest,
  UpdateItemRequest,
} from '@/types/order';
import type { OrderEmailType } from '@/lib/notifications/orderEmailTemplates';

export type SendOrderNotificationRequest = {
  to: string;
  subject: string;
  body: string;
  recipientName?: string;
  type: OrderEmailType;
};

export async function sendOrderNotification(
  orderId: string,
  data: SendOrderNotificationRequest,
): Promise<void> {
  const res = await fetch(`/api/orders/${orderId}/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res
      .json()
      .catch(() => ({ error: 'Failed to send notification' }));
    throw new Error(body.error || 'Failed to send notification');
  }
}

export async function fetchOrders(
  params: OrderQueryParams = {},
): Promise<OrderListResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const qs = searchParams.toString();

  const res = await fetch(`/api/orders${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to fetch orders' }));
    throw new Error(error.error || 'Failed to fetch orders');
  }

  return res.json();
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Order not found');
    const error = await res.json().catch(() => ({ error: 'Failed to fetch order' }));
    throw new Error(error.error || 'Failed to fetch order');
  }

  return res.json();
}

export async function fetchOrdersForUser(userId: string): Promise<Order[]> {
  const res = await fetch(`/api/orders/user/${userId}`, { cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('User not found');
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to fetch user's orders" }));
    throw new Error(error.error || "Failed to fetch user's orders");
  }

  return res.json();
}

export async function createOrder(data: CreateOrderRequest): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to create order' }));
    throw new Error(error.error || 'Failed to create order');
  }

  return res.json();
}

export async function updateOrder(
  id: string,
  data: UpdateOrderRequest,
): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Order not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to update order' }));
    throw new Error(error.error || 'Failed to update order');
  }

  return res.json();
}

export async function deleteOrder(id: string): Promise<void> {
  const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Order not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to delete order' }));
    throw new Error(error.error || 'Failed to delete order');
  }
}

export async function updateItem(
  id: string,
  data: UpdateItemRequest,
): Promise<Item> {
  const res = await fetch(`/api/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Item not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to update item' }));
    throw new Error(error.error || 'Failed to update item');
  }

  return res.json();
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Item not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to delete item' }));
    throw new Error(error.error || 'Failed to delete item');
  }
}
