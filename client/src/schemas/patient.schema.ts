import { endOfDay } from 'date-fns';
import { z } from 'zod';

import type { PatientGender } from '@/types/patient';

import { limitParam, optionalParam, pageParam, phoneSchema, requiredText } from './common.schema';

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
