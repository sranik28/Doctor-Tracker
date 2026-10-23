import { z } from 'zod';

import { PATIENT_GENDERS } from '../models/patient.model.js';
import {
  isoDateSchema,
  objectIdSchema,
  optionalQueryString,
  paginationQueryShape,
  phoneSchema,
  requiredText,
} from './common.validation.js';

export const listDoctorPatientsQuerySchema = z.object({
  ...paginationQueryShape,
  search: optionalQueryString(100),
});

export const createPatientSchema = z.object({
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
});

export const doctorPatientParamsSchema = z.object({
  id: objectIdSchema,
  patientId: objectIdSchema,
});

export type ListDoctorPatientsQuery = z.output<typeof listDoctorPatientsQuerySchema>;
export type CreatePatientInput = z.output<typeof createPatientSchema>;
