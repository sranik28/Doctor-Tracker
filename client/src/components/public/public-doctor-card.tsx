import { Building2 } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/lib/get-initials';
import type { PublicDoctor } from '@/types/public-doctor';

export function PublicDoctorCard({ doctor }: { doctor: PublicDoctor }) {
  return (
    <Card className="relative transition-colors focus-within:ring-2 focus-within:ring-ring hover:bg-muted/40">
      <CardContent className="flex items-start gap-4">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          aria-hidden="true"
        >
          {getInitials(doctor.name)}
        </span>
        <div className="grid min-w-0 gap-2">
          <h3 className="truncate font-semibold tracking-tight">
            {/* The whole card is the link target. */}
            <Link
              href={`/find-doctors/${doctor._id}`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {doctor.name}
            </Link>
          </h3>
          <Badge variant="secondary" className="w-fit">
            {doctor.specialization}
          </Badge>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{doctor.hospital}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PublicDoctorCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}
