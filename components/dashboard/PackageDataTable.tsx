'use client';

import React from 'react';
import { FiEdit2, FiTrash2, FiMoreVertical, FiLogOut } from 'react-icons/fi';
import type { Package } from '@/types/package';
import { formatDate } from '@/utils/formatDate';
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable';
import RowActionMenu from '@/components/ui/RowActionMenu';

interface PackageDataTableProps {
  packages: Package[];
  onRowClick: (pkg: Package) => void;
  onEdit: (pkg: Package) => void;
  onCheckOut: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
}

function RowActions({
  pkg,
  onEdit,
  onCheckOut,
  onDelete,
}: {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onCheckOut: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
}) {
  const alreadyCheckedOut = pkg.datePickedUp !== null || pkg.deliveredToOffice;

  return (
    <div
      className="flex items-center justify-end gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        title={alreadyCheckedOut ? 'Already checked out' : 'Checkout'}
        disabled={alreadyCheckedOut}
        onClick={() => !alreadyCheckedOut && onCheckOut(pkg)}
        className="inline-flex items-center gap-2 rounded-lg bg-byu-royal px-2 py-2 text-white text-xs font-medium hover:bg-[#003C9E] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FiLogOut className="h-4 w-4" />
        <span>Checkout</span>
      </button>

      <RowActionMenu
        trigger={<FiMoreVertical className="h-4 w-4" />}
        items={[
          {
            label: 'Edit',
            icon: <FiEdit2 className="h-4 w-4" />,
            onClick: () => onEdit(pkg),
          },
          {
            label: 'Delete',
            icon: <FiTrash2 className="h-4 w-4" />,
            variant: 'danger',
            onClick: () => onDelete(pkg),
          },
        ]}
      />
    </div>
  );
}

const PackageDataTable: React.FC<PackageDataTableProps> = ({
  packages,
  onRowClick,
  onEdit,
  onCheckOut,
  onDelete,
}) => {
  const columns: DataTableColumn<Package>[] = [
    {
      key: 'dateArrived',
      header: 'Arrived',
      render: (row) => formatDate(row.dateArrived),
    },
    {
      key: 'recipient',
      header: 'Recipient',
      render: (row) => row.recipient?.fullName ?? 'N/A',
    },
    {
      key: 'carrier',
      header: 'Carrier',
      render: (row) => row.carrier?.name ?? '—',
    },
    {
      key: 'sender',
      header: 'Sender',
      render: (row) => row.sender?.name ?? '—',
    },
    {
      key: 'datePickedUp',
      header: 'Checked Out',
      render: (row) => (row.datePickedUp ? formatDate(row.datePickedUp) : '—'),
    },
    {
      key: 'pickedUpBy',
      header: 'Picked Up By',
      render: (row) =>
        row.deliveredToOffice
          ? 'Delivered to Office'
          : row.datePickedUp
            ? row.recipient?.fullName ?? '—'
            : '—',
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-[1%]',
      cellClassName: 'text-right',
      render: (row) => (
        <RowActions
          pkg={row}
          onEdit={onEdit}
          onCheckOut={onCheckOut}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <DataTable<Package>
      data={packages}
      columns={columns}
      emptyMessage="No packages found."
      onRowClick={onRowClick}
      getRowKey={(row) => row.id}
    />
  );
};

export default PackageDataTable;
