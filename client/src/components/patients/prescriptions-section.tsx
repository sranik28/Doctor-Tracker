'use client';

import { AlertTriangle, Pencil, Pill, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useDeletePrescription, usePrescriptions } from '@/hooks/use-prescriptions';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatDate } from '@/lib/format';
import type { Prescription } from '@/types/prescription';

import { PrescriptionDialog } from './prescription-dialog';

type PrescriptionAction = (prescription: Prescription) => void;

interface RowActionsProps {
  prescription: Prescription;
  onEdit: PrescriptionAction;
  onDelete: PrescriptionAction;
}

function RowActions({ prescription, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground"
        onClick={() => onEdit(prescription)}
        aria-label={`Edit ${prescription.medicine}`}
      >
        <Pencil aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(prescription)}
        aria-label={`Delete ${prescription.medicine}`}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}

function PrescriptionCard({ prescription, onEdit, onDelete }: RowActionsProps) {
  return (
    <article className="grid gap-2 rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid min-w-0 gap-0.5">
          <p className="font-medium">{prescription.medicine}</p>
          <p className="text-sm text-muted-foreground">
            {prescription.dosage} · {prescription.duration}
          </p>
        </div>
        <RowActions prescription={prescription} onEdit={onEdit} onDelete={onDelete} />
      </div>
      {prescription.instructions && <p className="text-sm">{prescription.instructions}</p>}
      <p className="text-xs text-muted-foreground">
        {formatDate(prescription.prescribedAt)}
        {prescription.doctor && ` · ${prescription.doctor.name}`}
      </p>
    </article>
  );
}

const getPrescriptionId = (prescription: Prescription) => prescription._id;

/** What the doctor prescribed to a patient: add, edit and delete. */
export function PrescriptionsSection({ patientId }: { patientId: string }) {
  const { data, isLoading, isFetching, isError, refetch } = usePrescriptions(patientId, true);
  const deletePrescription = useDeletePrescription(patientId);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [toEdit, setToEdit] = useState<Prescription | null>(null);
  const [toDelete, setToDelete] = useState<Prescription | null>(null);

  const openAdd = () => {
    setToEdit(null);
    setDialogOpen(true);
  };
  const openEdit = useCallback<PrescriptionAction>((prescription) => {
    setToEdit(prescription);
    setDialogOpen(true);
  }, []);
  const askDelete = useCallback<PrescriptionAction>((prescription) => {
    setToDelete(prescription);
  }, []);

  const confirmDelete = () => {
    if (!toDelete) return;
    const removed = toDelete;
    deletePrescription.mutate(removed._id, {
      onSuccess: () => toast.success(`${removed.medicine} was removed`),
      onError: (error) =>
        toast.error(getApiErrorMessage(error, `Could not delete ${removed.medicine}.`)),
      onSettled: () => setToDelete(null),
    });
  };

  const columns = useMemo<readonly DataTableColumn<Prescription>[]>(
    () => [
      {
        id: 'medicine',
        header: 'Medicine',
        cell: (prescription) => <span className="font-medium">{prescription.medicine}</span>,
      },
      { id: 'dosage', header: 'Dosage', cell: (prescription) => prescription.dosage },
      { id: 'duration', header: 'Duration', cell: (prescription) => prescription.duration },
      {
        id: 'instructions',
        header: 'Instructions',
        hideBelow: 'xl',
        cell: (prescription) => (
          <span className="text-muted-foreground">{prescription.instructions || '—'}</span>
        ),
      },
      {
        id: 'prescribedAt',
        header: 'Date',
        cell: (prescription) => (
          <time
            dateTime={prescription.prescribedAt}
            className="whitespace-nowrap text-muted-foreground"
          >
            {formatDate(prescription.prescribedAt)}
          </time>
        ),
      },
      {
        id: 'doctor',
        header: 'Prescribed by',
        hideBelow: 'xl',
        cell: (prescription) => prescription.doctor?.name ?? '—',
      },
      {
        id: 'actions',
        header: <span className="sr-only">Actions</span>,
        className: 'w-20 text-right',
        cell: (prescription) => (
          <RowActions prescription={prescription} onEdit={openEdit} onDelete={askDelete} />
        ),
      },
    ],
    [askDelete, openEdit],
  );

  const renderCard = useCallback(
    (prescription: Prescription) => (
      <PrescriptionCard prescription={prescription} onEdit={openEdit} onDelete={askDelete} />
    ),
    [askDelete, openEdit],
  );

  return (
    <section className="grid gap-4" aria-labelledby="prescriptions-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="prescriptions-heading" className="text-lg font-semibold">
          Prescriptions
        </h2>
        <Button onClick={openAdd}>
          <Plus aria-hidden="true" />
          Add prescription
        </Button>
      </div>

      {isError && !data ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load prescriptions"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <DataTable
          caption="Prescriptions"
          columns={columns}
          data={data}
          getRowId={getPrescriptionId}
          isLoading={isLoading}
          isFetching={isFetching}
          skeletonRows={3}
          renderMobileCard={renderCard}
          emptyState={
            <EmptyState
              icon={Pill}
              title="No prescriptions yet"
              description="Add what the doctor prescribed to this patient."
              action={
                <Button onClick={openAdd}>
                  <Plus aria-hidden="true" />
                  Add prescription
                </Button>
              }
            />
          }
        />
      )}

      <PrescriptionDialog
        patientId={patientId}
        open={isDialogOpen}
        prescription={toEdit}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete ${toDelete?.medicine ?? 'prescription'}?`}
        description="This removes the prescription from the patient's record. This can't be undone."
        confirmLabel="Delete prescription"
        destructive
        isPending={deletePrescription.isPending}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
