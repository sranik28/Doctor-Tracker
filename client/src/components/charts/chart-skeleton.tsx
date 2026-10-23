import { cn } from 'cn';

import { Skeleton } from '@/components/ui/skeleton';

interface ChartSkeletonProps {
  className?: string;
}

/** Placeholder with the chart's footprint (also the lazy-load fallback). */
export function ChartSkeleton({ className }: ChartSkeletonProps) {
  return (
    <div className={cn('flex h-full w-full items-end gap-2', className)} aria-hidden="true">
      {[45, 70, 55, 85, 60, 95, 75, 50].map((height, index) => (
        <Skeleton key={index} className="flex-1 rounded-sm" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}
