'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import { ChartTooltip } from '@/components/shared/chart-tooltip';
import { assignConditionColors } from '@/lib/chart-colors';
import { formatNumber, formatShare } from '@/lib/format';
import type { ConditionCount } from '@/types/dashboard';

import { ChartDataTable } from './chart-data-table';
import { CHART_SURFACE } from './chart-theme';

interface ConditionsDonutChartProps {
  data: readonly ConditionCount[];
}

export function ConditionsDonutChart({ data }: ConditionsDonutChartProps) {
  const total = data.reduce((sum, row) => sum + row.count, 0);
  const colors = assignConditionColors(data.map((row) => row.condition));

  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const row = payload[0]?.payload as ConditionCount | undefined;
    if (!active || !row) return null;
    return (
      <ChartTooltip
        title={row.condition}
        rows={[
          {
            color: colors.get(row.condition) ?? 'var(--chart-other)',
            label: 'Patients',
            value: `${formatNumber(row.count)} (${formatShare(row.count, total)})`,
          },
        ]}
      />
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
      <div
        className="relative mx-auto h-48 w-48 shrink-0"
        role="img"
        aria-label={`Patient conditions: ${data.map((row) => `${row.condition} ${formatNumber(row.count)}`).join(', ')}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer={false}>
            <Pie
              data={[...data]}
              dataKey="count"
              nameKey="condition"
              innerRadius="62%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              // The 2px surface-colored stroke is the gap between slices.
              stroke={CHART_SURFACE}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((row) => (
                <Cell key={row.condition} fill={colors.get(row.condition)} />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">{formatNumber(total)}</span>
          <span className="text-xs text-muted-foreground">patients</span>
        </div>
      </div>

      {/* Legend with values: identity is never color alone, and it carries the counts. */}
      <ul className="grid min-w-0 flex-1 gap-1.5">
        {data.map((row) => (
          <li key={row.condition} className="flex items-center gap-2 text-sm">
            <span
              className="size-3 shrink-0 rounded-[3px]"
              style={{ backgroundColor: colors.get(row.condition) }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate">{row.condition}</span>
            <span className="font-medium tabular-nums">{formatNumber(row.count)}</span>
            <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">
              {formatShare(row.count, total)}
            </span>
          </li>
        ))}
      </ul>

      <ChartDataTable
        caption="Patient conditions"
        columns={['Condition', 'Patients']}
        rows={data.map((row) => [row.condition, formatNumber(row.count)])}
      />
    </div>
  );
}
