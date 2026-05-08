// ============================================
// lib/minio/orderFiles.ts - Client-side helpers for order receipts and item files
// ============================================
//
// Mirrors lib/minio/uploadedFiles.ts. Each upload helper returns the updated
// row (Order or Item) so callers don't need to re-fetch separately.

import type { Order, Item } from '@/types/order';

// -------- Receipts (Order.receipt[]) --------

export async function uploadReceipt(orderId: string, file: File): Promise<Order> {
  const formData = new FormData();
  formData.append('receipt', file);

  const res = await fetch(`/api/orders/${orderId}/receipts`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to upload receipt' }));
    throw new Error(error.error || 'Failed to upload receipt');
  }

  return res.json();
}

export async function deleteReceipt(orderId: string, filename: string): Promise<Order> {
  const qs = new URLSearchParams({ filename }).toString();
  const res = await fetch(`/api/orders/${orderId}/receipts?${qs}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to delete receipt' }));
    throw new Error(error.error || 'Failed to delete receipt');
  }

  return res.json();
}

export async function getReceiptSignedUrl(
  orderId: string,
  filename: string,
): Promise<string> {
  const res = await fetch(
    `/api/orders/${orderId}/receipts/${encodeURIComponent(filename)}/url`,
    { cache: 'no-store' },
  );

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to get receipt URL' }));
    throw new Error(error.error || 'Failed to get receipt URL');
  }

  const { url } = await res.json();
  return url;
}

// -------- Item files (Item.file) --------

export async function uploadItemFile(itemId: string, file: File): Promise<Item> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/items/${itemId}/file`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to upload item file' }));
    throw new Error(error.error || 'Failed to upload item file');
  }

  return res.json();
}

export async function deleteItemFile(itemId: string): Promise<Item> {
  const res = await fetch(`/api/items/${itemId}/file`, { method: 'DELETE' });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to delete item file' }));
    throw new Error(error.error || 'Failed to delete item file');
  }

  return res.json();
}

export async function getItemFileSignedUrl(itemId: string): Promise<string> {
  const res = await fetch(`/api/items/${itemId}/file/url`, { cache: 'no-store' });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to get item file URL' }));
    throw new Error(error.error || 'Failed to get item file URL');
  }

  const { url } = await res.json();
  return url;
}
