import { format, parseISO } from 'date-fns';

const numberFormat = new Intl.NumberFormat('en-US');
const compactFormat = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const percentFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

/** 1501 -> "1,501" */
export const formatNumber = (value: number): string => numberFormat.format(value);

/** 1500 -> "1.5K" (axis ticks, tight spaces) */
export const formatCompact = (value: number): string => compactFormat.format(value);

/** 12.34 -> "12.3%" */
export const formatPercent = (value: number): string => `${percentFormat.format(value)}%`;

/** Share of a total as a whole-number percent, "0%" when the total is 0. */
export const formatShare = (part: number, total: number): string =>
  total === 0 ? '0%' : `${Math.round((part / total) * 100)}%`;

/** "2026-10-24T09:00:00Z" -> "24 Oct 2026" */
export const formatDate = (iso: string): string => format(parseISO(iso), 'd MMM yyyy');

/** "female" -> "Female" */
export const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);
