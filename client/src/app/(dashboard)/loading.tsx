import { Skeleton } from '@/components/ui/skeleton';

// Shown while a dashboard route streams in. Pages with their own skeleton replace it.
export default function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 gap-6" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="grid gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-9 w-full md:w-2/3" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
