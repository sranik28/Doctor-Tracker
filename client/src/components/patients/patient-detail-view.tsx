'use client';

import {
  AlertTriangle,
  CalendarDays,
  Pencil,
  Phone,
  Stethoscope,
  Trash2,
  UserRound,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeletePatient, usePatient } from '@/hooks/use-patients';
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api-error';
import { capitalize, formatDate } from '@/lib/format';
import { getInitials } from '@/lib/get-initials';
import { formatPhone, toE164 } from '@/lib/phone';
import { isObjectId } from '@/schemas/common.schema';

import { ConditionBadge } from './condition-badge';
import { EditPatientDialog } from './edit-patient-dialog';

const LIST_CRUMB = { label: 'Patients', href: '/patients' };

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

export function PatientDetailView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isValidId = isObjectId(id);
  const { data: patient, error, isError, refetch, isFetching } = usePatient(id, isValidId);
  const deletePatient = useDeletePatient();

  const [isEditing, setEditing] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  // After a successful delete the page is about to leave: show the skeleton, not a 404 flash.
  const [isRemoved, setRemoved] = useState(false);

  const status = getApiErrorStatus(error);
  if (!isValidId || status === 404 || status === 400) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Breadcrumbs items={[LIST_CRUMB, { label: 'Not found' }]} />
        <EmptyState
          icon={UserX}
          title="Patient not found"
          description="This patient doesn't exist or the link is incorrect."
          action={
            <Button asChild>
              <Link href="/patients">View all patients</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (isError && !patient) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Breadcrumbs items={[LIST_CRUMB, { label: 'Error' }]} />
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load this patient"
          description="Check your connection and try again."
          action={
            <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (!patient || isRemoved) return <PatientDetailSkeleton />;

  const confirmDelete = () => {
    deletePatient.mutate(patient, {
      onSuccess: () => {
        setRemoved(true);
        toast.success(`${patient.name} was removed`);
        router.replace('/patients');
      },
      onError: (deleteError) => {
        setDeleting(false);
        toast.error(getApiErrorMessage(deleteError, `Could not delete ${patient.name}.`));
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Breadcrumbs items={[LIST_CRUMB, { label: patient.name }]} />

      <Card>
        <CardContent className="grid gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground"
              aria-hidden="true"
            >
              {getInitials(patient.name)}
            </span>
            <div className="grid min-w-0 flex-1 gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight">{patient.name}</h1>
              <ConditionBadge condition={patient.condition} className="w-fit" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleting(true)}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem icon={<UserRound className="size-4" aria-hidden="true" />} label="Age">
              {patient.age} yrs · {capitalize(patient.gender)}
            </DetailItem>
            <DetailItem icon={<Phone className="size-4" aria-hidden="true" />} label="Phone">
              <a href={`tel:${toE164(patient.phone)}`} className="hover:underline">
                {formatPhone(patient.phone)}
              </a>
            </DetailItem>
            <DetailItem
              icon={<CalendarDays className="size-4" aria-hidden="true" />}
              label="Admitted on"
            >
              <time dateTime={patient.admittedAt}>{formatDate(patient.admittedAt)}</time>
            </DetailItem>
            <DetailItem icon={<Stethoscope className="size-4" aria-hidden="true" />} label="Doctor">
              {patient.doctor ? (
                <Link href={`/doctors/${patient.doctor._id}`} className="hover:underline">
                  {patient.doctor.name}
                </Link>
              ) : (
                'Unassigned'
              )}
            </DetailItem>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-2">
          <h2 className="text-lg font-semibold">Notes</h2>
          {patient.notes ? (
            <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No notes for this patient.</p>
          )}
        </CardContent>
      </Card>

      {patient.doctor && (
        <p className="text-sm text-muted-foreground">
          Under the care of{' '}
          <Link
            href={`/doctors/${patient.doctor._id}`}
            className="font-medium text-foreground hover:underline"
          >
            {patient.doctor.name}
          </Link>{' '}
          ({patient.doctor.specialization}).
        </p>
      )}

      <EditPatientDialog patient={isEditing ? patient : null} onClose={() => setEditing(false)} />

      <ConfirmDialog
        open={isDeleting}
        onOpenChange={setDeleting}
        title={`Delete ${patient.name}?`}
        description="This permanently removes the patient and their notes. This can't be undone."
        confirmLabel="Delete patient"
        destructive
        isPending={deletePatient.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export function PatientDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6" aria-busy="true">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-52 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}
