import { z } from 'zod';

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

export const requiredText = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone is required')
  .regex(/^\+?[\d\s\-()]{7,20}$/, { error: 'Enter a valid phone number', abort: true })
  .refine((phone) => phone.replace(/\D/g, '').length >= 7, 'Enter a valid phone number');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .pipe(z.email({ error: 'Enter a valid email address' }));

// ---- URL params: every field falls back instead of failing ----

export const pageParam = z.coerce.number().int().min(1).catch(1);

export const limitParam = z.coerce
  .number()
  .refine((limit) => PAGE_SIZE_OPTIONS.some((option) => option === limit))
  .catch(DEFAULT_PAGE_SIZE);

/** Optional text param: blank or invalid values become "not set". */
export const optionalParam = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => value || undefined)
    .catch(undefined);

export const optionalDateParam = z.iso.date().optional().catch(undefined);

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export const optionalObjectIdParam = z
  .string()
  .regex(OBJECT_ID_PATTERN)
  .optional()
  .catch(undefined);

export const isObjectId = (value: string | undefined): value is string =>
  value !== undefined && OBJECT_ID_PATTERN.test(value);
