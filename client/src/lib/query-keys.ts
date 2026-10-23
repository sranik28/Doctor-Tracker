import type { DoctorListFilters } from '@/schemas/doctor.schema';

export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (filters: DoctorListFilters) => [...doctorKeys.lists(), filters] as const,
  filterOptions: () => [...doctorKeys.all, 'filter-options'] as const,
};
