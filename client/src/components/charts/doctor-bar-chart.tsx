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
import { formatCompact, formatNumber } from '@/lib/format';
import type { DoctorPatientCount } from '@/types/dashboard';

import { AXIS_TICK, GRID_STROKE, PATIENTS_COLOR } from './chart-theme';

interface DoctorBarChartProps {
  data: readonly DoctorPatientCount[];
  /** Called with the doctor id when a bar (or its label) is clicked. */
  onSelect?: (doctorId: string) => void;
}

const ROW_HEIGHT = 32;
const LABEL_MAX = 17;

// Every name starts with "Dr. ": dropping it on the axis saves room (tooltip and links keep it).
const shortName = (name: string) => {
  const bare = name.replace(/^Dr\.\s+/, '');
  return bare.length > LABEL_MAX ? `${bare.slice(0, LABEL_MAX - 1)}…` : bare;
};

export function DoctorBarChart({ data, onSelect }: DoctorBarChartProps) {
  const renderTooltip = ({ active, payload }: TooltipContentProps) => {
    const row = payload[0]?.payload as DoctorPatientCount | undefined;
    if (!active || !row) return null;
    return (
      <ChartTooltip
        title={row.name}
        subtitle={row.specialization}
        rows={[{ color: PATIENTS_COLOR, label: 'Patients', value: formatNumber(row.count) }]}
        footer={onSelect ? 'Click to open profile' : undefined}
      />
    );
  };

  return (
    <div
      role="img"
      aria-label={`Patients per doctor, top ${data.length}: ${data.map((row) => `${row.name} ${row.count}`).join(', ')}.`}
    >
      <ResponsiveContainer width="100%" height={Math.max(data.length * ROW_HEIGHT + 24, 120)}>
        <BarChart
          data={[...data]}
          layout="vertical"
          margin={{ top: 0, right: 36, bottom: 0, left: 0 }}
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
            tickFormatter={formatCompact}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={112}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={shortName}
            interval={0}
          />
          <Tooltip content={renderTooltip} cursor={{ fill: 'var(--muted)', opacity: 0.5 }} />
          <Bar
            dataKey="count"
            fill={PATIENTS_COLOR}
            radius={[0, 4, 4, 0]}
            barSize={16}
            isAnimationActive={false}
            cursor={onSelect ? 'pointer' : undefined}
            onClick={(item) => onSelect?.((item.payload as DoctorPatientCount).doctorId)}
          >
            <LabelList
              dataKey="count"
              position="right"
              formatter={(value) => formatNumber(Number(value))}
              fill="var(--foreground)"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
