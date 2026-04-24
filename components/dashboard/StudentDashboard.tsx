'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Package } from '@/types/package';
import type { PaginationState } from '@/types/pagination';
import type { ToastProps } from '@/types/toast';
import { fetchPackages } from '@/lib/api/packages';
import { fetchUsers } from '@/lib/api/users';
import { useAuth } from '@/app/providers/TestingAuthProvider';
import ViewPackageModal from './ViewPackageModal';
import PackageDataTable from './PackageDataTable';
import SearchBar from '@/components/general/SearchBar';
import Pagination from '@/components/general/Pagination';
import Toast from '@/components/general/Toast';

// ─── Component ────────────────────────────────────────────────────────────────

// TODO: when real auth is wired up, recipientId should come from the session
// rather than looking up the user by netId

export default function StudentDashboard() {
  const { user } = useAuth();

  const [packages, setPackages] = useState<Package[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [recipientId, setRecipientId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [date, setDate] = useState('');

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 25,
  });

  const [detailsPackage, setDetailsPackage] = useState<Package | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Resolve the logged-in student's DB id from their netId
  useEffect(() => {
    if (!user?.netId) return;
    fetchUsers({ search: user.netId, pageSize: 10 })
      .then((res) => {
        const match = res.data.find((u) => u.netId === user.netId);
        if (match) setRecipientId(match.id);
      })
      .catch(() => console.error('Failed to resolve student id'));
  }, [user?.netId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setPagination((prev) =>
      prev.currentPage === 1 ? prev : { ...prev, currentPage: 1 }
    );
  }, [debouncedSearch, date]);

  const loadPackages = useCallback(async () => {
    if (!recipientId) return;
    try {
      const res = await fetchPackages({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        search: debouncedSearch || undefined,
        startDate: date || undefined,
        recipientId,
        // TODO: add recipientId filter support to /api/packages if not already present
      });
      setPackages(res.data);
      setTotalItems(res.total);
    } catch {
      setToast({ type: 'error', title: 'Load Failed', message: 'Failed to load packages.' });
    }
  }, [recipientId, pagination.currentPage, pagination.pageSize, debouncedSearch, date]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 text-sm">
        Please sign in to view your packages.
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-byu-navy">
          My Packages
        </h2>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        date={date}
        setDate={setDate}
        placeholder="Search your packages…"
      />

      {/* Student view is read-only — no edit, checkout, or delete actions */}
      <PackageDataTable
        packages={packages}
        onRowClick={setDetailsPackage}
        onEdit={() => {}}
        onCheckOut={() => {}}
        onDelete={() => {}}
        readOnly
      />

      <Pagination
        totalItems={totalItems}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
        setPageSize={(size) => setPagination({ currentPage: 1, pageSize: size })}
        itemLabel="Packages"
      />

      {detailsPackage && (
        <ViewPackageModal
          pkg={detailsPackage}
          onClose={() => setDetailsPackage(null)}
        />
      )}

      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}