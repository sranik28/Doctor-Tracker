'use client';

import { cn } from 'cn';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterOption {
  value: string;
  label: string;
}

/** Plain strings as options whose label is the value itself. */
export const toFilterOptions = (values: readonly string[]): FilterOption[] =>
  values.map((value) => ({ value, label: value }));

const ALL = '__all__';

interface FilterSelectProps {
  /** Accessible name of the trigger. */
  label: string;
  value: string | undefined;
  options: readonly FilterOption[];
  onChange: (value: string | undefined) => void;
  /** When set, adds an "all" choice that clears the filter (e.g. "All conditions"). */
  allLabel?: string;
  isLoading?: boolean;
  className?: string;
}

/** A filter dropdown for list pages, driven by URL values (`undefined` = no filter). */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
  allLabel,
  isLoading = false,
  className,
}: FilterSelectProps) {
  // Keep a value from a shared link selectable even if it isn't in the current options.
  const items =
    value && !options.some((option) => option.value === value)
      ? [{ value, label: value }, ...options]
      : options;

  return (
    <Select
      value={value ?? (allLabel ? ALL : '')}
      onValueChange={(next) => onChange(next === ALL ? undefined : next)}
      disabled={isLoading && !value}
    >
      <SelectTrigger className={cn('w-full md:w-44', className)} aria-label={label}>
        <SelectValue placeholder={allLabel ?? label} />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value={ALL}>{allLabel}</SelectItem>}
        {items.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
