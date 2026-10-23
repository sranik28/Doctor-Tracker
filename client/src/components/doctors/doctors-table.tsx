'use client';

import { format, parseISO } from 'date-fns';
import { Building2, Mail, Phone, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactNode, useCallback } from 'react';

import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import type { DoctorListItem } from '@/types/doctor';
import { formatPhone } from '@/lib/phone';

const formatDate = (iso: string) => format(parseISO(iso), 'd MMM yyyy');

// Module-level so the array identity never changes and memoized rows stay memoized.
const COLUMNS: readonly DataTableColumn<DoctorListItem>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (doctor) => <span className="font-medium">{doctor.name}</span>,
  },
  {
    id: 'specialization',
    header: 'Specialization',
    cell: (doctor) => <Badge variant="secondary">{doctor.specialization}</Badge>,
  },
  { id: 'hospital', header: 'Hospital', cell: (doctor) => doctor.hospital },
  {
    id: 'phone',
    header: 'Phone',
    cell: (doctor) => (
      <span className="whitespace-nowrap tabular-nums">{formatPhone(doctor.phone)}</span>
    ),
  },
  {
    id: 'email',
    header: 'Email',
    hideBelow: 'xl',
    cell: (doctor) => <span className="text-muted-foreground">{doctor.email}</span>,
  },
  {
    id: 'patients',
    header: 'Patients',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums',
    cell: (doctor) => doctor.patientCount,
  },
  {
    id: 'createdAt',
    header: 'Added',
    hideBelow: '2xl',
    cell: (doctor) => (
      <time dateTime={doctor.createdAt} className="whitespace-nowrap text-muted-foreground">
        {formatDate(doctor.createdAt)}
      </time>
    ),
  },
];

function DoctorCard({ doctor }: { doctor: DoctorListItem }) {
  const detail = (icon: ReactNode, text: string) => (
    <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span className="truncate">{text}</span>
    </span>
  );

  return (
    <article className="grid gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40">
      <div className="flex items-start justify-between gap-3">
        <div className="grid min-w-0 gap-1">
          <p className="truncate font-medium">{doctor.name}</p>
          <Badge variant="secondary" className="w-fit">
            {doctor.specialization}
          </Badge>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-sm tabular-nums">
          <Users className="size-4 text-muted-foreground" aria-hidden="true" />
          {doctor.patientCount}
          <span className="sr-only">patients</span>
        </span>
      </div>
      <div className="grid gap-1.5">
        {detail(<Building2 className="size-4 shrink-0" aria-hidden="true" />, doctor.hospital)}
        {detail(
          <Phone className="size-4 shrink-0" aria-hidden="true" />,
          formatPhone(doctor.phone),
        )}
        {detail(<Mail className="size-4 shrink-0" aria-hidden="true" />, doctor.email)}
      </div>
      <p className="text-xs text-muted-foreground">Added {formatDate(doctor.createdAt)}</p>
    </article>
  );
}

const renderDoctorCard = (doctor: DoctorListItem) => <DoctorCard doctor={doctor} />;
const getDoctorId = (doctor: DoctorListItem) => doctor._id;
const getDoctorLabel = (doctor: DoctorListItem) => `View ${doctor.name}`;

interface DoctorsTableProps {
  doctors: readonly DoctorListItem[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  skeletonRows: number;
  emptyState: ReactNode;
}

export function DoctorsTable({
  doctors,
  isLoading,
  isFetching,
  skeletonRows,
  emptyState,
}: DoctorsTableProps) {
  const router = useRouter();
  const openDoctor = useCallback(
    (doctor: DoctorListItem) => router.push(`/doctors/${doctor._id}`),
    [router],
  );

  return (
    <DataTable
      caption="Doctors"
      columns={COLUMNS}
      data={doctors}
      getRowId={getDoctorId}
      getRowLabel={getDoctorLabel}
      onRowClick={openDoctor}
      isLoading={isLoading}
      isFetching={isFetching}
      skeletonRows={skeletonRows}
      emptyState={emptyState}
      renderMobileCard={renderDoctorCard}
    />
  );
}
