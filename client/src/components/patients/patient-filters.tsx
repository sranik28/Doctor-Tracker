'use client';

import { DateRangePicker } from '@/components/shared/date-range-picker';
import { FilterSelect, toFilterOptions } from '@/components/shared/filter-select';
import { useDoctor } from '@/hooks/use-doctor';
import { useDoctorOptions } from '@/hooks/use-doctors';
import { usePatientFilterOptions } from '@/hooks/use-patients';
import {
  PATIENT_GENDER_OPTIONS,
  PATIENT_SORT_OPTIONS,
  type PatientSort,
  type PatientsPageFilters,
} from '@/schemas/patient.schema';

interface PatientFiltersProps {
  filters: PatientsPageFilters;
  onChange: (patch: Partial<PatientsPageFilters>) => void;
}

export function PatientFilters({ filters, onChange }: PatientFiltersProps) {
  const { data: conditionOptions, isLoading: isLoadingConditions } = usePatientFilterOptions();
  const { data: doctors, isLoading: isLoadingDoctors } = useDoctorOptions();

  // A doctor from a shared link may be outside the first 50 options: fetch it for its name.
  const selectedDoctorMissing =
    Boolean(filters.doctorId) && !doctors?.some((doctor) => doctor._id === filters.doctorId);
  const { data: selectedDoctor } = useDoctor(
    filters.doctorId ?? '',
    selectedDoctorMissing && !isLoadingDoctors,
  );

  const doctorOptions = [
    ...(selectedDoctorMissing && selectedDoctor
      ? [{ value: selectedDoctor._id, label: selectedDoctor.name }]
      : []),
    ...(doctors ?? []).map((doctor) => ({ value: doctor._id, label: doctor.name })),
  ];

  return (
    <>
      <FilterSelect
        label="Condition"
        allLabel="All conditions"
        value={filters.condition}
        options={toFilterOptions(conditionOptions?.conditions ?? [])}
        isLoading={isLoadingConditions}
        onChange={(condition) => onChange({ condition })}
      />
      <FilterSelect
        label="Doctor"
        allLabel="All doctors"
        value={filters.doctorId}
        options={doctorOptions}
        isLoading={isLoadingDoctors}
        onChange={(doctorId) => onChange({ doctorId })}
      />
      <FilterSelect
        label="Gender"
        allLabel="All genders"
        value={filters.gender}
        options={PATIENT_GENDER_OPTIONS}
        onChange={(gender) => onChange({ gender: gender as PatientsPageFilters['gender'] })}
        className="md:w-36"
      />
      <DateRangePicker
        value={{ from: filters.from, to: filters.to }}
        onChange={({ from, to }) => onChange({ from, to })}
        placeholder="Admitted date"
        className="w-full md:w-60"
      />
      <FilterSelect
        label="Sort by"
        value={filters.sort}
        options={PATIENT_SORT_OPTIONS}
        onChange={(sort) => sort && onChange({ sort: sort as PatientSort })}
        className="md:w-40"
      />
    </>
  );
}
