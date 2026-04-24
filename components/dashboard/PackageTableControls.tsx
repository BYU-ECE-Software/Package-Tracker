'use client';

import { FiPlus } from 'react-icons/fi';
import SearchBar from '@/components/general/SearchBar';
import Pagination from '@/components/general/Pagination';
import Button from '@/components/ui/Button';
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

export default function PackageTableControls({
  searchTerm,
  setSearchTerm,
  date,
  setDate,
  onAddPackage,
  pagination,
  totalItems,
  onPageChange,
  setPageSize,
}: PackageTableControlsProps) {
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

        <Button
          onClick={onAddPackage}
          className="whitespace-nowrap"
        >
          <FiPlus className="h-4 w-4" />
          Create New Package
        </Button>
      </div>

      <Pagination
        totalItems={totalItems}
        pagination={pagination}
        onPageChange={onPageChange}
        setPageSize={setPageSize}
      />
    </div>
  );
}
