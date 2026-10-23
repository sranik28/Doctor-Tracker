const UNIT_TO_MS = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  y: 365.25 * 24 * 60 * 60 * 1000,
} as const;

type DurationUnit = keyof typeof UNIT_TO_MS;

const isDurationUnit = (unit: string): unit is DurationUnit => unit in UNIT_TO_MS;

/**
 * Converts a jsonwebtoken-style duration ("15m", "7d", "500") to milliseconds.
 * A bare number is treated as milliseconds, matching jsonwebtoken.
 */
export const durationToMs = (duration: string): number => {
  const match = /^(\d+)([a-z]*)$/.exec(duration);
  const amount = match?.[1];
  const unit = match?.[2] || 'ms';

  if (amount === undefined || !isDurationUnit(unit)) {
    throw new Error(`Invalid duration: "${duration}"`);
  }

  return Number(amount) * UNIT_TO_MS[unit];
};
