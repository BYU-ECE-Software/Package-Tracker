'use client';

import { useCallback, useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import type { Package } from '@/types/package';
import type { PaginationState } from '@/types/pagination';
import type { DropdownEntity } from '@/types/dropdown';
import { fetchPackages, deletePackage } from '@/lib/api/packages';
import { fetchCarriers } from '@/lib/api/carriers';
import { fetchSenders } from '@/lib/api/senders';
import { useToast } from '@/hooks/useToast';
import AddPackageModal from './AddPackageModal';
import EditPackageModal from './EditPackageModal';
import ViewPackageModal from './ViewPackageModal';
import CheckOutModal from './CheckOutModal';
import ConfirmModal from '@/components/ui/modals/ConfirmModal';
import SearchFilters from './SearchFilters';
import PackageDataTable from './PackageDataTable';
import Pagination from '@/components/ui/tables/Pagination';
import Button from '@/components/ui/Button';

// ─── Component ────────────────────────────────────────────────────────────────

export default function PackageDashboard() {
  const { showToast, ToastContainer } = useToast();

  const [packages, setPackages] = useState<Package[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    activeOnly: true,
    date: '',
    carrierId: '',
    senderId: '',
  });

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 25,
  });

  // Modals — null means closed, object means open
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailsPackage, setDetailsPackage] = useState<Package | null>(null);
  const [editPackage, setEditPackage] = useState<Package | null>(null);
  const [checkOutPackage, setCheckOutPackage] = useState<Package | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [carriers, setCarriers] = useState<DropdownEntity[]>([]);
  const [senders, setSenders] = useState<DropdownEntity[]>([]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [carriersData, sendersData] = await Promise.all([
          fetchCarriers(true),
          fetchSenders(true),
        ]);
        setCarriers(carriersData);
        setSenders(sendersData);
      } catch {
        console.error('Failed to load carriers/senders');
      }
    };
    loadDropdowns();
  }, []);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPagination((prev) =>
      prev.currentPage === 1 ? prev : { ...prev, currentPage: 1 }
    );
  }, [searchTerm, filters.activeOnly, filters.date, filters.carrierId, filters.senderId]);

  const loadPackages = useCallback(async () => {
    try {
      const res = await fetchPackages({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        search: searchTerm || undefined,
        startDate: filters.date || undefined,
        activeOnly: filters.activeOnly,
        carrierId: filters.carrierId || undefined,
        senderId: filters.senderId || undefined,
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
    filters.senderId,
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
          onClick={() => setIsAddModalOpen(true)}
          icon={<FiPlus className="h-4 w-4" />}
          label="Create New Package"
        />

        <SearchFilters
          carriers={carriers}
          senders={senders}
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
        totalItems={totalItems}
        pagination={pagination}
        onPageChange={(page: number) => setPagination((prev) => ({ ...prev, currentPage: page }))}
        setPageSize={(size: number) => setPagination({ currentPage: 1, pageSize: size })}
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