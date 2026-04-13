"use client";

import type { ReactNode } from "react";

type DataTableColumn<T> = {
  key: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  columns: DataTableColumn<T>[];
  getRowKey?: (row: T, index: number) => React.Key;
  onRowClick?: (row: T) => void;
  containerClassName?: string;
};

export default function DataTable<T extends { id?: React.Key }>({
  data,
  loading = false,
  emptyMessage = "No records found.",
  columns,
  getRowKey,
  onRowClick,
  containerClassName = "",
}: DataTableProps<T>) {
  return (
    <section
      className={`bg-white border border-gray-200 rounded-2xl shadow-sm w-full overflow-hidden ${containerClassName}`}
    >
      {loading && (
        <div className="px-6 py-8 text-center text-sm text-gray-600">
          Loading…
        </div>
      )}

      {!loading && !data.length && (
        <div className="px-6 py-8 text-center text-sm text-gray-600">
          {emptyMessage}
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-byu-navy">
            <thead className="bg-slate-50 text-[13px] tracking-wide text-gray-500">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-3 text-left whitespace-nowrap ${col.headerClassName || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={getRowKey ? getRowKey(row, rowIndex) : row.id ?? rowIndex}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`transition-colors hover:bg-byu-royal/10 ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-3 align-middle text-gray-700 whitespace-nowrap ${col.cellClassName || ""}`}
                    >
                      {col.render ? col.render(row) : (row as Record<string, ReactNode>)[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export type { DataTableColumn };
