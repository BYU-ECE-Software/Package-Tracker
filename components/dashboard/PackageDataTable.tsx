'use client';

import React from 'react';
import { FiEdit2, FiTrash2, FiLogOut } from 'react-icons/fi';
import type { Package } from '@/types/package';
import { formatDate } from '@/utils/formatDate';
import DataTable, { type DataTableColumn } from '@/components/ui/tables/DataTable';
import { PackageStatusBadge } from './packageStatus';

interface PackageDataTableProps {
  packages: Package[];
  onRowClick?: (pkg: Package) => void;
  onEdit: (pkg: Package) => void;
  onCheckOut: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
  readOnly?: boolean;
  showStatus?: boolean;
}

const PackageDataTable: React.FC<PackageDataTableProps> = ({
  packages,
  onRowClick,
  onEdit,
  onCheckOut,
  onDelete,
  readOnly = false,
  showStatus = false,
}) => {
  const statusColumn: DataTableColumn = {
    key: 'status',
    header: 'Status',
    noWrap: true,
    render: (row: Package) => <PackageStatusBadge pkg={row} />,
  };

  const columns: DataTableColumn[] = [
    ...(showStatus ? [statusColumn] : []),
    {
      key: 'dateArrived',
      header: 'Arrived',
      render: (row: Package) => formatDate(row.dateArrived),
    },
    {
      key: 'recipient',
      header: 'Recipient',
      render: (row: Package) => row.recipient?.fullName ?? 'N/A',
    },
    {
      key: 'carrier',
      header: 'Carrier',
      render: (row: Package) => row.carrier?.name ?? '—',
    },
    {
      key: 'sender',
      header: 'Sender',
      render: (row: Package) => row.sender?.name ?? '—',
    },
    {
      key: 'datePickedUp',
      header: 'Checked Out',
      render: (row: Package) => (row.datePickedUp ? formatDate(row.datePickedUp) : '—'),
    },
    {
      key: 'pickedUpBy',
      header: 'Picked Up By',
      render: (row: Package) =>
        row.deliveredToOffice
          ? 'Delivered to Office'
          : row.datePickedUp
            ? row.recipient?.fullName ?? '—'
            : '—',
    },
    ...(readOnly
      ? []
      : [
          {
            key: 'actions',
            header: '',
            noWrap: true,
            cellClassName: 'text-right',
            actions: [
              {
                label: 'Edit',
                icon: <FiEdit2 className="h-4 w-4" />,
                onClick: (row: Package) => onEdit(row),
              },
              {
                label: 'Delete',
                icon: <FiTrash2 className="h-4 w-4" />,
                variant: 'danger' as const,
                onClick: (row: Package) => onDelete(row),
              },
            ],
          } satisfies DataTableColumn,
        ]),
  ];

  // Template's DataTable doesn't have a separate checkout button column
  // We need to add it as a custom render column
  const columnsWithCheckout: DataTableColumn[] = readOnly 
    ? columns 
    : [
        ...columns.slice(0, -1), // All columns except actions
        {
          key: 'checkout',
          header: '',
          noWrap: true,
          cellClassName: 'text-right',
          render: (row: Package) => {
            const alreadyCheckedOut = row.datePickedUp !== null || row.deliveredToOffice;
            return (
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  title={alreadyCheckedOut ? 'Already checked out' : 'Checkout'}
                  disabled={alreadyCheckedOut}
                  onClick={() => !alreadyCheckedOut && onCheckOut(row)}
                  className="inline-flex items-center gap-2 rounded-lg bg-byu-royal px-2 py-2 text-white text-xs font-medium hover:bg-[#003C9E] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiLogOut className="h-4 w-4" />
                  <span>Checkout</span>
                </button>
              </div>
            );
          },
        },
        columns[columns.length - 1], // Actions column last
      ];

  return (
    <DataTable
      data={packages}
      columns={columnsWithCheckout}
      emptyMessage="No packages found."
      onRowClick={onRowClick}
      getRowKey={(row: Package) => row.id}
    />
  );
};

export default PackageDataTable;