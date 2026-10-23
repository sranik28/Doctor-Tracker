import { z } from 'zod';

export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 50;

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const END_OF_DAY_MS = 24 * 60 * 60 * 1000 - 1;

export const objectIdSchema = z.string().regex(OBJECT_ID_PATTERN, 'Must be a valid id');

export const paginationQueryShape = {
  page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'limit must be at least 1')
    .max(MAX_PAGE_LIMIT, `limit must be at most ${MAX_PAGE_LIMIT}`)
    .default(DEFAULT_PAGE_LIMIT),
};

/** Optional query string: blank values count as "not provided". */
export const optionalQueryString = (maxLength: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(maxLength).optional(),
  );

export const requiredText = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

export const phoneSchema = z
  .string({ error: 'Phone is required' })
  .trim()
  .regex(/^\+?[\d\s\-()]{7,20}$/, { error: 'Enter a valid phone number', abort: true })
  .refine((phone) => phone.replace(/\D/g, '').length >= 7, 'Enter a valid phone number');

export const emailSchema = z
  .string({ error: 'Email is required' })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Enter a valid email address' }));

/** Accepts "YYYY-MM-DD" or a full ISO datetime with offset. */
export const isoDateSchema = z.union([z.iso.date(), z.iso.datetime({ offset: true })], {
  error: 'Must be an ISO date (YYYY-MM-DD) or datetime',
});

const optionalIsoDate = z.preprocess(
  (value) => (value === '' ? undefined : value),
  isoDateSchema.optional(),
);

/**
 * from/to query params as Dates. A date-only `to` means "through the end of that day";
 * clients wanting local-day boundaries send full datetimes instead.
 */
export const dateRangeQueryShape = {
  from: optionalIsoDate.transform((value) => (value ? new Date(value) : undefined)),
  to: optionalIsoDate.transform((value) => {
    if (!value) return undefined;
    const date = new Date(value);
    return DATE_ONLY_PATTERN.test(value) ? new Date(date.getTime() + END_OF_DAY_MS) : date;
  }),
};

export const isValidDateRange = ({
  from,
  to,
}: {
  from?: Date | undefined;
  to?: Date | undefined;
}) => !from || !to || from <= to;

export const INVALID_DATE_RANGE = { path: ['to'], message: '"to" must be on or after "from"' };
