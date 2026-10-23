export const DASHBOARD_TIMEZONE = 'Asia/Dhaka';

// Bangladesh has been on a fixed UTC+6 since 2009 (no daylight saving), so plain offset
// arithmetic is exact. MongoDB still receives the zone name for $dateToString.
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Shifts an instant so its UTC fields read as Dhaka wall-clock time. */
const toDhakaWallClock = (date: Date): Date => new Date(date.getTime() + DHAKA_OFFSET_MS);

/** Real instant of a Dhaka wall-clock time given as UTC fields. */
const fromDhakaWallClock = (wallClock: Date): Date =>
  new Date(wallClock.getTime() - DHAKA_OFFSET_MS);

export const startOfDhakaDay = (date: Date): Date => {
  const wall = toDhakaWallClock(date);
  return fromDhakaWallClock(
    new Date(Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth(), wall.getUTCDate())),
  );
};

/** First instant of the Dhaka month that is `monthsAgo` months before `date`'s month. */
export const startOfDhakaMonth = (date: Date, monthsAgo = 0): Date => {
  const wall = toDhakaWallClock(date);
  return fromDhakaWallClock(
    new Date(Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth() - monthsAgo, 1)),
  );
};

const pad = (value: number): string => String(value).padStart(2, '0');

/** "2026-10-24" for the Dhaka day containing `date`. */
export const dhakaDayKey = (date: Date): string => {
  const wall = toDhakaWallClock(date);
  return `${wall.getUTCFullYear()}-${pad(wall.getUTCMonth() + 1)}-${pad(wall.getUTCDate())}`;
};

/** "2026-10" for the Dhaka month containing `date`. */
export const dhakaMonthKey = (date: Date): string => dhakaDayKey(date).slice(0, 7);

/** Dhaka-day keys for the last `days` days, oldest first, ending with today. */
export const lastDhakaDayKeys = (days: number, now: Date): string[] => {
  const today = startOfDhakaDay(now);
  return Array.from({ length: days }, (_, index) =>
    dhakaDayKey(new Date(today.getTime() - (days - 1 - index) * DAY_MS)),
  );
};

/** Dhaka-month keys for the last `months` months, oldest first, ending with this month. */
export const lastDhakaMonthKeys = (months: number, now: Date): string[] =>
  Array.from({ length: months }, (_, index) =>
    dhakaMonthKey(startOfDhakaMonth(now, months - 1 - index)),
  );
