'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Package } from '@/types/package';
import { UserRole, type User } from '@/types/user';
import type { ToastProps } from '@/types/toast';
import type { PaginationState } from '@/types/pagination';
import { fetchPackages, deletePackage } from '@/lib/api/packages';
import { fetchUsers } from '@/lib/api/users';
import AddPackageModal from './AddPackageModal';
import EditPackageModal from './EditPackageModal';
import ViewPackageModal from './ViewPackageModal';
import CheckOutModal from './CheckOutModal';
import Toast from '@/components/shared/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PackageTableControls from './PackageTableControls';
import PackageDataTable from './PackageDataTable';

const PackageDashboard = () => {
  // Packages
  const [packages, setPackages] = useState<Package[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [date, setDate] = useState('');

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 25,
  });

  // Modals — null means closed, package means open
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailsPackage, setDetailsPackage] = useState<Package | null>(null);
  const [editPackage, setEditPackage] = useState<Package | null>(null);
  const [checkOutPackage, setCheckOutPackage] = useState<Package | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Users for dropdowns
  const [recipients, setRecipients] = useState<User[]>([]);
  const [secretaries, setSecretaries] = useState<User[]>([]);

  // Toast
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Load recipients and secretaries on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const [recipientRes, secretaryRes] = await Promise.all([
          fetchUsers({ pageSize: 1000 }),
          fetchUsers({ role: UserRole.SECRETARY, pageSize: 100 }),
        ]);
        setRecipients(recipientRes.data);
        setSecretaries(secretaryRes.data);
      } catch {
        console.error('Failed to load users');
      }
    };
    loadUsers();
  }, []);

  // Debounce the search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPagination(prev => (prev.currentPage === 1 ? prev : { ...prev, currentPage: 1 }));
  }, [debouncedSearch, date]);

  // Load packages
  const loadPackages = useCallback(async () => {
    try {
      const res = await fetchPackages({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        search: debouncedSearch || undefined,
        startDate: date || undefined,
      });
      setPackages(res.data);
      setTotalItems(res.total);
    } catch {
      setToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load packages.',
      });
    }
  }, [pagination.currentPage, pagination.pageSize, debouncedSearch, date]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  return (
    <div className="px-4 sm:px-6 py-6 space-y-4">
      <PackageTableControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        date={date}
        setDate={setDate}
        onAddPackage={() => setIsAddModalOpen(true)}
        pagination={pagination}
        totalItems={totalItems}
        onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
        setPageSize={(size) => setPagination({ currentPage: 1, pageSize: size })}
      />

      <PackageDataTable
        packages={packages}
        onRowClick={setDetailsPackage}
        onEdit={setEditPackage}
        onCheckOut={setCheckOutPackage}
        onDelete={setDeleteTarget}
      />

      {isAddModalOpen && (
        <AddPackageModal
          onClose={() => setIsAddModalOpen(false)}
          recipients={recipients}
          secretaries={secretaries}
          onSuccess={async () => {
            setIsAddModalOpen(false);
            await loadPackages();
            setToast({
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
          recipients={recipients}
          secretaries={secretaries}
          onClose={() => setEditPackage(null)}
          onSuccess={async () => {
            setEditPackage(null);
            await loadPackages();
            setToast({
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
          secretaries={secretaries}
          onClose={() => setCheckOutPackage(null)}
          onSuccess={async () => {
            setCheckOutPackage(null);
            await loadPackages();
            setToast({
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
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await deletePackage(deleteTarget.id);
            setDeleteTarget(null);
            await loadPackages();
            setToast({
              type: 'success',
              title: 'Package Deleted',
              message: 'Package has been removed.',
            });
          } catch {
            setToast({
              type: 'error',
              title: 'Delete Failed',
              message: 'Could not delete the package. Try again.',
            });
          } finally {
            setDeleting(false);
          }
        }}
      />

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
};

export default PackageDashboard;