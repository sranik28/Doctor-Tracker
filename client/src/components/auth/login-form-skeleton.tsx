import { Skeleton } from '@/components/ui/skeleton';

export function LoginFormSkeleton() {
  return (
    <div className="grid gap-5" aria-hidden="true">
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="grid gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
