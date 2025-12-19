"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Package, PackageStatus } from "@/types/package";
import type { User } from "@/types/user";
import {
  fetchPackages,
  updatePackage,
  checkInPackage,
  checkOutPackage,
} from "@/lib/clientapi";
import { type AddPackageData } from "@/types/package";
import AddPackageModal from "./AddPackageModal";
import { createPackage } from "@/lib/clientapi";
// import { fetchUsers } from '@/lib/clientapi';
import EditPackageModal from "./EditPackageModal";
import SearchBar from "./SearchBar";
import React from "react";
import ViewPackageModal from "./ViewPackageModal";
import { BarsArrowDownIcon, BarsArrowUpIcon } from "@heroicons/react/24/solid";
import StatusFilter from "./StatusFilter";
import Pagination from "./Pagination";
import Toast from "./Toast";
import type { ToastProps } from "@/types/toast";
import { getPackageStatusColor } from "@/utils/getPackageStatusColor";
import { formatDate } from "@/utils/formatDate";

// Package dashboard component for viewing and managing packages

const PackageDashboard = () => {
  // State to hold all packages
  const [packages, setPackages] = useState<Package[]>([]);

  // State to track Search Terms in the search bar
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State for the View Package Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewPackage, setViewPackage] = useState<Package | null>(null);

  // State for the Edit Package Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedPackage, setEditedPackage] = useState<Package | null>(null);

  // States for dropdowns - users for student selection and employee assignment
  const [users, setUsers] = useState<User[]>([]);

  // State for sorting/filtering
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [hasUserSorted, setHasUserSorted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PackageStatus | "">("");
  const [date, setDate] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // State for Toast
  const [toast, setToast] = useState<Omit<
    ToastProps,
    "onClose" | "duration"
  > | null>(null);

  // Sort logic for load up of packages - prioritize packages awaiting action
  const sortPackages = (packages: Package[]): Package[] => {
    return packages.sort((a, b) => {
      // Prioritize packages that need action (ARRIVED, READY_FOR_PICKUP)
      const isANeedsAction =
        a.status === "ARRIVED" || a.status === "READY_FOR_PICKUP";
      const isBNeedsAction =
        b.status === "ARRIVED" || b.status === "READY_FOR_PICKUP";

      // Packages needing action go first
      if (isANeedsAction && !isBNeedsAction) return -1;
      if (!isANeedsAction && isBNeedsAction) return 1;

      // Within each group, sort by createdAt descending (newest first)
      const createdA = new Date(a.createdAt).getTime();
      const createdB = new Date(b.createdAt).getTime();
      return createdB - createdA;
    });
  };

  // Load up packages for the main dashboard
  const loadAndSetPackages = useCallback(async () => {
    try {
      const res = await fetchPackages({
        page: currentPage,
        pageSize,
        sortBy,
        order: sortOrder,
        status: selectedStatus || undefined,
        search: searchTerm.trim() || undefined,
        startDate: date || undefined,
      });
      const data = hasUserSorted ? res.data : sortPackages(res.data);
      setPackages(data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Error loading packages:", err);
      setToast({
        type: "error",
        title: "Load Failed",
        message: "Failed to load packages.",
      });
    }
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    selectedStatus,
    searchTerm,
    date,
    hasUserSorted,
  ]);

  // Handles table sorting logic
  const handleSort = (field: string) => {
    setHasUserSorted(true);
    if (field === sortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // fetch all packages for the dashboard
  useEffect(() => {
    loadAndSetPackages();
  }, [
    sortBy,
    sortOrder,
    selectedStatus,
    currentPage,
    pageSize,
    loadAndSetPackages,
  ]);

  // Load up users for dropdown (students and employees)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers({});
        setUsers(data.data);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };

    loadUsers();
  }, []);

  const handleAddPackage = async (packageData: AddPackageData) => {
    try {
      await createPackage(packageData);
      await loadAndSetPackages();
      setToast({
        type: "success",
        title: "Package Added",
        message: "The package was added successfully!",
      });
    } catch (err) {
      console.error("Failed to add package:", err);
      throw err; // Let the modal handle the error display
    }
  };

  // Trigger the opening of the view package modal
  const openViewModal = (pkg: Package) => {
    setViewPackage(pkg);
    setIsViewModalOpen(true);
  };

  // Opens edit modal and loads package data into state
  const openEditModal = (pkg: Package) => {
    setEditedPackage({ ...pkg });
    setIsEditModalOpen(true);
  };

  // Closes edit modal and resets related state
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditedPackage(null);
  };

  // edit fields on a package
  const handlePackageFieldChange = (field: string, value: any) => {
    const isNumNaN = typeof value === "number" && Number.isNaN(value);
    const normalizedValue =
      value === "" || value === undefined || isNumNaN ? null : value;

    setEditedPackage((prev) => ({
      ...prev!,
      [field]: normalizedValue,
    }));
  };

  // PUT logic to update package data
  const handleSave = async () => {
    if (!editedPackage) return;

    try {
      // Prepare payload
      const payload = {
        trackingNumber: editedPackage.trackingNumber,
        carrier: editedPackage.carrier,
        sender: editedPackage.sender,
        status: editedPackage.status,
        expectedArrivalDate: editedPackage.expectedArrivalDate?.toString(),
        dateArrived: editedPackage.dateArrived?.toString(),
        datePickedUp: editedPackage.datePickedUp?.toString(),
        checkedInById: editedPackage.checkedInById,
        checkedOutById: editedPackage.checkedOutById,
        notes: editedPackage.notes,
        location: editedPackage.location,
        notificationSent: editedPackage.notificationSent,
      };

      await updatePackage(editedPackage.id, payload);

      await loadAndSetPackages();

      closeEditModal();
      setToast({
        type: "success",
        title: "Package Updated",
        message: "The package was updated successfully!",
      });
    } catch (err) {
      console.error("Failed to update package:", err);
      setToast({
        type: "error",
        title: "Update Failed",
        message: "Something went wrong while updating the package.",
      });
    }
  };

  // Quick action: Check in package
  const handleCheckIn = async (pkg: Package, employeeId: string) => {
    try {
      await checkInPackage(pkg.id, employeeId);
      await loadAndSetPackages();
      setToast({
        type: "success",
        title: "Package Checked In",
        message: `Package checked in successfully!`,
      });
    } catch (err) {
      console.error("Failed to check in package:", err);
      setToast({
        type: "error",
        title: "Check-in Failed",
        message: "Failed to check in package.",
      });
    }
  };

  // Quick action: Check out package to student
  const handleCheckOut = async (pkg: Package, employeeId: string) => {
    try {
      await checkOutPackage(pkg.id, employeeId);
      await loadAndSetPackages();
      setToast({
        type: "success",
        title: "Package Checked Out",
        message: `Package checked out to ${pkg.student?.fullName}!`,
      });
    } catch (err) {
      console.error("Failed to check out package:", err);
      setToast({
        type: "error",
        title: "Check-out Failed",
        message: "Failed to check out package.",
      });
    }
  };

  // Function for the Search Bar. Fetches filtered packages from the backend
  const handleSearch = useCallback(async () => {
    try {
      if (!searchTerm.trim() && !date.trim()) return;

      const res = await fetchPackages({
        page: currentPage,
        pageSize,
        sortBy,
        order: sortOrder,
        status: selectedStatus || undefined,
        search: searchTerm.trim() || undefined,
        startDate: date || undefined,
      });

      const data = hasUserSorted ? res.data : sortPackages(res.data);
      setPackages(data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Search error:", err);
      setToast({
        type: "error",
        title: "Search Failed",
        message: "Something went wrong while searching packages.",
      });
    }
  }, [
    searchTerm,
    date,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    selectedStatus,
    hasUserSorted,
  ]);

  // Trigger search when a date is selected
  useEffect(() => {
    if (date) {
      handleSearch();
    }
  }, [date, handleSearch]);

  // Clearing the Search Bar when done
  const handleClearSearch = async () => {
    setSearchTerm("");
    setDate("");
    setCurrentPage(1);

    try {
      const res = await fetchPackages({
        page: 1,
        pageSize,
        sortBy,
        order: sortOrder,
        status: selectedStatus || undefined,
        search: undefined,
      });

      const data = hasUserSorted ? res.data : sortPackages(res.data);
      setPackages(data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Failed to clear search:", err);
      setToast({
        type: "error",
        title: "Failed to clear search",
        message: "Something went wrong while reloading the packages.",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Left-aligned filter */}
        <div>
          <StatusFilter
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            onClearFilters={() => {
              setSelectedStatus("");
              setSearchTerm("");
              setDate("");
              setSortBy("createdAt");
              setSortOrder("desc");
              setHasUserSorted(false);
              loadAndSetPackages();
            }}
            statuses={[
              "AWAITING_ARRIVAL",
              "ARRIVED",
              "READY_FOR_PICKUP",
              "PICKED_UP",
              "RETURNED_TO_SENDER",
              "LOST",
            ]}
          />

          <button
            onClick={() => setIsAddModalOpen(true)}
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

        {/* Right-aligned search */}
        <div className="flex justify-end w-full sm:w-auto">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            date={date}
            setDate={setDate}
            placeholder="Search tracking #, carrier, sender, student..."
          />
        </div>
      </div>

      {/* Table to display all packages and their status */}
      <table className="w-full table-fixed border-collapse border text-byuNavy">
        <thead className="bg-gray-100">
          <tr>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center justify-center gap-2">
                Status
                {sortBy === "status" ? (
                  sortOrder === "asc" ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("trackingNumber")}
            >
              <div className="flex items-center justify-center gap-2">
                Tracking #
                {sortBy === "trackingNumber" ? (
                  sortOrder === "asc" ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("carrier")}
            >
              <div className="flex items-center justify-center gap-2">
                Carrier
                {sortBy === "carrier" ? (
                  sortOrder === "asc" ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("sender")}
            >
              <div className="flex items-center justify-center gap-2">
                Sender
                {sortBy === "sender" ? (
                  sortOrder === "asc" ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("student")}
            >
              <div className="flex items-center justify-center gap-2">
                Student
                {sortBy === "student" ? (
                  sortOrder === "asc" ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("dateArrived")}
            >
              <div className="flex items-center justify-center gap-2">
                Date Arrived
                {sortBy === "dateArrived" ? (
                  sortOrder === "asc" ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th
              className="border px-4 py-2 cursor-pointer"
              onClick={() => handleSort("location")}
            >
              <div className="flex items-center justify-center gap-2">
                Location
                {sortBy === "location" ? (
                  sortOrder === "asc" ? (
                    <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
                  )
                ) : (
                  <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />
                )}
              </div>
            </th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Map through all packages and display them in the table */}
          {packages.map((pkg) => {
            return (
              <React.Fragment key={pkg.id}>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border px-4 py-2 text-center">
                    <span
                      className={`px-3 py-1 rounded font-medium inline-block text-xs ${getPackageStatusColor(
                        pkg.status
                      )}`}
                    >
                      {pkg.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="border px-4 py-2 text-center text-sm">
                    {pkg.trackingNumber || "N/A"}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {pkg.carrier || "N/A"}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {pkg.sender || "N/A"}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {pkg.student?.fullName || "N/A"}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {pkg.dateArrived ? formatDate(pkg.dateArrived) : "N/A"}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {pkg.location || "N/A"}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openViewModal(pkg)}
                        className="px-2 py-1 border border-byuNavy text-byuNavy rounded hover:bg-byuNavy hover:text-white transition-colors duration-150 text-xs font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="px-2 py-1 border border-byuRoyal text-byuRoyal rounded hover:bg-byuRoyal hover:text-white transition-colors duration-150 text-xs font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Table Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      {/* View Package Modal  */}
      <ViewPackageModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        package={viewPackage}
      />

      {/* Edit Package Modal*/}
      {isEditModalOpen && editedPackage && (
        <EditPackageModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          package={editedPackage}
          users={users}
          onPackageFieldChange={handlePackageFieldChange}
          onSave={handleSave}
        />
      )}

      {/* Add Package Modal */}
      <AddPackageModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        users={users}
        onSave={handleAddPackage}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-out">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
};

export default PackageDashboard;
