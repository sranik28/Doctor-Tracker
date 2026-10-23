'use client';

import { type KeyboardEvent, memo, type ReactNode } from 'react';
import { cn } from 'cn';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** Hide this column (header and cells) below a breakpoint, to keep the table inside its box. */
  hideBelow?: 'xl' | '2xl';
}

const HIDE_BELOW_CLASS = {
  xl: 'hidden xl:table-cell',
  '2xl': 'hidden 2xl:table-cell',
} as const;

interface DataTableProps<T> {
  columns: readonly DataTableColumn<T>[];
  data: readonly T[] | undefined;
  getRowId: (row: T) => string;
  /** Keep stable (useCallback) so memoized rows don't re-render. */
  onRowClick?: (row: T) => void;
  /** Screen-reader label for a clickable row / card. */
  getRowLabel?: (row: T) => string;
  /** First load: no data yet, show skeleton rows. */
  isLoading?: boolean;
  /** Background refetch with data on screen: dim it instead of replacing it. */
  isFetching?: boolean;
  skeletonRows?: number;
  emptyState?: ReactNode;
  /** When set, rows render as these cards below md instead of the table. */
  renderMobileCard?: (row: T) => ReactNode;
  caption?: string;
}

interface DataTableRowProps<T> {
  row: T;
  columns: readonly DataTableColumn<T>[];
  onRowClick?: ((row: T) => void) | undefined;
  label?: string | undefined;
}

const activateOnEnter = (event: KeyboardEvent, action: () => void) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
};

function DataTableRowComponent<T>({ row, columns, onRowClick, label }: DataTableRowProps<T>) {
  const handleClick = onRowClick ? () => onRowClick(row) : undefined;

  return (
    <TableRow
      onClick={handleClick}
      onKeyDown={handleClick ? (event) => activateOnEnter(event, handleClick) : undefined}
      tabIndex={handleClick ? 0 : undefined}
      aria-label={label}
      className={cn(
        handleClick &&
          'cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
      )}
    >
      {columns.map((column) => (
        <TableCell
          key={column.id}
          className={cn(column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow], column.className)}
        >
          {column.cell(row)}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Rows re-render only when their row, columns or click handler change (e.g. not while typing).
const DataTableRow = memo(DataTableRowComponent) as typeof DataTableRowComponent;

export function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  getRowLabel,
  isLoading = false,
  isFetching = false,
  skeletonRows = 10,
  emptyState,
  renderMobileCard,
  caption,
}: DataTableProps<T>) {
  const showSkeleton = isLoading && !data;
  const isEmpty = !showSkeleton && data?.length === 0;
  const isRefreshing = isFetching && !showSkeleton;

  if (isEmpty) return <>{emptyState}</>;

  return (
    <div className="relative" aria-busy={isFetching}>
      {isRefreshing && (
        <div
          className="absolute inset-x-0 -top-px z-10 h-0.5 overflow-hidden rounded-full bg-primary/10"
          role="progressbar"
          aria-label="Loading"
        >
          <div className="h-full w-1/3 animate-[progress_1s_ease-in-out_infinite] bg-primary/60 motion-reduce:animate-none" />
        </div>
      )}

      <div className={cn('transition-opacity duration-200', isRefreshing && 'opacity-60')}>
        {renderMobileCard && (
          <ul className="grid gap-3 lg:hidden" aria-label={caption}>
            {showSkeleton
              ? Array.from({ length: Math.min(skeletonRows, 5) }, (_, index) => (
                  <li key={index}>
                    <Skeleton className="h-32 w-full rounded-lg" />
                  </li>
                ))
              : data?.map((row) => (
                  <li key={getRowId(row)}>
                    {onRowClick ? (
                      <button
                        type="button"
                        onClick={() => onRowClick(row)}
                        // No aria-label: the card's own text is its accessible name (and its visible label).
                        className="w-full rounded-lg text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {renderMobileCard(row)}
                      </button>
                    ) : (
                      renderMobileCard(row)
                    )}
                  </li>
                ))}
          </ul>
        )}

        <div className={cn('rounded-lg border', renderMobileCard && 'hidden lg:block')}>
          <Table>
            {caption && <caption className="sr-only">{caption}</caption>}
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                      column.headerClassName,
                    )}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {showSkeleton
                ? Array.from({ length: skeletonRows }, (_, index) => (
                    <TableRow key={index} className="hover:bg-transparent">
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          className={column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow]}
                        >
                          <Skeleton className="h-4 w-full max-w-32" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.map((row) => (
                    <DataTableRow
                      key={getRowId(row)}
                      row={row}
                      columns={columns}
                      onRowClick={onRowClick}
                      label={getRowLabel?.(row)}
                    />
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
