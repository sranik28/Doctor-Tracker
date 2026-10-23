'use client';

import { format, parseISO } from 'date-fns';
import { useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';

import { ChartTooltip } from '@/components/shared/chart-tooltip';
import { formatCompact, formatNumber } from '@/lib/format';
import type { TimelinePoint } from '@/types/dashboard';

import { ChartDataTable } from './chart-data-table';
import { AXIS_TICK, CHART_SURFACE, GRID_STROKE, PATIENTS_COLOR } from './chart-theme';

interface TimelineAreaChartProps {
  data: readonly TimelinePoint[];
  /** Dims the chart while the next range is loading. */
  isUpdating?: boolean;
}

// The date's own shape decides the format ("2026-10" = a month, "2026-10-24" = a day). While a new
// range loads, the previous points stay on screen; reading the shape from the data (not from the
// selected range) keeps their labels correct during that moment.
const isMonthlyDate = (date: string) => date.length === 7;

const tickLabel = (date: string) =>
  format(parseISO(date), isMonthlyDate(date) ? 'MMM yy' : 'd MMM');

const fullLabel = (date: string) =>
  format(parseISO(date), isMonthlyDate(date) ? 'MMMM yyyy' : 'EEEE, d MMMM yyyy');

export function TimelineAreaChart({ data, isUpdating = false }: TimelineAreaChartProps) {
  const gradientId = useId();
  const total = data.reduce((sum, point) => sum + point.count, 0);

  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const point = payload[0]?.payload as TimelinePoint | undefined;
    if (!active || !point) return null;
    return (
      <ChartTooltip
        title={fullLabel(point.date)}
        rows={[
          { color: PATIENTS_COLOR, label: 'Patients admitted', value: formatNumber(point.count) },
        ]}
      />
    );
  };

  return (
    <div
      className={isUpdating ? 'opacity-60 transition-opacity' : 'transition-opacity'}
      role="img"
      aria-label={`Patients admitted over time: ${formatNumber(total)} in total across ${data.length} ${isMonthlyDate(data[0]?.date ?? '') ? 'months' : 'days'}.`}
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={[...data]}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          accessibilityLayer={false}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PATIENTS_COLOR} stopOpacity={0.28} />
              <stop offset="100%" stopColor={PATIENTS_COLOR} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={tickLabel}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: GRID_STROKE }}
            interval="preserveStartEnd"
            minTickGap={isMonthlyDate(data[0]?.date ?? '') ? 16 : 28}
            tickMargin={8}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={formatCompact}
            width={36}
          />
          <Tooltip
            content={renderTooltip}
            cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={PATIENTS_COLOR}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 5, fill: PATIENTS_COLOR, stroke: CHART_SURFACE, strokeWidth: 2 }}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <ChartDataTable
        caption="Patients admitted over time"
        columns={['Date', 'Patients']}
        rows={data.map((point) => [fullLabel(point.date), formatNumber(point.count)])}
      />
    </div>
  );
}
