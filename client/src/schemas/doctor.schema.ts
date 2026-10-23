import { z } from 'zod';

import {
  emailSchema,
  limitParam,
  optionalDateParam,
  optionalParam,
  pageParam,
  requiredText,
} from './common.schema';
import { phoneSchema } from './phone.schema';

export const DOCTOR_SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: '-name', label: 'Name Z–A' },
] as const;

export type DoctorSort = (typeof DOCTOR_SORT_OPTIONS)[number]['value'];

const SORT_VALUES = DOCTOR_SORT_OPTIONS.map((option) => option.value) as [
  DoctorSort,
  ...DoctorSort[],
];

// Same rules as the API, so most mistakes are caught before a round trip.
export const createDoctorSchema = z.object({
  name: requiredText('Name', 2, 100),
  specialization: requiredText('Specialization', 2, 100),
  hospital: requiredText('Hospital', 2, 150),
  phone: phoneSchema,
  email: emailSchema,
});

export type CreateDoctorValues = z.infer<typeof createDoctorSchema>;

/**
 * Doctor list filters as read from the URL. Every field falls back to its default
 * instead of failing, so a hand-edited or stale link still renders a sensible view.
 */
export const doctorListFiltersSchema = z
  .object({
    page: pageParam,
    limit: limitParam,
    search: optionalParam(100),
    specialization: optionalParam(100),
    from: optionalDateParam,
    to: optionalDateParam,
    sort: z.enum(SORT_VALUES).catch('-createdAt'),
  })
  .transform((filters) =>
    filters.from && filters.to && filters.from > filters.to
      ? { ...filters, to: undefined }
      : filters,
  );

export type DoctorListFilters = z.output<typeof doctorListFiltersSchema>;
