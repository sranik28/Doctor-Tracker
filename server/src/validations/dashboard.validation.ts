import { z } from 'zod';

export const TIMELINE_RANGES = ['7d', '30d', '12m'] as const;
export type TimelineRange = (typeof TIMELINE_RANGES)[number];

const limitParam = (defaultLimit: number, max: number) =>
  z.coerce
    .number()
    .int()
    .min(1, 'limit must be at least 1')
    .max(max, `limit must be at most ${max}`)
    .default(defaultLimit);

export const patientsPerDoctorQuerySchema = z.object({ limit: limitParam(10, 50) });

export const timelineQuerySchema = z.object({
  range: z.enum(TIMELINE_RANGES, { error: 'range must be 7d, 30d or 12m' }).default('30d'),
});

export const recentPatientsQuerySchema = z.object({ limit: limitParam(5, 20) });

export type PatientsPerDoctorQuery = z.output<typeof patientsPerDoctorQuerySchema>;
export type TimelineQuery = z.output<typeof timelineQuerySchema>;
export type RecentPatientsQuery = z.output<typeof recentPatientsQuerySchema>;
