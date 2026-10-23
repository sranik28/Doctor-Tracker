'use client';

import { format, parseISO } from 'date-fns';
import { Phone, Trash2 } from 'lucide-react';
import { type ReactNode, useCallback, useMemo } from 'react';

import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Patient } from '@/types/patient';

const formatDate = (iso: string) => format(parseISO(iso), 'd MMM yyyy');
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const getPatientId = (patient: Patient) => patient._id;

interface DeleteButtonProps {
  patient: Patient;
  onDelete: (patient: Patient) => void;
}

function DeleteButton({ patient, onDelete }: DeleteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      onClick={() => onDelete(patient)}
      aria-label={`Delete ${patient.name}`}
    >
      <Trash2 aria-hidden="true" />
    </Button>
  );
}

function PatientCard({ patient, onDelete }: DeleteButtonProps) {
  return (
    <article className="grid gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid min-w-0 gap-1">
          <h3 className="truncate font-medium">{patient.name}</h3>
          <p className="text-sm text-muted-foreground">
            {patient.age} yrs · {capitalize(patient.gender)}
          </p>
        </div>
        <DeleteButton patient={patient} onDelete={onDelete} />
      </div>
      <Badge variant="outline" className="w-fit">
        {patient.condition}
      </Badge>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2 tabular-nums">
          <Phone className="size-4 shrink-0" aria-hidden="true" />
          {patient.phone}
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
  /** Keep stable (useCallback): the columns are memoized on it. */
  onDelete: (patient: Patient) => void;
}

export function PatientsTable({
  patients,
  isLoading,
  isFetching,
  skeletonRows,
  emptyState,
  onDelete,
}: PatientsTableProps) {
  const columns = useMemo<readonly DataTableColumn<Patient>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: (patient) => <span className="font-medium">{patient.name}</span>,
      },
      {
        id: 'age',
        header: 'Age',
        headerClassName: 'text-right',
        className: 'text-right tabular-nums',
        cell: (patient) => patient.age,
      },
      { id: 'gender', header: 'Gender', cell: (patient) => capitalize(patient.gender) },
      {
        id: 'condition',
        header: 'Condition',
        cell: (patient) => <Badge variant="outline">{patient.condition}</Badge>,
      },
      {
        id: 'phone',
        header: 'Phone',
        cell: (patient) => <span className="whitespace-nowrap tabular-nums">{patient.phone}</span>,
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
        className: 'w-12 text-right',
        cell: (patient) => <DeleteButton patient={patient} onDelete={onDelete} />,
      },
    ],
    [onDelete],
  );

  const renderCard = useCallback(
    (patient: Patient) => <PatientCard patient={patient} onDelete={onDelete} />,
    [onDelete],
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
