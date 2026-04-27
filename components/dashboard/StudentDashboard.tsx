'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Package } from '@/types/package';
import type { PaginationState } from '@/types/pagination';
import { fetchPackages } from '@/lib/api/packages';
import { useAuth } from '@/components/dev/TestingAuthProvider';
import { useToast } from '@/hooks/useToast';
import ViewPackageModal from './ViewPackageModal';
import PackageDataTable from './PackageDataTable';
import Pagination from '@/components/ui/tables/Pagination';

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const [packages, setPackages] = useState<Package[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [detailsPackage, setDetailsPackage] = useState<Package | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 25,
  });

  const loadPackages = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await fetchPackages({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        recipientId: user.id,
      });
      setPackages(res.data);
      setTotalItems(res.total);
    } catch {
      showToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load your packages.',
      });
    }
  }, [pagination.currentPage, pagination.pageSize, user?.id, showToast]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  return (
    <div className="px-4 sm:px-6 py-6 space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-byu-navy">My Packages</h2>
        <p className="text-sm text-gray-600 mt-1">
          View packages addressed to you
        </p>
      </div>

      {/* Table */}
      <PackageDataTable
        packages={packages}
        onRowClick={setDetailsPackage}
        onEdit={() => {}} // Students can't edit
        onCheckOut={() => {}} // Students can't checkout
        onDelete={() => {}} // Students can't delete
        readOnly={true}
      />

      {/* Pagination */}
      <Pagination
        totalItems={totalItems}
        pagination={pagination}
        onPageChange={(page: number) => setPagination((prev) => ({ ...prev, currentPage: page }))}
        setPageSize={(size: number) => setPagination({ currentPage: 1, pageSize: size })}
        itemLabel="Packages"
      />

      {/* View Modal */}
      {detailsPackage && (
        <ViewPackageModal
          pkg={detailsPackage}
          onClose={() => setDetailsPackage(null)}
        />
      )}

      <ToastContainer />
    </div>
  );
}