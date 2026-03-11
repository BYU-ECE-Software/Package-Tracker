import React from "react";
import type { Package } from "@/types/package";
import { BarsArrowDownIcon, BarsArrowUpIcon } from "@heroicons/react/24/solid";
import { getPackageStatusColor } from "@/utils/getPackageStatusColor";
import { formatDate } from "@/utils/formatDate";

interface PackageDataTableProps {
  packages: Package[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  onView: (pkg: Package) => void;
  onEdit: (pkg: Package) => void;
}

const PackageDataTable: React.FC<PackageDataTableProps> = ({
  packages,
  sortBy,
  sortOrder,
  onSort,
  onView,
  onEdit,
}) => {
  const renderSortIcon = (field: string) => {
    if (sortBy === field) {
      return sortOrder === "asc" ? (
        <BarsArrowUpIcon className="h-4 w-4 text-byuNavy" />
      ) : (
        <BarsArrowDownIcon className="h-4 w-4 text-byuNavy" />
      );
    }
    return <BarsArrowDownIcon className="h-4 w-4 text-byuMediumGray" />;
  };

  return (
    <table className="w-full table-fixed border-collapse border text-byuNavy">
      <thead className="bg-gray-100">
        <tr>
          <th
            className="border px-4 py-2 cursor-pointer"
            onClick={() => onSort("status")}
          >
            <div className="flex items-center justify-center gap-2">
              Status
              {renderSortIcon("status")}
            </div>
          </th>
          <th
            className="border px-4 py-2 cursor-pointer"
            onClick={() => onSort("trackingNumber")}
          >
            <div className="flex items-center justify-center gap-2">
              Tracking #
              {renderSortIcon("trackingNumber")}
            </div>
          </th>
          <th
            className="border px-4 py-2 cursor-pointer"
            onClick={() => onSort("carrier")}
          >
            <div className="flex items-center justify-center gap-2">
              Carrier
              {renderSortIcon("carrier")}
            </div>
          </th>
          <th
            className="border px-4 py-2 cursor-pointer"
            onClick={() => onSort("sender")}
          >
            <div className="flex items-center justify-center gap-2">
              Sender
              {renderSortIcon("sender")}
            </div>
          </th>
          <th
            className="border px-4 py-2 cursor-pointer"
            onClick={() => onSort("student")}
          >
            <div className="flex items-center justify-center gap-2">
              Student
              {renderSortIcon("student")}
            </div>
          </th>
          <th
            className="border px-4 py-2 cursor-pointer"
            onClick={() => onSort("dateArrived")}
          >
            <div className="flex items-center justify-center gap-2">
              Date Arrived
              {renderSortIcon("dateArrived")}
            </div>
          </th>
          <th
            className="border px-4 py-2 cursor-pointer"
            onClick={() => onSort("location")}
          >
            <div className="flex items-center justify-center gap-2">
              Location
              {renderSortIcon("location")}
            </div>
          </th>
          <th className="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {packages.map((pkg) => (
          <tr key={pkg.id} className="bg-white hover:bg-gray-50">
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
                  onClick={() => onView(pkg)}
                  className="px-2 py-1 border border-byuNavy text-byuNavy rounded hover:bg-byuNavy hover:text-white transition-colors duration-150 text-xs font-medium"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(pkg)}
                  className="px-2 py-1 border border-byuRoyal text-byuRoyal rounded hover:bg-byuRoyal hover:text-white transition-colors duration-150 text-xs font-medium"
                >
                  Edit
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PackageDataTable;