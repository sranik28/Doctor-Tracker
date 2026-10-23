import { z } from 'zod';

import { optionalParam, pageParam } from './common.schema';

export const PUBLIC_PAGE_SIZE = 12;

export const PUBLIC_DOCTOR_SORT_OPTIONS = [
  { value: 'name', label: 'Name A–Z' },
  { value: '-name', label: 'Name Z–A' },
  { value: '-createdAt', label: 'Recently joined' },
] as const;

export type PublicDoctorSort = (typeof PUBLIC_DOCTOR_SORT_OPTIONS)[number]['value'];

const SORT_VALUES = PUBLIC_DOCTOR_SORT_OPTIONS.map((option) => option.value) as [
  PublicDoctorSort,
  ...PublicDoctorSort[],
];

/** Public directory filters as read from the URL; every field falls back instead of failing. */
export const publicDoctorFiltersSchema = z.object({
  page: pageParam,
  search: optionalParam(100),
  specialization: optionalParam(100),
  hospital: optionalParam(150),
  sort: z.enum(SORT_VALUES).catch('name'),
});

export type PublicDoctorFilters = z.output<typeof publicDoctorFiltersSchema>;
