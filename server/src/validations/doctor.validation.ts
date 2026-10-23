import { z } from 'zod';

import {
  dateRangeQueryShape,
  emailSchema,
  INVALID_DATE_RANGE,
  isValidDateRange,
  objectIdSchema,
  optionalQueryString,
  paginationQueryShape,
  phoneSchema,
  requiredText,
} from './common.validation.js';

export const DOCTOR_SORT_OPTIONS = ['createdAt', '-createdAt', 'name', '-name'] as const;
export type DoctorSort = (typeof DOCTOR_SORT_OPTIONS)[number];

export const listDoctorsQuerySchema = z
  .object({
    ...paginationQueryShape,
    search: optionalQueryString(100),
    specialization: optionalQueryString(100),
    hospital: optionalQueryString(150),
    ...dateRangeQueryShape,
    sort: z.enum(DOCTOR_SORT_OPTIONS).default('-createdAt'),
  })
  .refine(isValidDateRange, INVALID_DATE_RANGE);

export const createDoctorSchema = z.object({
  name: requiredText('Name', 2, 100),
  specialization: requiredText('Specialization', 2, 100),
  hospital: requiredText('Hospital', 2, 150),
  phone: phoneSchema,
  email: emailSchema,
});

export const doctorIdParamsSchema = z.object({ id: objectIdSchema });

export type ListDoctorsQuery = z.output<typeof listDoctorsQuerySchema>;
export type CreateDoctorInput = z.output<typeof createDoctorSchema>;
