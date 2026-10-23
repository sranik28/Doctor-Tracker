import { z } from 'zod';

import { PATIENT_GENDERS } from '../models/patient.model.js';
import {
  dateRangeQueryShape,
  INVALID_DATE_RANGE,
  isoDateSchema,
  isValidDateRange,
  objectIdSchema,
  optionalQueryParam,
  optionalQueryString,
  paginationQueryShape,
  phoneSchema,
  requiredText,
} from './common.validation.js';

export const listDoctorPatientsQuerySchema = z.object({
  ...paginationQueryShape,
  search: optionalQueryString(100),
});

const patientFields = {
  name: requiredText('Name', 2, 100),
  age: z
    .number({ error: 'Age is required' })
    .int('Age must be a whole number')
    .min(0, 'Age must be 0 or more')
    .max(150, 'Age must be 150 or less'),
  gender: z.enum(PATIENT_GENDERS, { error: 'Gender must be male, female or other' }),
  phone: phoneSchema,
  condition: requiredText('Condition', 2, 150),
  admittedAt: isoDateSchema
    .transform((value) => new Date(value))
    .refine((date) => date.getTime() <= Date.now(), 'Admission date cannot be in the future')
    .optional(),
  notes: z.string().trim().max(2000, 'Notes must be at most 2000 characters').optional(),
};

export const createPatientSchema = z.object(patientFields);

/**
 * PATCH body: any subset of the patient fields plus doctorId (reassignment).
 * Strict, so _id, timestamps or typos are rejected instead of silently ignored.
 */
export const updatePatientSchema = z
  .strictObject({ ...patientFields, doctorId: objectIdSchema })
  .partial()
  .refine((input) => Object.values(input).some((value) => value !== undefined), {
    message: 'Provide at least one field to update',
    // Only when the body is otherwise valid, so `{ "foo": 1 }` reports just the unknown key.
    when: (payload) => payload.issues.length === 0,
  });

export const PATIENT_SORT_OPTIONS = [
  'admittedAt',
  '-admittedAt',
  'name',
  '-name',
  'age',
  '-age',
  'createdAt',
  '-createdAt',
] as const;
export type PatientSort = (typeof PATIENT_SORT_OPTIONS)[number];

export const listPatientsQuerySchema = z
  .object({
    ...paginationQueryShape,
    search: optionalQueryString(100),
    condition: optionalQueryString(150),
    doctorId: optionalQueryParam(objectIdSchema),
    gender: optionalQueryParam(
      z.enum(PATIENT_GENDERS, { error: 'gender must be male, female or other' }),
    ),
    // from/to filter on admittedAt.
    ...dateRangeQueryShape,
    sort: z.enum(PATIENT_SORT_OPTIONS).default('-admittedAt'),
  })
  .refine(isValidDateRange, INVALID_DATE_RANGE);

export const patientIdParamsSchema = z.object({ id: objectIdSchema });

export const doctorPatientParamsSchema = z.object({
  id: objectIdSchema,
  patientId: objectIdSchema,
});

export type ListDoctorPatientsQuery = z.output<typeof listDoctorPatientsQuerySchema>;
export type CreatePatientInput = z.output<typeof createPatientSchema>;
export type UpdatePatientInput = z.output<typeof updatePatientSchema>;
export type ListPatientsQuery = z.output<typeof listPatientsQuerySchema>;
