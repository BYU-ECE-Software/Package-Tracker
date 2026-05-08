// ============================================
// Vendor API Functions
// ============================================

import type { DropdownEntity } from '@/types/general/DropdownEntity';

export async function fetchVendors(activeOnly?: boolean): Promise<DropdownEntity[]> {
  const searchParams = new URLSearchParams();
  if (activeOnly) searchParams.append('activeOnly', 'true');

  const qs = searchParams.toString();
  const res = await fetch(`/api/vendors${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch vendors' }));
    throw new Error(error.error || 'Failed to fetch vendors');
  }

  return res.json();
}

export async function createVendor(data: { name: string; hidden?: boolean }): Promise<DropdownEntity> {
  const res = await fetch('/api/vendors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to create vendor' }));
    throw new Error(error.error || 'Failed to create vendor');
  }

  return res.json();
}

export async function updateVendor(
  id: string,
  data: { name?: string; hidden?: boolean }
): Promise<DropdownEntity> {
  const res = await fetch(`/api/vendors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Vendor not found');
    const error = await res.json().catch(() => ({ error: 'Failed to update vendor' }));
    throw new Error(error.error || 'Failed to update vendor');
  }

  return res.json();
}

export async function reorderVendors(orderedIds: string[]): Promise<void> {
  const res = await fetch('/api/vendors/reorder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to reorder vendors' }));
    throw new Error(error.error || 'Failed to reorder vendors');
  }
}

export async function deleteVendor(id: string): Promise<void> {
  const res = await fetch(`/api/vendors/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Vendor not found');
    const error = await res.json().catch(() => ({ error: 'Failed to delete vendor' }));
    throw new Error(error.error || 'Failed to delete vendor');
  }
}