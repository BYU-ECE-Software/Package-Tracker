// MODIFIED from Template-Repo: components/general/data-display/DataTable.tsx
// Local improvements worth upstreaming to the template:
//   - Cell-level onRowClick: clicks on non-actions cells trigger the row click
//     (with auto cursor-pointer styling), instead of relying on a wrapping <tr>
//     handler that fires when the user clicks the actions menu.
//   - stopPropagation on the expand toggle so it doesn't double-fire onRowClick.
'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { FiChevronDown, FiChevronUp, FiMoreVertical } from 'react-icons/fi';
import RowActionMenu from './RowActionMenu';
import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DataTableAction = {
  label: string;
  icon?: ReactNode;
  onClick: (row: any) => void;
  variant?: 'default' | 'danger';
  hidden?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
};

export type DataTableColumn = {
  key: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: any) => ReactNode;
  noWrap?: boolean;
  actions?: DataTableAction[];
  sortable?: boolean;
};

export type ExpandedTableColumn = {
  key: string;
  header: string;
  render?: (row: any) => ReactNode;
  actions?: DataTableAction[];
};

export type ExpandedTableConfig = {
  columns: ExpandedTableColumn[];
  getRows?: (row: any) => any[];
  fetchRows?: (row: any) => Promise<any[]>;
  gridCols: string;
  summary?: (rows: any[]) => string;
  refreshKey?: number;
};

export type ExpandableRowsConfig = {
  isExpandable: (row: any) => boolean;
  expandedTable: ExpandedTableConfig;
};

type DataTableProps = {
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  columns: DataTableColumn[];
  getRowKey?: (row: any, index: number) => React.Key;
  onRowClick?: (row: any) => void;
  containerClassName?: string;
  expandableRows?: ExpandableRowsConfig; // Optional - omit for simple tables
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
};

// ─── Sub-table Component ──────────────────────────────────────────────────────

