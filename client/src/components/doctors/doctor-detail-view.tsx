'use client';

import { AlertTriangle, ArrowLeft, UserX } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { DoctorPatientsSection } from '@/components/patients/doctor-patients-section';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useDoctor } from '@/hooks/use-doctor';
import { getApiErrorStatus } from '@/lib/api-error';
import { isObjectId } from '@/schemas/common.schema';

import { DoctorProfileCard, DoctorProfileCardSkeleton } from './doctor-profile-card';

function BackToDoctors() {
  return (
    <Button variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground" asChild>
      <Link href="/doctors">
        <ArrowLeft aria-hidden="true" />
        Back to doctors
      </Link>
    </Button>
  );
}

export function DoctorDetailView() {
  const { id } = useParams<{ id: string }>();
  const isValidId = isObjectId(id);
  const { data: doctor, error, isError, refetch, isFetching } = useDoctor(id, isValidId);

  const status = getApiErrorStatus(error);
  const isNotFound = !isValidId || status === 404 || status === 400;

  if (isNotFound) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <BackToDoctors />
        <EmptyState
          icon={UserX}
          title="Doctor not found"
          description="This doctor doesn't exist or the link is incorrect."
          action={
            <Button asChild>
              <Link href="/doctors">View all doctors</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (isError && !doctor) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <BackToDoctors />
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load this doctor"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <BackToDoctors />
      {doctor ? <DoctorProfileCard doctor={doctor} /> : <DoctorProfileCardSkeleton />}
      {/* Mounted right away so patients load in parallel with the doctor, not after it. */}
      <DoctorPatientsSection doctorId={id} doctorName={doctor?.name} />
    </div>
  );
}

export function DoctorDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="h-8" />
      <DoctorProfileCardSkeleton />
    </div>
  );
}
