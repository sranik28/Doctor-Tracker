import { Skeleton } from '@/components/ui/skeleton';

/** Mirrors the dashboard shell so the first paint doesn't jump once the session is confirmed. */
export function AppShellSkeleton() {
  return (
    <div className="min-h-svh" aria-busy="true">
      <span className="sr-only">Loading your workspace…</span>

      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b px-6">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="grid gap-2 p-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      </aside>

      <div className="md:pl-64">
        <div className="flex h-16 items-center justify-between border-b px-4 md:px-6">
          <Skeleton className="size-9 md:hidden" />
          <Skeleton className="ml-auto size-9 rounded-full" />
        </div>
        <div className="grid gap-6 p-4 md:p-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    </div>
  );
}
