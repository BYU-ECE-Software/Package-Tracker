'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Package } from '@/types/package';
import type { User } from '@/types/user';
import type { ToastProps } from '@/types/toast';
import type { PaginationState } from '@/types/pagination';
import { fetchPackages, createPackage } from '@/lib/api/packages';
import { fetchUsers } from '@/lib/api/users';
import AddPackageModal from './AddPackageModal';
import EditPackageModal from './EditPackageModal';
import ViewPackageModal from './ViewPackageModal';
import CheckOutModal from './CheckOutModal';
import Toast from '@/components/shared/Toast';
import PackageTableControls from './PackageTableControls';
import PackageDataTable from './PackageDataTable';

const PackageDashboard = () => {
  // Packages
  const [packages, setPackages] = useState<Package[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
          fetchUsers({ role: 'SECRETARY' as any, pageSize: 100 }),
        ]);
        setRecipients(recipientRes.data);
        setSecretaries(secretaryRes.data);
      } catch {
        console.error('Failed to load users');
      }
    };
    loadUsers();
  }, []);

  // Load packages
  const loadPackages = useCallback(async () => {
    try {
      const res = await fetchPackages({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        search: isSearching ? searchTerm.trim() || undefined : undefined,
        startDate: isSearching ? date || undefined : undefined,
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
  }, [pagination.currentPage, pagination.pageSize, isSearching, searchTerm, date]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Search
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim() && !date) return;
    setIsSearching(true);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, date]);

  // Trigger search when date is selected
  useEffect(() => {
    if (date) handleSearch();
  }, [date, handleSearch]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setDate('');
    setIsSearching(false);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="px-4 sm:px-6 py-6 space-y-4">
      <PackageTableControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        date={date}
        setDate={setDate}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
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
      />

      {isAddModalOpen && (
        <AddPackageModal
          isOpen={isAddModalOpen}
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
          isOpen={!!editPackage}
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
          isOpen={!!detailsPackage}
          pkg={detailsPackage}
          onClose={() => setDetailsPackage(null)}
        />
      )}

      {checkOutPackage && (
        <CheckOutModal
          isOpen={!!checkOutPackage}
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