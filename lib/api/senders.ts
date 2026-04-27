// ============================================
// Sender API Functions
// ============================================

import type { DropdownEntity } from '@/types/dropdown';

export async function fetchSenders(activeOnly?: boolean): Promise<DropdownEntity[]> {
  const searchParams = new URLSearchParams();
  if (activeOnly) searchParams.append('activeOnly', 'true');

  const qs = searchParams.toString();
  const res = await fetch(`/api/senders${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch senders' }));
    throw new Error(error.error || 'Failed to fetch senders');
  }

  return res.json();
}

export async function createSender(data: { name: string }): Promise<DropdownEntity> {
  const res = await fetch('/api/senders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to create sender' }));
    throw new Error(error.error || 'Failed to create sender');
  }

  return res.json();
}

export async function updateSender(
  id: string,
  data: { name?: string; isActive?: boolean }
): Promise<DropdownEntity> {
  const res = await fetch(`/api/senders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Sender not found');
    const error = await res.json().catch(() => ({ error: 'Failed to update sender' }));
    throw new Error(error.error || 'Failed to update sender');
  }

  return res.json();
}

export async function reorderSenders(orderedIds: string[]): Promise<void> {
  const res = await fetch('/api/senders/reorder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to reorder senders' }));
    throw new Error(error.error || 'Failed to reorder senders');
  }
}

export async function deleteSender(id: string): Promise<void> {
  const res = await fetch(`/api/senders/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Sender not found');
    const error = await res.json().catch(() => ({ error: 'Failed to delete sender' }));
    throw new Error(error.error || 'Failed to delete sender');
  }
}