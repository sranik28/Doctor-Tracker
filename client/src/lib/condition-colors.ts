// Fixed colors per condition so a badge means the same thing on every page.
// Keys are lowercase; lookups are case-insensitive. Unlisted conditions stay neutral.
const CONDITION_COLORS: Record<string, string> = {
  hypertension:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
  diabetes:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  asthma:
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
  migraine:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300',
  arthritis:
    'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300',
  bronchitis:
    'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300',
};

/** Badge classes for a condition, or undefined for the neutral outline style. */
export const getConditionColor = (condition: string): string | undefined =>
  CONDITION_COLORS[condition.trim().toLowerCase()];
