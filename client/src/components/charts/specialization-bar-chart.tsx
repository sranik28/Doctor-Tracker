'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';

import { ChartTooltip } from '@/components/shared/chart-tooltip';
import { formatNumber } from '@/lib/format';
import type { SpecializationCount } from '@/types/dashboard';

import { ChartDataTable } from './chart-data-table';
import { AXIS_TICK, DOCTORS_COLOR, GRID_STROKE } from './chart-theme';

interface SpecializationBarChartProps {
  data: readonly SpecializationCount[];
}

const ROW_HEIGHT = 32;

export function SpecializationBarChart({ data }: SpecializationBarChartProps) {
  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const row = payload[0]?.payload as SpecializationCount | undefined;
    if (!active || !row) return null;
    return (
      <ChartTooltip
        title={row.specialization}
        rows={[{ color: DOCTORS_COLOR, label: 'Doctors', value: formatNumber(row.doctorCount) }]}
      />
    );
  };

  return (
    <div
      role="img"
      aria-label={`Doctors by specialization: ${data.map((row) => `${row.specialization} ${row.doctorCount}`).join(', ')}.`}
    >
      <ResponsiveContainer width="100%" height={Math.max(data.length * ROW_HEIGHT + 24, 120)}>
        <BarChart
          data={[...data]}
          layout="vertical"
          margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
          barCategoryGap={6}
          accessibilityLayer={false}
        >
          <CartesianGrid horizontal={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
          <XAxis
            type="number"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="specialization"
            width={104}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <Tooltip content={renderTooltip} cursor={{ fill: 'var(--muted)', opacity: 0.5 }} />
          <Bar
            dataKey="doctorCount"
            fill={DOCTORS_COLOR}
            radius={[0, 4, 4, 0]}
            barSize={16}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="doctorCount"
              position="right"
              fill="var(--foreground)"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ChartDataTable
        caption="Doctors by specialization"
        columns={['Specialization', 'Doctors']}
        rows={data.map((row) => [row.specialization, formatNumber(row.doctorCount)])}
      />
    </div>
  );
}
