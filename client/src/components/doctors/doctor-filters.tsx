'use client';

import { DateRangePicker } from '@/components/shared/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDoctorFilterOptions } from '@/hooks/use-doctors';
import {
  DOCTOR_SORT_OPTIONS,
  type DoctorListFilters,
  type DoctorSort,
} from '@/schemas/doctor.schema';

const ALL = '__all__';

interface OptionSelectProps {
  label: string;
  allLabel: string;
  value: string | undefined;
  options: readonly string[];
  isLoading: boolean;
  onChange: (value: string | undefined) => void;
}

function OptionSelect({ label, allLabel, value, options, isLoading, onChange }: OptionSelectProps) {
  // Keep a value from a shared link selectable even if it's not in the current options.
  const items = value && !options.includes(value) ? [value, ...options] : options;

  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === ALL ? undefined : next)}
      disabled={isLoading && !value}
    >
      <SelectTrigger className="w-full md:w-44" aria-label={label}>
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {items.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface DoctorFiltersProps {
  filters: DoctorListFilters;
  onChange: (patch: Partial<DoctorListFilters>) => void;
}

export function DoctorFilters({ filters, onChange }: DoctorFiltersProps) {
  const { data: options, isLoading } = useDoctorFilterOptions();

  return (
    <>
      <OptionSelect
        label="Specialization"
        allLabel="All specializations"
        value={filters.specialization}
        options={options?.specializations ?? []}
        isLoading={isLoading}
        onChange={(specialization) => onChange({ specialization })}
      />
      <OptionSelect
        label="Hospital"
        allLabel="All hospitals"
        value={filters.hospital}
        options={options?.hospitals ?? []}
        isLoading={isLoading}
        onChange={(hospital) => onChange({ hospital })}
      />
      <DateRangePicker
        value={{ from: filters.from, to: filters.to }}
        onChange={({ from, to }) => onChange({ from, to })}
        placeholder="Created date"
        className="w-full md:w-60"
      />
      <Select value={filters.sort} onValueChange={(sort) => onChange({ sort: sort as DoctorSort })}>
        <SelectTrigger className="w-full md:w-40" aria-label="Sort by">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DOCTOR_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
