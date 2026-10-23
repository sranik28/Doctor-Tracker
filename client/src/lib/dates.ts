import { endOfDay, format, parseISO, startOfDay } from 'date-fns';

/**
 * URL filters keep plain "YYYY-MM-DD" dates; the API gets the user's local day boundaries
 * as ISO datetimes, so "1 March" means 1 March here, not in UTC.
 */
export const toApiDateRange = (from: string | undefined, to: string | undefined) => ({
  from: from ? startOfDay(parseISO(from)).toISOString() : undefined,
  to: to ? endOfDay(parseISO(to)).toISOString() : undefined,
});

/** A picked calendar day as local noon, so the stored date survives any UTC offset. */
export const toLocalNoonIso = (date: Date): string =>
  new Date(`${format(date, 'yyyy-MM-dd')}T12:00:00`).toISOString();
