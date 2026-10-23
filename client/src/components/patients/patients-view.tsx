'use client';

import { AlertTriangle, SearchX, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { FilterBar } from '@/components/shared/filter-bar';
import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useClampPage } from '@/hooks/use-clamp-page';
import { useDeletePatient, usePatients } from '@/hooks/use-patients';
import { useSearchSeed } from '@/hooks/use-search-seed';
import { useUrlFilters } from '@/hooks/use-url-filters';
import { getApiErrorMessage } from '@/lib/api-error';
import { PAGE_SIZE_OPTIONS } from '@/schemas/common.schema';
import { patientsPageFiltersSchema } from '@/schemas/patient.schema';
import type { Patient } from '@/types/patient';

import { EditPatientDialog } from './edit-patient-dialog';
import { PatientFilters } from './patient-filters';
import { PatientsTable } from './patients-table';

const CLEARED_FILTERS = {
  search: undefined,
  condition: undefined,
  doctorId: undefined,
  gender: undefined,
  from: undefined,
  to: undefined,
};

export function PatientsView() {
  const { filters, setFilters, setPage } = useUrlFilters(patientsPageFiltersSchema);
  const { data, isLoading, isFetching, isError, isPlaceholderData, refetch } = usePatients(filters);
  const deletePatient = useDeletePatient();
  const { searchKey, searchDefaultValue, resetSearch } = useSearchSeed(filters.search);

  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const activeFilterCount = [
    filters.condition,
    filters.doctorId,
    filters.gender,
    filters.from ?? filters.to,
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0 || Boolean(filters.search);

  const handleSearch = useCallback(
    (search: string) => setFilters({ search: search || undefined }),
    [setFilters],
  );

  const clearFilters = useCallback(() => {
    setFilters(CLEARED_FILTERS);
    resetSearch();
  }, [resetSearch, setFilters]);

  // New page = new list: start reading from the top (filter changes keep their position).
  const goToPage = (page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useClampPage({
    page: filters.page,
    totalPages: data?.meta.totalPages,
    isPlaceholderData,
    setPage,
  });

  // Stable so the memoized table columns don't rebuild on every render.
  const requestEdit = useCallback((patient: Patient) => setPatientToEdit(patient), []);
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

  const emptyState = hasActiveFilters ? (
    <EmptyState
      icon={SearchX}
      title="No patients match your filters"
      description="Try a different search or remove some filters. Search matches whole words."
      action={
        <Button variant="outline" onClick={clearFilters}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={UserRound}
      title="No patients yet"
      description="Patients are added from a doctor's page."
      action={
        <Button variant="outline" asChild>
          <Link href="/doctors">Go to doctors</Link>
        </Button>
      }
    />
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        title="Patients"
        description="Every patient across your doctors. Search, filter, edit or reassign."
      />

      <FilterBar
        search={
          <SearchInput
            key={searchKey}
            defaultValue={searchDefaultValue}
            onSearch={handleSearch}
            placeholder="Search patients by name"
            aria-label="Search patients by name"
          />
        }
        activeCount={activeFilterCount}
        onClear={hasActiveFilters ? clearFilters : undefined}
      >
        <PatientFilters filters={filters} onChange={setFilters} />
      </FilterBar>

      {isError && !data ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load patients"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <PatientsTable
            patients={data?.items}
            isLoading={isLoading}
            isFetching={isFetching}
            skeletonRows={filters.limit}
            emptyState={emptyState}
            onEdit={requestEdit}
            onDelete={requestDelete}
            showDoctor
          />
          {data && (
            <Pagination
              page={data.meta.page}
              limit={data.meta.limit}
              total={data.meta.total}
              totalPages={data.meta.totalPages}
              onPageChange={goToPage}
              onLimitChange={(limit) => setFilters({ limit })}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          )}
        </div>
      )}

      <EditPatientDialog patient={patientToEdit} onClose={() => setPatientToEdit(null)} />

      <ConfirmDialog
        open={patientToDelete !== null}
        onOpenChange={(open) => !open && setPatientToDelete(null)}
        title={`Delete ${patientToDelete?.name ?? 'patient'}?`}
        description="This permanently removes the patient and their notes. This can't be undone."
        confirmLabel="Delete patient"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export function PatientsViewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6" aria-busy="true">
      <div className="grid gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-full md:w-2/3" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
