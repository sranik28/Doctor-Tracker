'use client';

import { AlertTriangle, Plus, SearchX, Stethoscope } from 'lucide-react';
import { useCallback, useState } from 'react';

import { EmptyState } from '@/components/shared/empty-state';
import { FilterBar } from '@/components/shared/filter-bar';
import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctors } from '@/hooks/use-doctors';
import { useClampPage } from '@/hooks/use-clamp-page';
import { useSearchSeed } from '@/hooks/use-search-seed';
import { useUrlFilters } from '@/hooks/use-url-filters';
import { PAGE_SIZE_OPTIONS } from '@/schemas/common.schema';
import { doctorListFiltersSchema } from '@/schemas/doctor.schema';

import { CreateDoctorDialog } from './create-doctor-dialog';
import { DoctorFilters } from './doctor-filters';
import { DoctorsTable } from './doctors-table';

const CLEARED_FILTERS = {
  search: undefined,
  specialization: undefined,
  hospital: undefined,
  from: undefined,
  to: undefined,
};

export function DoctorsView() {
  const { filters, setFilters, setPage } = useUrlFilters(doctorListFiltersSchema);
  const { data, isLoading, isFetching, isError, isPlaceholderData, refetch } = useDoctors(filters);

  const [isCreateOpen, setCreateOpen] = useState(false);
  const { searchKey, searchDefaultValue, resetSearch } = useSearchSeed(filters.search);

  const activeFilterCount = [
    filters.specialization,
    filters.hospital,
    filters.from ?? filters.to,
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0 || Boolean(filters.search);

  const handleSearch = useCallback(
    (search: string) => setFilters({ search: search || undefined }),
    [setFilters],
  );

  // New page = new list: start reading from the top (filter changes keep their position).
  const goToPage = (page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = useCallback(() => {
    setFilters(CLEARED_FILTERS);
    resetSearch();
  }, [resetSearch, setFilters]);

  useClampPage({
    page: filters.page,
    totalPages: data?.meta.totalPages,
    isPlaceholderData,
    setPage,
  });

  const emptyState = hasActiveFilters ? (
    <EmptyState
      icon={SearchX}
      title="No doctors match your filters"
      description="Try a different search or remove some filters."
      action={
        <Button variant="outline" onClick={clearFilters}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Stethoscope}
      title="No doctors yet"
      description="Add your first doctor to start tracking their patients."
      action={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden="true" />
          Add doctor
        </Button>
      }
    />
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader
        title="Doctors"
        description="Search, filter and manage the doctors in your network."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus aria-hidden="true" />
            Add doctor
          </Button>
        }
      />

      <FilterBar
        search={
          <SearchInput
            key={searchKey}
            defaultValue={searchDefaultValue}
            onSearch={handleSearch}
            placeholder="Search name or hospital"
            aria-label="Search doctors by name or hospital"
          />
        }
        activeCount={activeFilterCount}
        onClear={hasActiveFilters ? clearFilters : undefined}
      >
        <DoctorFilters filters={filters} onChange={setFilters} />
      </FilterBar>

      {isError && !data ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load doctors"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <DoctorsTable
            doctors={data?.items}
            isLoading={isLoading}
            isFetching={isFetching}
            skeletonRows={filters.limit}
            emptyState={emptyState}
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

      <CreateDoctorDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

export function DoctorsViewSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true">
      <div className="flex items-end justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-9 w-full md:w-2/3" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
