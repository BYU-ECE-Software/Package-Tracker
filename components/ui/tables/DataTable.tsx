'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import RowActionMenu from '@/components/general/overlays/RowActionMenu';
import { FiMoreVertical, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import React from 'react';

// Column definition — key must match the data object's field name
export type DataTableColumn = {
  key: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: any) => ReactNode;
  noWrap?: boolean;
  actions?: DataTableAction[];
  sortable?: boolean; // adds an asc/desc toggle to this column's header
};

// A single item in the three-dot action menu
export type DataTableAction = {
  label: string;
  icon?: ReactNode;
  onClick: (row: any) => void;
  variant?: 'default' | 'danger';
  hidden?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
};

// Expanded Portion of a row Column definition — key must match the data object's field name
export type ExpandedTableColumn = {
  key: string;
  header: string;
  render?: (row: any) => ReactNode;
  actions?: DataTableAction[];
};

export type ExpandedTableConfig = {
  /** Column definitions for the sub-table */
  columns: ExpandedTableColumn[];
  /** How to get the rows from the parent row */
  getRows?: (row: any) => any[];
  /** Called while rows are loading — pass if rows are fetched async */
  fetchRows?: (row: any) => Promise<any[]>;
  /** Grid template columns CSS value e.g. "200px 1.5fr 1fr 1fr 2fr" */
  gridCols: string;
  /** Summary text at the bottom e.g. (rows) => `${rows.length} receipts attached` */
  summary?: (rows: any[]) => string;
  refreshKey?: number;
};

export type ExpandableRowsConfig = {
  /** Return true if this row should show an expand toggle */
  isExpandable: (row: any) => boolean;
  /** The content rendered inside the expanded panel */
  expandedTable: ExpandedTableConfig;
};

type DataTableProps = {
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  columns: DataTableColumn[];
  getRowKey?: (row: any, index: number) => React.Key;
  containerClassName?: string;
  // Optional expandable row configuration
  expandableRows?: ExpandableRowsConfig;
  // sort props — only pass these if any column has sortable: true
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
};

// Renders the inner table that appears when a row is expanded
function ExpandedSubTable({ parentRow, config }: { parentRow: any; config: ExpandedTableConfig }) {
  const [rows, setRows] = useState<any[]>(() => (config.getRows ? config.getRows(parentRow) : []));
  const [loading, setLoading] = useState(Boolean(config.fetchRows));

  // If fetchRows is provided, load the sub-rows asynchronously from the API
  useEffect(() => {
    if (!config.fetchRows) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      {/* Sub-table header row */}
      <div
        className="grid gap-x-6 border-b border-gray-200 pb-2 text-[11px] font-semibold tracking-widest text-gray-400 uppercase"
        style={{ gridTemplateColumns: gridCols }}
      >
        {config.columns.map((col) => (
          <span key={col.key}>{col.actions ? '' : col.header}</span>
        ))}
      </div>

      {/* Sub-table rows */}
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

export default function DataTable({
  data,
  loading = false,
  emptyMessage = 'No records found.',
  columns,
  getRowKey,
  containerClassName = '',
  expandableRows,
  sortKey = '',
  sortDir = 'asc',
  onSort,
}: DataTableProps) {
  // Tracks which rows are currently expanded
  const [expandedRows, setExpandedRows] = useState<Set<React.Key>>(new Set());

  const toggleRow = (key: React.Key) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Total columns including the expand toggle column
  const totalCols = columns.length + (expandableRows ? 1 : 0);

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
                {expandableRows && <th className="w-10 px-3 py-3" />}

                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-3 text-left ${
                      col.noWrap ? 'whitespace-nowrap' : 'whitespace-normal'
                    } ${col.headerClassName || ''}`}
                  >
                    {col.sortable ? (
                      // Sortable header — clicking toggles asc/desc, × clears the sort
                      <span className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const nextDir =
                              sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc';
                            onSort?.(col.key, nextDir);
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

                        {/* × only appears on the currently active sort column */}
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
                      key={key}
                      className={`hover:bg-byu-royal/10 transition-colors ${
                        isExpanded ? 'bg-byu-royal/5' : ''
                      }`}
                    >
                      {/* Expand toggle — only shown on rows where isExpandable returns true */}
                      {expandableRows && (
                        <td className="w-10 px-3 py-3 align-middle">
                          {canExpand && (
                            <button
                              onClick={() => toggleRow(key)}
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

                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-6 py-3 align-middle text-gray-700 ${
                            col.noWrap ? 'whitespace-nowrap' : 'wrap-break-word whitespace-normal'
                          } ${col.cellClassName || ''}`}
                        >
                          {col.actions ? (
                            // Actions column renders the three-dot menu
                            <div className="flex justify-end">
                              <RowActionMenu
                                trigger={<FiMoreVertical className="h-4 w-4" />}
                                items={col.actions
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
                      ))}
                    </tr>

                    {/* Expanded sub-row — renders below the parent row when toggled open */}
                    {expandableRows && canExpand && isExpanded && (
                      <tr key={`${key}-expanded`} className="transition-all">
                        <td colSpan={totalCols} className="bg-slate-50">
                          <div className="origin-top translate-y-0 opacity-100 transition-all duration-300">
                            <div className="border-byu-royal/40 mt-3 mr-6 mb-4 ml-15 border-l-2 pl-4">
                              <ExpandedSubTable
                                parentRow={row}
                                config={expandableRows.expandedTable}
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
