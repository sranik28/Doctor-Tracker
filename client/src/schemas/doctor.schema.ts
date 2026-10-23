import { z } from 'zod';

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

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

const requiredText = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

// Same rules as the API, so most mistakes are caught before a round trip.
export const createDoctorSchema = z.object({
  name: requiredText('Name', 2, 100),
  specialization: requiredText('Specialization', 2, 100),
  hospital: requiredText('Hospital', 2, 150),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone is required')
    .regex(/^\+?[\d\s\-()]{7,20}$/, { error: 'Enter a valid phone number', abort: true })
    .refine((phone) => phone.replace(/\D/g, '').length >= 7, 'Enter a valid phone number'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .pipe(z.email({ error: 'Enter a valid email address' })),
});

export type CreateDoctorValues = z.infer<typeof createDoctorSchema>;

/** Optional text param: blank or invalid values become "not set". */
const optionalParam = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => value || undefined)
    .catch(undefined);

const optionalDateParam = z.iso.date().optional().catch(undefined);

/**
 * Doctor list filters as read from the URL. Every field falls back to its default
 * instead of failing, so a hand-edited or stale link still renders a sensible view.
 */
export const doctorListFiltersSchema = z
  .object({
    page: z.coerce.number().int().min(1).catch(1),
    limit: z.coerce
      .number()
      .refine((limit) => PAGE_SIZE_OPTIONS.some((option) => option === limit))
      .catch(DEFAULT_PAGE_SIZE),
    search: optionalParam(100),
    specialization: optionalParam(100),
    hospital: optionalParam(150),
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