function ExpandedSubTable({ parentRow, config }: { parentRow: any; config: ExpandedTableConfig }) {
  const [rows, setRows] = useState<any[]>(() => (config.getRows ? config.getRows(parentRow) : []));
  const [loading, setLoading] = useState(Boolean(config.fetchRows));

  useEffect(() => {
    if (!config.fetchRows) return;
    setLoading(true);
    config
      .fetchRows(parentRow)
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [parentRow.id, config.refreshKey]);

  if (loading) return <p className="py-3 text-xs text-gray-400">Loading…</p>;

  const hasActions = config.columns.some((c) => c.actions);
  const gridCols = hasActions ? `${config.gridCols} 40px` : config.gridCols;

  return (
    <div className="pt-3 pb-1">
      <div
        className="grid gap-x-6 border-b border-gray-200 pb-2 text-[11px] font-semibold tracking-widest text-gray-400 uppercase"
        style={{ gridTemplateColumns: gridCols }}
      >
        {config.columns.map((col) => (
          <span key={col.key}>{col.actions ? '' : col.header}</span>
        ))}
      </div>

      <div className="divide-y divide-gray-100">
        {rows.map((row, i) => (
          <div
            key={row.id ?? i}
            className="grid items-center gap-x-6 rounded-lg py-2.5 text-sm transition-colors hover:bg-white/70"
            style={{ gridTemplateColumns: gridCols }}
          >
            {config.columns.map((col) =>
              col.actions ? (
                <div key={col.key} className="flex justify-end">
                  <RowActionMenu
                    trigger={<FiMoreVertical className="h-4 w-4" />}
                    items={col.actions
                      .filter((a) => !a.hidden?.(row))
                      .map((a) => ({
                        label: a.label,
                        icon: a.icon,
                        variant: a.variant,
                        onClick: () => a.onClick(row),
                        disabled: a.disabled?.(row),
                      }))}
                  />
                </div>
              ) : col.render ? (
                <span key={col.key}>{col.render(row)}</span>
              ) : (
                <span key={col.key}>{row[col.key]}</span>
              ),
            )}
          </div>
        ))}
      </div>

      {config.summary && (
        <p className="mt-2 px-1 text-[11px] text-gray-400">{config.summary(rows)}</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DataTable({
  data,
  loading = false,
  emptyMessage = 'No records found.',
  columns,
  getRowKey,
  onRowClick,
  containerClassName = '',
  expandableRows,
  sortKey = '',
  sortDir = 'asc',
  onSort,
}: DataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<React.Key>>(new Set());

  const toggleRow = (key: React.Key) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const hasExpandableRows = Boolean(expandableRows);
  const totalCols = columns.length + (hasExpandableRows ? 1 : 0);

  return (
    <section
      className={`w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${containerClassName}`}
    >
      {loading && !data.length && (
        <div className="px-6 py-8 text-center text-sm text-gray-600">Loading…</div>
      )}

      {!loading && !data.length && (
        <div className="px-6 py-8 text-center text-sm text-gray-600">{emptyMessage}</div>
      )}

      {data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="text-byu-navy min-w-full text-sm">
            <thead className="bg-slate-50 text-[13px] tracking-wide text-gray-500">
              <tr>
                {hasExpandableRows && <th className="w-10 px-3 py-3" />}

                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-3 text-left ${
                      col.noWrap ? 'whitespace-nowrap' : 'whitespace-normal'
                    } ${col.headerClassName || ''}`}
                  >
                    {col.sortable ? (
                      <span className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (!onSort) return;
                            const nextDir =
                              sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc';
                            onSort(col.key, nextDir);
                          }}
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-700"
                        >
                          {col.header}
                          <span className="flex flex-col leading-none text-gray-300">
                            <FiChevronUp
                              className={`h-2.5 w-2.5 ${sortKey === col.key && sortDir === 'asc' ? 'text-gray-600' : ''}`}
                            />
                            <FiChevronDown
                              className={`h-2.5 w-2.5 ${sortKey === col.key && sortDir === 'desc' ? 'text-gray-600' : ''}`}
                            />
                          </span>
                        </button>

                        {sortKey === col.key && (
                          <button
                            type="button"
                            onClick={() => onSort?.('', 'asc')}
                            className="ml-0.5 text-gray-300 transition-colors hover:text-gray-500"
                            title="Clear sort"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((row, rowIndex) => {
                const key = getRowKey ? getRowKey(row, rowIndex) : (row.id ?? rowIndex);
                const isExpanded = expandedRows.has(key);
                const canExpand = expandableRows?.isExpandable(row) ?? false;

                return (
                  <React.Fragment key={key}>
                    <tr
                      className={`hover:bg-byu-royal/10 transition-colors ${
                        isExpanded ? 'bg-byu-royal/5' : ''
                      }`}
                    >
                      {/* Expand toggle column - only shown if expandableRows is provided */}
                      {hasExpandableRows && (
                        <td className="w-10 px-3 py-3 align-middle">
                          {canExpand && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(key);
                              }}
                              aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                              className="hover:text-byu-navy flex items-center gap-1.5 text-gray-400 transition-all"
                            >
                              <span className="flex h-6 w-6 items-center justify-center rounded-md transition-all hover:bg-gray-100">
                                <FiChevronDown
                                  className={`h-4 w-4 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </span>
                            </button>
                          )}
                        </td>
                      )}

                      {columns.map((col) => {
                        const hasActions = Boolean(col.actions);

                        return (
                          <td
                            key={col.key}
                            className={`px-6 py-3 align-middle text-gray-700 ${
                              col.noWrap ? 'whitespace-nowrap' : 'wrap-break-word whitespace-normal'
                            } ${col.cellClassName || ''} ${!hasActions && onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={
                              !hasActions && onRowClick
                                ? () => onRowClick(row)
                                : undefined
                            }
                          >
                            {hasActions ? (
                              <div className="flex justify-end">
                                <RowActionMenu
                                  trigger={<FiMoreVertical className="h-4 w-4" />}
                                  items={col.actions!
                                    .filter((action) => !action.hidden?.(row))
                                    .map((action) => ({
                                      label: action.label,
                                      icon: action.icon,
                                      variant: action.variant,
                                      onClick: () => action.onClick(row),
                                      disabled: action.disabled?.(row),
                                    }))}
                                />
                              </div>
                            ) : col.render ? (
                              col.render(row)
                            ) : (
                              row[col.key]
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Expanded sub-row - only renders if expandableRows is provided */}
                    {hasExpandableRows && canExpand && isExpanded && (
                      <tr key={`${key}-expanded`} className="transition-all">
                        <td colSpan={totalCols} className="bg-slate-50">
                          <div className="origin-top translate-y-0 opacity-100 transition-all duration-300">
                            <div className="border-byu-royal/40 mt-3 mr-6 mb-4 ml-15 border-l-2 pl-4">
                              <ExpandedSubTable
                                parentRow={row}
                                config={expandableRows!.expandedTable}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}