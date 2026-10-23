'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicFilterOptions } from '@/hooks/use-public-doctors';

export function SpecializationLinks() {
  const { data, isLoading, isError } = usePublicFilterOptions();

  if (isError) return null;

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-center gap-2" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-7 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <ul className="flex flex-wrap justify-center gap-2" aria-label="Browse by specialization">
      {data?.specializations.map((specialization) => (
        <li key={specialization}>
          <Badge asChild variant="outline" className="h-7 px-3 text-sm hover:bg-muted">
            <Link href={`/find-doctors?specialization=${encodeURIComponent(specialization)}`}>
              {specialization}
            </Link>
          </Badge>
        </li>
      ))}
    </ul>
  );
}
