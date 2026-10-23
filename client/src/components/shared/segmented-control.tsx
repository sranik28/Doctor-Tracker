'use client';

import { cn } from 'cn';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  /** Spoken label, when the visible one is an abbreviation ("7D" -> "Last 7 days"). */
  ariaLabel?: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: readonly SegmentedControlOption<T>[];
  onChange: (value: T) => void;
}

/** A small single-select toggle group (e.g. chart time range). */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg bg-muted p-0.5">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            aria-label={option.ariaLabel}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors pointer-coarse:min-h-10 pointer-coarse:min-w-10',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-foreground/70 hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
