'use client';

import { Pencil, Phone, Stethoscope, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from 'cn';
import { type ReactNode, useCallback, useMemo } from 'react';

import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import type { Patient } from '@/types/patient';

import { ConditionBadge } from './condition-badge';
import { capitalize, formatDate } from '@/lib/format';
import { formatPhone } from '@/lib/phone';

const getPatientId = (patient: Patient) => patient._id;

type PatientAction = (patient: Patient) => void;

interface RowActionsProps {
  patient: Patient;
  onEdit: PatientAction | undefined;
  onDelete: PatientAction;
}

function RowActions({ patient, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={() => onEdit(patient)}
          aria-label={`Edit ${patient.name}`}
        >
          <Pencil aria-hidden="true" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(patient)}
        aria-label={`Delete ${patient.name}`}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}

/** The patient's name, linking to their profile page. */
function PatientNameLink({ patient, className }: { patient: Patient; className?: string }) {
  return (
    <Link
      href={`/patients/${patient._id}`}
      className={cn(
        'w-fit rounded-sm font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className,
      )}
    >
      {patient.name}
    </Link>
  );
}

function DoctorLink({ patient }: { patient: Patient }) {
  if (!patient.doctor) return <span className="text-muted-foreground">Unassigned</span>;

  return (
    <Link
      href={`/doctors/${patient.doctor._id}`}
      className="grid w-fit rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span className="font-medium whitespace-nowrap">{patient.doctor.name}</span>
      <span className="text-xs text-muted-foreground">{patient.doctor.specialization}</span>
    </Link>
  );
}

interface PatientCardProps extends Omit<RowActionsProps, 'patient'> {
  patient: Patient;
  showDoctor: boolean;
}

function PatientCard({ patient, showDoctor, onEdit, onDelete }: PatientCardProps) {
  return (
    <article className="grid gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid min-w-0 gap-1">
          <PatientNameLink patient={patient} className="truncate" />
          <p className="text-sm text-muted-foreground">
            {patient.age} yrs · {capitalize(patient.gender)}
          </p>
        </div>
        <RowActions patient={patient} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <ConditionBadge condition={patient.condition} className="w-fit" />
      {showDoctor && patient.doctor && (
        <Link
          href={`/doctors/${patient.doctor._id}`}
          className="flex w-fit items-center gap-2 text-sm hover:underline"
        >
          <Stethoscope className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {patient.doctor.name}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2 tabular-nums">
          <Phone className="size-4 shrink-0" aria-hidden="true" />
          {formatPhone(patient.phone)}
        </span>
        <span>Admitted {formatDate(patient.admittedAt)}</span>
      </div>
    </article>
  );
}

interface PatientsTableProps {
  patients: readonly Patient[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  skeletonRows: number;
  emptyState: ReactNode;
  /** Keep the handlers stable (useCallback): the columns are memoized on them. */
  onDelete: PatientAction;
  /** Adds an edit button per row when set. */
  onEdit?: PatientAction;
  /** Adds the doctor column (patients page); off on a doctor's own page. */
  showDoctor?: boolean;
}

export function PatientsTable({
  patients,
  isLoading,
  isFetching,
  skeletonRows,
  emptyState,
  onDelete,
  onEdit,
  showDoctor = false,
}: PatientsTableProps) {
  const columns = useMemo<readonly DataTableColumn<Patient>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: (patient) => <PatientNameLink patient={patient} />,
      },
      {
        id: 'age',
        header: 'Age',
        headerClassName: 'text-right',
        className: 'text-right tabular-nums',
        cell: (patient) => patient.age,
      },
      {
        id: 'gender',
        header: 'Gender',
        hideBelow: 'xl',
        cell: (patient) => capitalize(patient.gender),
      },
      {
        id: 'condition',
        header: 'Condition',
        cell: (patient) => <ConditionBadge condition={patient.condition} />,
      },
      ...(showDoctor
        ? [
            {
              id: 'doctor',
              header: 'Doctor',
              cell: (patient: Patient) => <DoctorLink patient={patient} />,
            },
          ]
        : []),
      {
        id: 'phone',
        header: 'Phone',
        hideBelow: 'xl',
        cell: (patient) => (
          <span className="whitespace-nowrap tabular-nums">{formatPhone(patient.phone)}</span>
        ),
      },
      {
        id: 'admittedAt',
        header: 'Admitted',
        cell: (patient) => (
          <time dateTime={patient.admittedAt} className="whitespace-nowrap text-muted-foreground">
            {formatDate(patient.admittedAt)}
          </time>
        ),
      },
      {
        id: 'actions',
        header: <span className="sr-only">Actions</span>,
        className: onEdit ? 'w-20 text-right' : 'w-12 text-right',
        cell: (patient) => <RowActions patient={patient} onEdit={onEdit} onDelete={onDelete} />,
      },
    ],
    [onDelete, onEdit, showDoctor],
  );

  const renderCard = useCallback(
    (patient: Patient) => (
      <PatientCard patient={patient} showDoctor={showDoctor} onEdit={onEdit} onDelete={onDelete} />
    ),
    [onDelete, onEdit, showDoctor],
  );

  return (
    <DataTable
      caption="Patients"
      columns={columns}
      data={patients}
      getRowId={getPatientId}
      isLoading={isLoading}
      isFetching={isFetching}
      skeletonRows={skeletonRows}
      emptyState={emptyState}
      renderMobileCard={renderCard}
    />
  );
}
