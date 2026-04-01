import React from "react";
import SearchBar from "../shared/SearchBar";
import StatusFilter from "../shared/StatusFilter";
import Pagination from "../shared/Pagination";

interface PackageTableControlsProps {
  // Filter and search props
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  date: string;
  setDate: (date: string) => void;
  
  // Action handlers
  onSearch: () => void;
  onClearSearch: () => void;
  onClearFilters: () => void;
  onAddPackage: () => void;
  
  // Pagination props
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  setPageSize: (size: number) => void;
}

const PackageTableControls: React.FC<PackageTableControlsProps> = ({
  searchTerm,
  setSearchTerm,
  date,
  setDate,
  onSearch,
  onClearSearch,
  onClearFilters,
  onAddPackage,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  setPageSize,
}) => {
  return (
    <div className="space-y-4 mb-4">
      {/* Top Controls: Filters and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
        {/* Left side: Filter and Add button */}
        <div className="flex gap-3">
          {/* REMOVED STATUS FILTER */}

          <button
            onClick={onAddPackage}
            className="px-4 py-2 bg-byuRoyal text-white rounded hover:bg-[#003a9a] font-medium flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Package
          </button>
        </div>

        {/*Spacer*/}
        <div className="flex-1"></div>

        {/* Right side: Search */}
        <div className="w-full sm:w-auto">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={onSearch}
            onClear={onClearSearch}
            date={date}
            setDate={setDate}
            placeholder="Search packages..."
          />
        </div>
      </div>

      {/* Bottom Controls: Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default PackageTableControls;