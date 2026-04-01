'use client';

import { useState } from 'react';
import Toast from '@/components/shared/Toast';
import Pagination from '@/components/shared/Pagination';
import type { ToastProps } from '@/types/toast';
import type { PaginationState } from '@/types/pagination';

const fakeCarriers = [
  'Amazon', 'FedEx', 'UPS', 'USPS', 'DHL',
  'OnTrac', 'LaserShip', 'GSO', 'Spee-Dee', 'LSO',
  'Lone Star', 'Axlehire', 'Veho', 'Pandion', 'Stitch Fix',
];

export default function DropdownEditor({ config }: { config: any }) {
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 5,
  });

  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const visibleCarriers = fakeCarriers.slice(startIndex, startIndex + pagination.pageSize);

  return (
    <div>
        <button
            onClick={() => setToast({
                type: 'success',
                title: 'It worked!',
                message: 'This is a toast message.',
            })}
            className="bg-byuNavy text-white px-4 py-2 rounded"
        >
            Show Toast
        </button>

        <ul>
            {visibleCarriers.map((carrier) => (
                <li key={carrier}>{carrier}</li>
            ))}
        </ul>

        <Pagination
            totalItems={fakeCarriers.length}
            pagination={pagination}
            onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
            setPageSize={(size) => setPagination({ currentPage: 1, pageSize: size })}
        />
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
}