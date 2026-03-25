"use client";

import { useCallback, useEffect, useState } from "react";
import type { Package, PackageStatus } from "@/types/package";
import type { User } from "@/types/user";
import {
  fetchPackages,
  updatePackage,
  checkInPackage,
  checkOutPackage,
  createPackage,
} from "@/lib/api/packages";
import { fetchUsers } from "@/lib/api/users";
import { type AddPackageData } from "@/types/package";
import AddPackageModal from "./AddPackageModal";
import EditPackageModal from "./EditPackageModal";
import ViewPackageModal from "./ViewPackageModal";
import Toast from "./Toast";
import type { ToastProps } from "@/types/toast";
import PackageTableControls from "./PackageTableControls";
import PackageDataTable from "./PackageDataTable";

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
        trackingNumber: editedPackage.trackingNumber ?? undefined,
        carrier: editedPackage.carrier ?? undefined,
        sender: editedPackage.sender ?? undefined,
        status: editedPackage.status,
        expectedArrivalDate: editedPackage.expectedArrivalDate?.toString() ?? undefined,
        dateArrived: editedPackage.dateArrived?.toString() ?? undefined,
        datePickedUp: editedPackage.datePickedUp?.toString() ?? undefined,
        checkedInById: editedPackage.checkedInById ?? undefined,
        checkedOutById: editedPackage.checkedOutById ?? undefined,
        notes: editedPackage.notes ?? undefined,
        location: editedPackage.location ?? undefined,
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

  const handleClearFilters = () => {
    setSelectedStatus("");
    setSearchTerm("");
    setDate("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setHasUserSorted(false);
    loadAndSetPackages();
  };

  return (
    <div className="space-y-4">
      {/* Controls Component */}
      <PackageTableControls
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        date={date}
        setDate={setDate}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        onClearFilters={handleClearFilters}
        onAddPackage={() => setIsAddModalOpen(true)}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        setPageSize={setPageSize}
      />

      {/* Data Table Component */}
      <PackageDataTable
        packages={packages}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onView={openViewModal}
        onEdit={openEditModal}
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