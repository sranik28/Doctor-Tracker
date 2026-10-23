'use client';

import { Plus, SearchX, UserRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { useDeletePatient, useDoctorPatients } from '@/hooks/use-doctor';
import { useUrlFilters } from '@/hooks/use-url-filters';
import { getApiErrorMessage } from '@/lib/api-error';
import { PAGE_SIZE_OPTIONS } from '@/schemas/common.schema';
import { patientListFiltersSchema } from '@/schemas/patient.schema';
import type { Patient } from '@/types/patient';

import { AddPatientDialog } from './add-patient-dialog';
import { PatientsTable } from './patients-table';

interface DoctorPatientsSectionProps {
  doctorId: string;
  doctorName: string | undefined;
}

export function DoctorPatientsSection({ doctorId, doctorName }: DoctorPatientsSectionProps) {
  const { filters, setFilters, setPage } = useUrlFilters(patientListFiltersSchema);
  const { data, isLoading, isFetching, isPlaceholderData } = useDoctorPatients(
    doctorId,
    filters,
    true,
  );
  const deletePatient = useDeletePatient(doctorId);

  const [isAddOpen, setAddOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  // Remount seed for the search box (see DoctorsView for why the value travels with it).
  const [searchSeed, setSearchSeed] = useState(() => ({ key: 0, value: filters.search }));

  const handleSearch = useCallback(
    (search: string) => setFilters({ search: search || undefined }),
    [setFilters],
  );

  const clearSearch = () => {
    setFilters({ search: undefined });
    setSearchSeed((seed) => ({ key: seed.key + 1, value: undefined }));
  };

  // Stable so the memoized table columns don't rebuild on every render.
  const requestDelete = useCallback((patient: Patient) => setPatientToDelete(patient), []);

  const confirmDelete = () => {
    if (!patientToDelete) return;
    const patient = patientToDelete;
    // Optimistic: the row is already gone, so close the dialog straight away.
    setPatientToDelete(null);
    deletePatient.mutate(patient, {
      onSuccess: () => toast.success(`${patient.name} was removed`),
      onError: (error) =>
        toast.error(getApiErrorMessage(error, `Could not delete ${patient.name}. Restored.`)),
    });
  };

  // Deleting the last row of the last page leaves an empty page: step back one.
  const totalPages = data?.meta.totalPages ?? 0;
  useEffect(() => {
    if (!isPlaceholderData && totalPages > 0 && filters.page > totalPages) setPage(totalPages);
  }, [filters.page, isPlaceholderData, setPage, totalPages]);

  const emptyState = filters.search ? (
    <EmptyState
      icon={SearchX}
      title="No patients match your search"
      description={`Nothing found for "${filters.search}". Search matches whole words.`}
      action={
        <Button variant="outline" onClick={clearSearch}>
          Clear search
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={UserRound}
      title="No patients yet"
      description="Patients you add for this doctor will appear here."
      action={
        <Button onClick={() => setAddOpen(true)}>
          <Plus aria-hidden="true" />
          Add patient
        </Button>
      }
    />
  );

  return (
    <section className="grid grid-cols-1 gap-4" aria-labelledby="patients-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="patients-heading" className="text-lg font-semibold">
          Patients
        </h2>
        <div className="flex items-center gap-2">
          <SearchInput
            key={searchSeed.key}
            defaultValue={searchSeed.value}
            onSearch={handleSearch}
            placeholder="Search patients"
            aria-label="Search this doctor's patients by name"
            className="min-w-0 flex-1 sm:w-64 sm:flex-none"
          />
          <Button onClick={() => setAddOpen(true)} className="shrink-0">
            <Plus aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Add patient</span>
          </Button>
        </div>
      </div>

      <PatientsTable
        patients={data?.items}
        isLoading={isLoading}
        isFetching={isFetching}
        skeletonRows={Math.min(filters.limit, 5)}
        emptyState={emptyState}
        onDelete={requestDelete}
      />

      {data && (
        <Pagination
          page={data.meta.page}
          limit={data.meta.limit}
          total={data.meta.total}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
          onLimitChange={(limit) => setFilters({ limit })}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
      )}

      <AddPatientDialog
        doctorId={doctorId}
        doctorName={doctorName}
        open={isAddOpen}
        onOpenChange={setAddOpen}
      />

      <ConfirmDialog
        open={patientToDelete !== null}
        onOpenChange={(open) => !open && setPatientToDelete(null)}
        title={`Delete ${patientToDelete?.name ?? 'patient'}?`}
        description="This permanently removes the patient and their notes. This can't be undone."
        confirmLabel="Delete patient"
        destructive
        onConfirm={confirmDelete}
      />
    </section>
  );
}
