// ============================================
// lib/api/lineMemoOptions.ts - LineMemoOption API Functions
// ============================================

import type {
  LineMemoOption,
  LineMemoOptionListResponse,
  LineMemoOptionQueryParams,
  CreateLineMemoOptionRequest,
  UpdateLineMemoOptionRequest,
} from '@/types/lineMemoOption';

export async function fetchLineMemoOptions(
  params: LineMemoOptionQueryParams = {},
): Promise<LineMemoOptionListResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const qs = searchParams.toString();

  const res = await fetch(`/api/line-memo-options${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to fetch line memo options' }));
    throw new Error(error.error || 'Failed to fetch line memo options');
  }

  return res.json();
}

export async function fetchLineMemoOptionById(id: number): Promise<LineMemoOption> {
  const res = await fetch(`/api/line-memo-options/${id}`, { cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Line memo option not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to fetch line memo option' }));
    throw new Error(error.error || 'Failed to fetch line memo option');
  }

  return res.json();
}

export async function createLineMemoOption(
  data: CreateLineMemoOptionRequest,
): Promise<LineMemoOption> {
  const res = await fetch('/api/line-memo-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to create line memo option' }));
    throw new Error(error.error || 'Failed to create line memo option');
  }

  return res.json();
}

export async function updateLineMemoOption(
  id: number,
  data: UpdateLineMemoOptionRequest,
): Promise<LineMemoOption> {
  const res = await fetch(`/api/line-memo-options/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Line memo option not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to update line memo option' }));
    throw new Error(error.error || 'Failed to update line memo option');
  }

  return res.json();
}

export async function deleteLineMemoOption(id: number): Promise<void> {
  const res = await fetch(`/api/line-memo-options/${id}`, { method: 'DELETE' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Line memo option not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to delete line memo option' }));
    throw new Error(error.error || 'Failed to delete line memo option');
  }
}
