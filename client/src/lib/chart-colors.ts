import { OTHER_COLOR, seriesColor } from '@/components/charts/chart-theme';

// Known conditions are pinned to a slot, so "Asthma" is the same color on every load.
const PINNED_CONDITIONS = [
  'Hypertension',
  'Diabetes',
  'Asthma',
  'Migraine',
  'Arthritis',
  'Bronchitis',
] as const;
const SLOT_COUNT = 8;
export const OTHER_LABEL = 'Other';

/**
 * Color per condition: the entity decides the color, never its rank. Pinned conditions keep
 * their slot; any other condition takes the lowest slot nobody present is using. "Other" is
 * always the neutral grey, so a rollup never looks like a real category.
 */
export const assignConditionColors = (conditions: readonly string[]): Map<string, string> => {
  const colors = new Map<string, string>();
  const usedSlots = new Set<number>();

  conditions.forEach((condition) => {
    const slot = PINNED_CONDITIONS.findIndex(
      (pinned) => pinned.toLowerCase() === condition.toLowerCase(),
    );
    if (slot >= 0) {
      colors.set(condition, seriesColor(slot + 1));
      usedSlots.add(slot + 1);
    }
  });

  let nextSlot = 1;
  conditions.forEach((condition) => {
    if (condition === OTHER_LABEL) {
      colors.set(condition, OTHER_COLOR);
      return;
    }
    if (colors.has(condition)) return;
    while (usedSlots.has(nextSlot) && nextSlot <= SLOT_COUNT) nextSlot += 1;
    colors.set(condition, seriesColor(Math.min(nextSlot, SLOT_COUNT)));
    usedSlots.add(nextSlot);
  });

  return colors;
};
