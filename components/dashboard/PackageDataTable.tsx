'use client';

import React from 'react';
import type { Package } from '@/types/package';
import { formatDate } from '@/utils/formatDate';

interface PackageDataTableProps {
  packages: Package[];
  onRowClick: (pkg: Package) => void;
  onEdit: (pkg: Package) => void;
  onCheckOut: (pkg: Package) => void;
}

const PackageDataTable: React.FC<PackageDataTableProps> = ({
  packages,
  onRowClick,
  onEdit,
  onCheckOut,
}) => {
  const isCheckedOut = (pkg: Package) =>
    pkg.datePickedUp !== null || pkg.deliveredToOffice;

  if (packages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        No packages found.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse border text-byuNavy text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-3 py-2 text-left">Recipient</th>
          <th className="border px-3 py-2 text-left">Arrived</th>
          <th className="border px-3 py-2 text-left">Carrier</th>
          <th className="border px-3 py-2 text-left">Sender</th>
          <th className="border px-3 py-2 text-left">Checked Out</th>
          <th className="border px-3 py-2 text-left">Picked Up By</th>
          <th className="border px-3 py-2 text-center">Edit</th>
        </tr>
      </thead>
      <tbody>
        {packages.map((pkg) => {
          const checkedOut = isCheckedOut(pkg);
          return (
            <tr
              key={pkg.id}
              onClick={() => onRowClick(pkg)}
              className={`cursor-pointer hover:bg-gray-50 ${checkedOut ? 'opacity-50' : 'bg-white'}`}
            >
              <td className="border px-3 py-2">
                {pkg.recipient?.fullName ?? 'N/A'}
              </td>
              <td className="border px-3 py-2 whitespace-nowrap">
                {formatDate(pkg.dateArrived)}
              </td>
              <td className="border px-3 py-2">
                {pkg.carrier?.name ?? '—'}
              </td>
              <td className="border px-3 py-2">
                {pkg.sender?.name ?? '—'}
              </td>
              <td className="border px-3 py-2 whitespace-nowrap">
                {pkg.datePickedUp ? formatDate(pkg.datePickedUp) : '—'}
              </td>
              <td className="border px-3 py-2">
                {pkg.deliveredToOffice
                  ? 'Delivered to Office'
                  : pkg.datePickedUp
                    ? pkg.recipient?.fullName ?? '—'
                    : '—'}
              </td>
              <td
                className="border px-3 py-2 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(pkg)}
                    className="px-2 py-1 border border-byuRoyal text-byuRoyal rounded hover:bg-byuRoyal hover:text-white transition-colors duration-150 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => !checkedOut && onCheckOut(pkg)}
                    disabled={checkedOut}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-150 ${
                      checkedOut
                        ? 'border border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border border-byuNavy text-byuNavy hover:bg-byuNavy hover:text-white'
                    }`}
                  >
                    {checkedOut ? 'Checked Out' : 'Check Out'}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PackageDataTable;