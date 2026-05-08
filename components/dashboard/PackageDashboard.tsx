'use client';

import { useCallback, useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import type { Package } from '@/types/package';
import type { DropdownEntity } from '@/types/general/DropdownEntity';
import { fetchPackages, fetchPackageById, deletePackage } from '@/lib/api/packages';
import { fetchCarriers } from '@/lib/api/carriers';
import { fetchVendors } from '@/lib/api/vendors';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/dev/TestingAuthProvider';
import AddPackageModal from './AddPackageModal';
import EditPackageModal from './EditPackageModal';
import ViewPackageModal from './ViewPackageModal';
import CheckOutModal from './CheckOutModal';
import ConfirmModal from '@/components/general/overlays/ConfirmModal';
import SearchFilters from './SearchFilters';
import PackageDataTable from './PackageDataTable';
import Pagination from '@/components/general/data-display/Pagination';
import Button from '@/components/general/actions/Button';
import { usePagination } from '@/hooks/usePagination';

// ─── Component ────────────────────────────────────────────────────────────────

export default function PackageDashboard() {
  const { showToast, ToastContainer } = useToast();
  const { user } = useAuth();

  // Dev quirk: a Fast Refresh can clear the in-memory `user` while the
  // auth cookie still says "signed in" — UI looks logged in but actions
  // that require a checkedInById fail. In prod this would be a stale
  // session that needs a fresh sign-in. Either way, surface it loudly.
  const requireSignIn = (action: string): boolean => {
    if (user?.id) return true;
    showToast({
      type: 'error',
      title: 'Session expired',
      message: `You're not signed in — please sign back in to ${action}.`,
    });
    return false;
  };

  const [packages, setPackages] = useState<Package[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    activeOnly: boolean;
    date: Date | null;
    carrierId: string;
    vendorId: string;
  }>({
    activeOnly: true,
    date: null,
    carrierId: '',
    vendorId: '',
  });

  const pagination = usePagination({ initialPageSize: 25 });

  // Modals — null means closed, object means open
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailsPackage, setDetailsPackage] = useState<Package | null>(null);
  const [editPackage, setEditPackage] = useState<Package | null>(null);
  const [checkOutPackage, setCheckOutPackage] = useState<Package | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [carriers, setCarriers] = useState<DropdownEntity[]>([]);
  const [vendors, setVendors] = useState<DropdownEntity[]>([]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [carriersData, vendorsData] = await Promise.all([
          fetchCarriers(true),
          fetchVendors(true),
        ]);
        setCarriers(carriersData);
        setVendors(vendorsData);
      } catch {
        console.error('Failed to load carriers/vendors');
      }
    };
    loadDropdowns();
  }, []);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    pagination.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters.activeOnly, filters.date, filters.carrierId, filters.vendorId]);

  const loadPackages = useCallback(async () => {
    try {
      const res = await fetchPackages({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        search: searchTerm || undefined,
        startDate: filters.date ?? undefined,
        activeOnly: filters.activeOnly,
        carrierId: filters.carrierId || undefined,
        vendorId: filters.vendorId || undefined,
      });
      setPackages(res.data);
      setTotalItems(res.total);
    } catch {
      showToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load packages.',
      });
    }
  }, [
    pagination.currentPage,
    pagination.pageSize,
    searchTerm,
    filters.activeOnly,
    filters.date,
    filters.carrierId,
    filters.vendorId,
    showToast,
  ]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full">
        <Button
          onClick={() => {
            if (requireSignIn('add a package')) setIsAddModalOpen(true);
          }}
          icon={<FiPlus className="h-4 w-4" />}
          label="Create New Package"
        />

        <SearchFilters
          carriers={carriers}
          vendors={vendors}
          onSearchChange={setSearchTerm}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Table */}
      <PackageDataTable
        packages={packages}
        onRowClick={setDetailsPackage}
        onEdit={setEditPackage}
        onCheckOut={setCheckOutPackage}
        onDelete={setDeleteTarget}
      />

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        totalItems={totalItems}
        itemLabel="Packages"
      />

      {/* Modals */}
      {isAddModalOpen && (
        <AddPackageModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={async () => {
            setIsAddModalOpen(false);
            await loadPackages();
            showToast({
              type: 'success',
              title: 'Package Added',
              message: 'Package has been added successfully.',
            });
          }}
        />
      )}

      {editPackage && (
        <EditPackageModal
          pkg={editPackage}
          onClose={() => setEditPackage(null)}
          onSuccess={async () => {
            setEditPackage(null);
            await loadPackages();
            showToast({
              type: 'success',
              title: 'Package Updated',
              message: 'Package has been updated successfully.',
            });
          }}
        />
      )}

      {detailsPackage && (
        <ViewPackageModal
          pkg={detailsPackage}
          onClose={() => setDetailsPackage(null)}
          onSuccess={async () => {
            // Refresh both: the open modal (so notification list + status
            // flip show immediately) and the underlying list.
            const id = detailsPackage.id;
            const [fresh] = await Promise.all([
              fetchPackageById(id),
              loadPackages(),
            ]);
            setDetailsPackage(fresh);
          }}
        />
      )}

      {checkOutPackage && (
        <CheckOutModal
          pkg={checkOutPackage}
          onClose={() => setCheckOutPackage(null)}
          onSuccess={async () => {
            setCheckOutPackage(null);
            await loadPackages();
            showToast({
              type: 'success',
              title: 'Package Checked Out',
              message: 'Package has been checked out successfully.',
            });
          }}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete package?"
        message={
          deleteTarget?.recipient?.fullName
            ? `Delete package for "${deleteTarget.recipient.fullName}"? This cannot be undone.`
            : 'Delete this package? This cannot be undone.'
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        busy={deleting}
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await deletePackage(deleteTarget.id);
            setDeleteTarget(null);
            await loadPackages();
            showToast({
              type: 'success',
              title: 'Package Deleted',
              message: 'Package has been removed.',
            });
          } catch {
            showToast({
              type: 'error',
              title: 'Delete Failed',
              message: 'Could not delete the package. Try again.',
            });
          } finally {
            setDeleting(false);
          }
        }}
      />

      <ToastContainer />
      </div>
    </div>
  );
}