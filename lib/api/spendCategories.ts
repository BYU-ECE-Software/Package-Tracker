// ============================================
// lib/api/spendCategories.ts - SpendCategory API Functions
// ============================================

import type {
  SpendCategory,
  SpendCategoryListResponse,
  SpendCategoryQueryParams,
  CreateSpendCategoryRequest,
  UpdateSpendCategoryRequest,
} from '@/types/spendCategory';

export async function fetchSpendCategories(
  params: SpendCategoryQueryParams = {},
): Promise<SpendCategoryListResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const qs = searchParams.toString();

  const res = await fetch(`/api/spend-categories${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to fetch spend categories' }));
    throw new Error(error.error || 'Failed to fetch spend categories');
  }

  return res.json();
}

export async function fetchSpendCategoryById(id: string): Promise<SpendCategory> {
  const res = await fetch(`/api/spend-categories/${id}`, { cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Spend category not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to fetch spend category' }));
    throw new Error(error.error || 'Failed to fetch spend category');
  }

  return res.json();
}

export async function createSpendCategory(
  data: CreateSpendCategoryRequest,
): Promise<SpendCategory> {
  const res = await fetch('/api/spend-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to create spend category' }));
    throw new Error(error.error || 'Failed to create spend category');
  }

  return res.json();
}

export async function updateSpendCategory(
  id: string,
  data: UpdateSpendCategoryRequest,
): Promise<SpendCategory> {
  const res = await fetch(`/api/spend-categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Spend category not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to update spend category' }));
    throw new Error(error.error || 'Failed to update spend category');
  }

  return res.json();
}

export async function deleteSpendCategory(id: string): Promise<void> {
  const res = await fetch(`/api/spend-categories/${id}`, { method: 'DELETE' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Spend category not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to delete spend category' }));
    throw new Error(error.error || 'Failed to delete spend category');
  }
}

export async function fetchVisibleSpendCategories(): Promise<SpendCategory[]> {
  const res = await fetchSpendCategories({ visibleToStudents: true, pageSize: 1000 });
  return res.data;
}
