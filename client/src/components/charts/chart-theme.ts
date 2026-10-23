/** Shared Recharts styling, so every chart has the same recessive axes and grid. */
export const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 12 } as const;
export const GRID_STROKE = 'var(--border)';
export const CHART_SURFACE = 'var(--card)';

/** Categorical series slot (1-8) as a CSS variable. */
export const seriesColor = (slot: number): string => `var(--chart-${slot})`;

/** Entities keep their color across the whole dashboard. */
export const PATIENTS_COLOR = seriesColor(1);
export const DOCTORS_COLOR = seriesColor(7);
export const OTHER_COLOR = 'var(--chart-other)';
