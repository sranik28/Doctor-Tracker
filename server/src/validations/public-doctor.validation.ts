import { z } from 'zod';

import { objectIdSchema, optionalQueryString } from './common.validation.js';

export const PUBLIC_DEFAULT_LIMIT = 12;
export const PUBLIC_MAX_LIMIT = 24;

export const PUBLIC_DOCTOR_SORT_OPTIONS = ['name', '-name', '-createdAt'] as const;
export type PublicDoctorSort = (typeof PUBLIC_DOCTOR_SORT_OPTIONS)[number];

export const listPublicDoctorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'limit must be at least 1')
    .max(PUBLIC_MAX_LIMIT, `limit must be at most ${PUBLIC_MAX_LIMIT}`)
    .default(PUBLIC_DEFAULT_LIMIT),
  search: optionalQueryString(100),
  specialization: optionalQueryString(100),
  hospital: optionalQueryString(150),
  sort: z.enum(PUBLIC_DOCTOR_SORT_OPTIONS).default('name'),
});

export const publicDoctorIdParamsSchema = z.object({ id: objectIdSchema });

export type ListPublicDoctorsQuery = z.output<typeof listPublicDoctorsQuerySchema>;
