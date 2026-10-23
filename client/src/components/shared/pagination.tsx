'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from 'cn';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getPaginationRange } from '@/lib/pagination-range';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
}

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50],
  className,
}: PaginationProps) {
  if (total === 0) return null;

  const firstItem = (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 sm:justify-start">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing <span className="font-medium text-foreground tabular-nums">{firstItem}</span>–
          <span className="font-medium text-foreground tabular-nums">{lastItem}</span> of{' '}
          <span className="font-medium text-foreground tabular-nums">{total}</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground lg:inline">Rows per page</span>
          <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
            <SelectTrigger size="sm" className="w-18" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <nav
        aria-label="Pagination"
        className="flex items-center justify-between gap-1 sm:justify-end"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoBack}
          aria-label="Previous page"
        >
          <ChevronLeft aria-hidden="true" />
          <span className="sm:sr-only">Prev</span>
        </Button>

        <span className="text-sm text-muted-foreground tabular-nums sm:hidden">
          Page {page} of {totalPages}
        </span>

        <ul className="hidden items-center gap-1 sm:flex">
          {getPaginationRange(page, totalPages).map((item) =>
            typeof item === 'number' ? (
              <li key={item}>
                <Button
                  variant={item === page ? 'default' : 'ghost'}
                  size="sm"
                  className="min-w-8 tabular-nums"
                  onClick={() => onPageChange(item)}
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                >
                  {item}
                </Button>
              </li>
            ) : (
              <li key={item} className="px-1 text-sm text-muted-foreground" aria-hidden="true">
                …
              </li>
            ),
          )}
        </ul>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoForward}
          aria-label="Next page"
        >
          <span className="sm:sr-only">Next</span>
          <ChevronRight aria-hidden="true" />
        </Button>
      </nav>
    </div>
  );
}
