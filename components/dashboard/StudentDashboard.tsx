'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Package } from '@/types/package';
import { fetchPackages } from '@/lib/api/packages';
import { useAuth } from '@/components/dev/TestingAuthProvider';
import { useToast } from '@/hooks/useToast';
import ViewPackageModal from './ViewPackageModal';
import PackageDataTable from './PackageDataTable';

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const [packages, setPackages] = useState<Package[]>([]);
  const [activeOnly, setActiveOnly] = useState(true);

  const loadPackages = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await fetchPackages({
        page: 1,
        pageSize: 1000,
        recipientId: user.id,
        activeOnly,
      });
      setPackages(res.data);
    } catch {
      showToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load your packages.',
      });
    }
  }, [user?.id, activeOnly, showToast]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-byu-navy">My Packages</h2>
          <p className="text-sm text-gray-600 mt-1">
            View packages addressed to you
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-byu-navy cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="h-4 w-4 text-byu-royal rounded"
          />
          Show active packages only
        </label>
      </div>

      {/* Table */}
      <PackageDataTable
        packages={packages}
        onEdit={() => {}} // Students can't edit
        onCheckOut={() => {}} // Students can't checkout
        onDelete={() => {}} // Students can't delete
        readOnly={true}
        showStatus={true}
      />

      <ToastContainer />
      </div>
    </div>
  );
}