'use client';

import React from 'react';
import { FiPlus } from 'react-icons/fi';
import SearchBar from '@/components/shared/SearchBar';
import Pagination from '@/components/shared/Pagination';
import PrimaryButton from '@/components/ui/PrimaryButton';
import type { PaginationState } from '@/types/pagination';

interface PackageTableControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  date: string;
  setDate: (date: string) => void;
  onAddPackage: () => void;
  pagination: PaginationState;
  totalItems: number;
  onPageChange: (page: number) => void;
  setPageSize: (size: number) => void;
}

const PackageTableControls: React.FC<PackageTableControlsProps> = ({
  searchTerm,
  setSearchTerm,
  date,
  setDate,
  onAddPackage,
  pagination,
  totalItems,
  onPageChange,
  setPageSize,
}) => {
  return (
    <div className="space-y-4 mb-4">
      <div className="flex flex-col items-start gap-4 w-full">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          date={date}
          setDate={setDate}
          placeholder="Search packages…"
        />

        <PrimaryButton
          label="Create New Package"
          icon={<FiPlus className="h-4 w-4" />}
          onClick={onAddPackage}
          className="py-2 whitespace-nowrap"
        />
      </div>

      <Pagination
        totalItems={totalItems}
        pagination={pagination}
        onPageChange={onPageChange}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default PackageTableControls;
