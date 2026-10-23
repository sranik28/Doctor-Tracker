import { z } from 'zod';

import { optionalQueryString } from './common.validation.js';

export const TIMELINE_RANGES = ['7d', '30d', '12m'] as const;
export type TimelineRange = (typeof TIMELINE_RANGES)[number];

const limitParam = (defaultLimit: number, max: number) =>
  z.coerce
    .number()
    .int()
    .min(1, 'limit must be at least 1')
    .max(max, `limit must be at most ${max}`)
    .default(defaultLimit);

/** Optional hospital scope shared by every dashboard endpoint (blank = all hospitals). */
const hospitalParam = optionalQueryString(150);

export const scopeQuerySchema = z.object({ hospital: hospitalParam });

export const patientsPerDoctorQuerySchema = z.object({
  limit: limitParam(10, 50),
  hospital: hospitalParam,
});

export const timelineQuerySchema = z.object({
  range: z.enum(TIMELINE_RANGES, { error: 'range must be 7d, 30d or 12m' }).default('30d'),
  hospital: hospitalParam,
});

export const recentPatientsQuerySchema = z.object({
  limit: limitParam(5, 20),
  hospital: hospitalParam,
});

export type ScopeQuery = z.output<typeof scopeQuerySchema>;
export type PatientsPerDoctorQuery = z.output<typeof patientsPerDoctorQuerySchema>;
export type TimelineQuery = z.output<typeof timelineQuerySchema>;
export type RecentPatientsQuery = z.output<typeof recentPatientsQuerySchema>;
