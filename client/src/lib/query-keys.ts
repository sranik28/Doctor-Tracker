import type { DoctorListFilters } from '@/schemas/doctor.schema';
import type { PatientListFilters } from '@/schemas/patient.schema';

// Hierarchical keys: invalidating a prefix (e.g. detail(id)) also covers everything below it.
export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (filters: DoctorListFilters) => [...doctorKeys.lists(), filters] as const,
  filterOptions: () => [...doctorKeys.all, 'filter-options'] as const,
  detail: (id: string) => [...doctorKeys.all, 'detail', id] as const,
  patients: (id: string) => [...doctorKeys.detail(id), 'patients'] as const,
  patientList: (id: string, filters: PatientListFilters) =>
    [...doctorKeys.patients(id), filters] as const,
};
