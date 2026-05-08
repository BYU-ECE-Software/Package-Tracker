// ============================================
// lib/api/professors.ts - Professor API Functions
// ============================================

import type {
  Professor,
  ProfessorListResponse,
  ProfessorQueryParams,
  CreateProfessorRequest,
  UpdateProfessorRequest,
} from '@/types/professor';

export async function fetchProfessors(
  params: ProfessorQueryParams = {},
): Promise<ProfessorListResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const qs = searchParams.toString();

  const res = await fetch(`/api/professors${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to fetch professors' }));
    throw new Error(error.error || 'Failed to fetch professors');
  }

  return res.json();
}

export async function fetchProfessorById(id: string): Promise<Professor> {
  const res = await fetch(`/api/professors/${id}`, { cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Professor not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to fetch professor' }));
    throw new Error(error.error || 'Failed to fetch professor');
  }

  return res.json();
}

export async function createProfessor(
  data: CreateProfessorRequest,
): Promise<Professor> {
  const res = await fetch('/api/professors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to create professor' }));
    throw new Error(error.error || 'Failed to create professor');
  }

  return res.json();
}

export async function updateProfessor(
  id: string,
  data: UpdateProfessorRequest,
): Promise<Professor> {
  const res = await fetch(`/api/professors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Professor not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to update professor' }));
    throw new Error(error.error || 'Failed to update professor');
  }

  return res.json();
}

export async function deleteProfessor(id: string): Promise<void> {
  const res = await fetch(`/api/professors/${id}`, { method: 'DELETE' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Professor not found');
    const error = await res
      .json()
      .catch(() => ({ error: 'Failed to delete professor' }));
    throw new Error(error.error || 'Failed to delete professor');
  }
}
