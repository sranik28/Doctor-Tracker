import { endOfDay } from 'date-fns';
import { z } from 'zod';

import type { PatientGender } from '@/types/patient';

import {
  limitParam,
  optionalDateParam,
  optionalObjectIdParam,
  optionalParam,
  pageParam,
  phoneSchema,
  requiredText,
} from './common.schema';

export const PATIENT_GENDER_OPTIONS: readonly { value: PatientGender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

export const addPatientSchema = z.object({
  name: requiredText('Name', 2, 100),
  age: z
    .number({ error: 'Age is required' })
    .int('Age must be a whole number')
    .min(1, 'Age must be between 1 and 120')
    .max(120, 'Age must be between 1 and 120'),
  gender: z.enum(['male', 'female', 'other'], { error: 'Select a gender' }),
  phone: phoneSchema,
  condition: requiredText('Condition', 2, 150),
  admittedAt: z
    .date({ error: 'Admission date is required' })
    .refine((date) => date <= endOfDay(new Date()), 'Admission date cannot be in the future'),
  notes: z.string().trim().max(2000, 'Notes must be at most 2000 characters'),
});

export type AddPatientValues = z.infer<typeof addPatientSchema>;

/** Patients list filters as read from the URL (falls back to defaults on bad values). */
export const patientListFiltersSchema = z.object({
  page: pageParam,
  limit: limitParam,
  search: optionalParam(100),
});

export type PatientListFilters = z.output<typeof patientListFiltersSchema>;

/** Edit = the add fields plus reassignment to another doctor. */
export const editPatientSchema = addPatientSchema.extend({
  doctorId: z.string().min(1, 'Select a doctor'),
});

export type EditPatientValues = z.infer<typeof editPatientSchema>;

export const PATIENT_SORT_OPTIONS = [
  { value: '-admittedAt', label: 'Newest admitted' },
  { value: 'admittedAt', label: 'Oldest admitted' },
  { value: 'name', label: 'Name A–Z' },
  { value: '-name', label: 'Name Z–A' },
  { value: 'age', label: 'Youngest first' },
  { value: '-age', label: 'Oldest first' },
] as const;

export type PatientSort = (typeof PATIENT_SORT_OPTIONS)[number]['value'];

const PATIENT_SORT_VALUES = PATIENT_SORT_OPTIONS.map((option) => option.value) as [
  PatientSort,
  ...PatientSort[],
];

/** Patients page filters as read from the URL (falls back to defaults on bad values). */
export const patientsPageFiltersSchema = z
  .object({
    page: pageParam,
    limit: limitParam,
    search: optionalParam(100),
    condition: optionalParam(150),
    doctorId: optionalObjectIdParam,
    gender: z.enum(['male', 'female', 'other']).optional().catch(undefined),
    from: optionalDateParam,
    to: optionalDateParam,
    sort: z.enum(PATIENT_SORT_VALUES).catch('-admittedAt'),
  })
  .transform((filters) =>
    filters.from && filters.to && filters.from > filters.to
      ? { ...filters, to: undefined }
      : filters,
  );

export type PatientsPageFilters = z.output<typeof patientsPageFiltersSchema>;
