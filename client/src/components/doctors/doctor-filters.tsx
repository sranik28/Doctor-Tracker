'use client';

import { DateRangePicker } from '@/components/shared/date-range-picker';
import { FilterSelect, toFilterOptions } from '@/components/shared/filter-select';
import { useDoctorFilterOptions } from '@/hooks/use-doctors';
import {
  DOCTOR_SORT_OPTIONS,
  type DoctorListFilters,
  type DoctorSort,
} from '@/schemas/doctor.schema';

interface DoctorFiltersProps {
  filters: DoctorListFilters;
  onChange: (patch: Partial<DoctorListFilters>) => void;
}

export function DoctorFilters({ filters, onChange }: DoctorFiltersProps) {
  const { data: options, isLoading } = useDoctorFilterOptions();

  return (
    <>
      <FilterSelect
        label="Specialization"
        allLabel="All specializations"
        value={filters.specialization}
        options={toFilterOptions(options?.specializations ?? [])}
        isLoading={isLoading}
        onChange={(specialization) => onChange({ specialization })}
      />
      <DateRangePicker
        value={{ from: filters.from, to: filters.to }}
        onChange={({ from, to }) => onChange({ from, to })}
        placeholder="Created date"
        className="w-full md:w-60"
      />
      <FilterSelect
        label="Sort by"
        value={filters.sort}
        options={DOCTOR_SORT_OPTIONS}
        onChange={(sort) => sort && onChange({ sort: sort as DoctorSort })}
        className="md:w-40"
      />
    </>
  );
}
