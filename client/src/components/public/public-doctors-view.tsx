'use client';

import { AlertTriangle, SearchX } from 'lucide-react';
import { useCallback } from 'react';

import { EmptyState } from '@/components/shared/empty-state';
import { FilterBar } from '@/components/shared/filter-bar';
import { FilterSelect, toFilterOptions } from '@/components/shared/filter-select';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useClampPage } from '@/hooks/use-clamp-page';
import { usePublicDoctors, usePublicFilterOptions } from '@/hooks/use-public-doctors';
import { useSearchSeed } from '@/hooks/use-search-seed';
import { useUrlFilters } from '@/hooks/use-url-filters';
import {
  PUBLIC_DOCTOR_SORT_OPTIONS,
  PUBLIC_PAGE_SIZE,
  type PublicDoctorSort,
  publicDoctorFiltersSchema,
} from '@/schemas/public-doctor.schema';

import { PublicDoctorCard, PublicDoctorCardSkeleton } from './public-doctor-card';

const CLEARED_FILTERS = { search: undefined, specialization: undefined, hospital: undefined };

export function PublicDoctorsView() {
  const { filters, setFilters, setPage } = useUrlFilters(publicDoctorFiltersSchema);
  const { data, isLoading, isFetching, isError, isPlaceholderData, refetch } =
    usePublicDoctors(filters);
  const { data: options, isLoading: isLoadingOptions } = usePublicFilterOptions();
  const { searchKey, searchDefaultValue, resetSearch } = useSearchSeed(filters.search);

  const activeFilterCount = [filters.specialization, filters.hospital].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0 || Boolean(filters.search);

  const handleSearch = useCallback(
    (search: string) => setFilters({ search: search || undefined }),
    [setFilters],
  );

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

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Find a doctor</h1>
        <p className="text-muted-foreground">
          Search by name or hospital, or narrow down by specialization.
        </p>
      </div>

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
        <FilterSelect
          label="Specialization"
          allLabel="All specializations"
          value={filters.specialization}
          options={toFilterOptions(options?.specializations ?? [])}
          isLoading={isLoadingOptions}
          onChange={(specialization) => setFilters({ specialization })}
        />
        <FilterSelect
          label="Hospital"
          allLabel="All hospitals"
          value={filters.hospital}
          options={toFilterOptions(options?.hospitals ?? [])}
          isLoading={isLoadingOptions}
          onChange={(hospital) => setFilters({ hospital })}
        />
        <FilterSelect
          label="Sort by"
          value={filters.sort}
          options={PUBLIC_DOCTOR_SORT_OPTIONS}
          onChange={(sort) => sort && setFilters({ sort: sort as PublicDoctorSort })}
          className="md:w-40"
        />
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
        <div className="grid gap-6">
          {isLoading ? (
            <DoctorGridSkeleton />
          ) : data && data.items.length > 0 ? (
            <ul
              className="grid gap-4 data-[fetching=true]:opacity-60 sm:grid-cols-2 lg:grid-cols-3"
              data-fetching={isFetching}
              aria-label="Doctors"
            >
              {data.items.map((doctor) => (
                <li key={doctor._id} className="grid">
                  <PublicDoctorCard doctor={doctor} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={SearchX}
              title="No doctors found"
              description="Try a different search or remove some filters."
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          )}

          {data && (
            <Pagination
              page={data.meta.page}
              limit={data.meta.limit}
              total={data.meta.total}
              totalPages={data.meta.totalPages}
              onPageChange={goToPage}
              onLimitChange={() => undefined}
              showPageSize={false}
            />
          )}
        </div>
      )}
    </div>
  );
}

function DoctorGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: PUBLIC_PAGE_SIZE }, (_, index) => (
        <PublicDoctorCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PublicDoctorsViewSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6" aria-busy="true">
      <div className="grid gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-full md:w-2/3" />
      <DoctorGridSkeleton />
    </div>
  );
}
