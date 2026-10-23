'use client';

import { AlertTriangle, Building2, Stethoscope, UserX } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicDoctor } from '@/hooks/use-public-doctors';
import { getApiErrorStatus } from '@/lib/api-error';
import { getInitials } from '@/lib/get-initials';
import { isObjectId } from '@/schemas/common.schema';

const LIST_CRUMB = { label: 'Find a doctor', href: '/find-doctors' };

function ProfileShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-8 sm:px-6">{children}</div>;
}

export function PublicDoctorProfile() {
  const { id } = useParams<{ id: string }>();
  const isValidId = isObjectId(id);
  const { data: doctor, error, isError, refetch, isFetching } = usePublicDoctor(id, isValidId);

  const status = getApiErrorStatus(error);
  if (!isValidId || status === 404 || status === 400) {
    return (
      <ProfileShell>
        <Breadcrumbs items={[LIST_CRUMB, { label: 'Not found' }]} />
        <EmptyState
          icon={UserX}
          title="Doctor not found"
          description="This doctor doesn't exist or the link is incorrect."
          action={
            <Button asChild>
              <Link href="/find-doctors">Find a doctor</Link>
            </Button>
          }
        />
      </ProfileShell>
    );
  }

  if (isError && !doctor) {
    return (
      <ProfileShell>
        <Breadcrumbs items={[LIST_CRUMB, { label: 'Error' }]} />
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load this doctor"
          description="Check your connection and try again."
          action={
            <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      </ProfileShell>
    );
  }

  if (!doctor) return <PublicDoctorProfileSkeleton />;

  return (
    <ProfileShell>
      <Breadcrumbs items={[LIST_CRUMB, { label: doctor.name }]} />
      <Card>
        <CardContent className="grid gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground"
              aria-hidden="true"
            >
              {getInitials(doctor.name)}
            </span>
            <div className="grid min-w-0 gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{doctor.name}</h1>
              <Badge variant="secondary" className="w-fit">
                {doctor.specialization}
              </Badge>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Stethoscope className="size-4" aria-hidden="true" />
              </span>
              <div className="grid">
                <dt className="text-xs text-muted-foreground">Specialization</dt>
                <dd className="text-sm font-medium">{doctor.specialization}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Building2 className="size-4" aria-hidden="true" />
              </span>
              <div className="grid">
                <dt className="text-xs text-muted-foreground">Hospital</dt>
                <dd className="text-sm font-medium">{doctor.hospital}</dd>
              </div>
            </div>
          </dl>

          <p className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            To book an appointment, please contact {doctor.hospital} directly.
          </p>
        </CardContent>
      </Card>

      <div>
        <Button asChild variant="outline">
          <Link href={`/find-doctors?specialization=${encodeURIComponent(doctor.specialization)}`}>
            More {doctor.specialization} doctors
          </Link>
        </Button>
      </div>
    </ProfileShell>
  );
}

export function PublicDoctorProfileSkeleton() {
  return (
    <ProfileShell>
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-64 w-full" />
    </ProfileShell>
  );
}
