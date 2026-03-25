// ============================================
// CLIENT API FUNCTIONS (lib/api/packages.ts)
// ============================================

import type { Package, PackageQueryParams, CreatePackageRequest, UpdatePackageRequest } from '@/types/package';

export async function fetchPackages(params: PackageQueryParams) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const res = await fetch(`/api/packages?${searchParams}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) throw new Error('Failed to fetch packages');
  return res.json();
}

export async function fetchPackageById(id: string): Promise<Package> {
  const res = await fetch(`/api/packages/${id}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) throw new Error('Failed to fetch package');
  return res.json();
}

export async function createPackage(data: CreatePackageRequest): Promise<Package> {
  const res = await fetch('/api/packages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) throw new Error('Failed to create package');
  return res.json();
}

export async function updatePackage(id: string, data: UpdatePackageRequest): Promise<Package> {
  const res = await fetch(`/api/packages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) throw new Error('Failed to update package');
  return res.json();
}

export async function deletePackage(id: string): Promise<void> {
  const res = await fetch(`/api/packages/${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) throw new Error('Failed to delete package');
}

export async function checkInPackage(id: string, employeeId: string, location?: string): Promise<Package> {
  const res = await fetch(`/api/packages/${id}/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, location }),
  });
  
  if (!res.ok) throw new Error('Failed to check in package');
  return res.json();
}

export async function checkOutPackage(id: string, employeeId: string): Promise<Package> {
  const res = await fetch(`/api/packages/${id}/check-out`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId }),
  });
  
  if (!res.ok) throw new Error('Failed to check out package');
  return res.json();
}