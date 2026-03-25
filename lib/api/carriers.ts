// ============================================
// Carrier API Functions
// ============================================

import type { Carrier, CreateCarrierRequest, UpdateCarrierRequest } from '@/types/carrier';

export async function fetchCarriers(activeOnly?: boolean): Promise<Carrier[]> {
  const searchParams = new URLSearchParams();
  if (activeOnly) searchParams.append('activeOnly', 'true');

  const qs = searchParams.toString();
  const res = await fetch(`/api/carriers${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch carriers' }));
    throw new Error(error.error || 'Failed to fetch carriers');
  }

  return res.json();
}

export async function createCarrier(data: CreateCarrierRequest): Promise<Carrier> {
  const res = await fetch('/api/carriers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to create carrier' }));
    throw new Error(error.error || 'Failed to create carrier');
  }

  return res.json();
}

export async function updateCarrier(id: string, data: UpdateCarrierRequest): Promise<Carrier> {
  const res = await fetch(`/api/carriers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Carrier not found');
    const error = await res.json().catch(() => ({ error: 'Failed to update carrier' }));
    throw new Error(error.error || 'Failed to update carrier');
  }

  return res.json();
}