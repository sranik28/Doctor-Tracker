import type { ReactNode } from 'react';

export interface TooltipRow {
  /** CSS color of the series swatch (e.g. "var(--chart-1)"). */
  color: string;
  label: string;
  value: string;
}

interface ChartTooltipProps {
  title: string;
  subtitle?: string;
  rows: readonly TooltipRow[];
  footer?: ReactNode;
}

/** The one tooltip every chart uses: same surface, type and swatches everywhere. */
export function ChartTooltip({ title, subtitle, rows, footer }: ChartTooltipProps) {
  return (
    <div className="min-w-36 rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="text-sm font-medium">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      <ul className="mt-1.5 grid gap-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="size-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: row.color }}
                aria-hidden="true"
              />
              {row.label}
            </span>
            <span className="font-medium tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
      {footer && (
        <div className="mt-1.5 border-t pt-1.5 text-xs text-muted-foreground">{footer}</div>
      )}
    </div>
  );
}
