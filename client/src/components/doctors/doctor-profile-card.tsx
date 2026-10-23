import { Building2, Mail, Phone, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/lib/get-initials';
import type { DoctorDetail } from '@/types/doctor';

interface DetailItemProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

function DetailItem({ icon, label, children }: DetailItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="grid min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="truncate text-sm font-medium">{children}</span>
      </div>
    </div>
  );
}

export function DoctorProfileCard({ doctor }: { doctor: DoctorDetail }) {
  const patientLabel = `${doctor.patientCount} ${doctor.patientCount === 1 ? 'patient' : 'patients'}`;

  return (
    <Card>
      <CardContent className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground"
            aria-hidden="true"
          >
            {getInitials(doctor.name)}
          </span>
          <div className="grid min-w-0 flex-1 gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{doctor.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{doctor.specialization}</Badge>
              <Badge variant="outline" className="gap-1 tabular-nums">
                <Users aria-hidden="true" />
                {patientLabel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <DetailItem icon={<Building2 className="size-4" aria-hidden="true" />} label="Hospital">
            {doctor.hospital}
          </DetailItem>
          <DetailItem icon={<Phone className="size-4" aria-hidden="true" />} label="Phone">
            <a href={`tel:${doctor.phone.replace(/[^\d+]/g, '')}`} className="hover:underline">
              {doctor.phone}
            </a>
          </DetailItem>
          <DetailItem icon={<Mail className="size-4" aria-hidden="true" />} label="Email">
            <a href={`mailto:${doctor.email}`} className="hover:underline">
              {doctor.email}
            </a>
          </DetailItem>
        </div>
      </CardContent>
    </Card>
  );
}

export function DoctorProfileCardSkeleton() {
  return (
    <Card aria-busy="true">
      <CardContent className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="size-16 rounded-full" />
          <div className="grid gap-2">
            <Skeleton className="h-7 w-56" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-md" />
              <div className="grid gap-1.5">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
