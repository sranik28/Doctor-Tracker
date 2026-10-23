'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { SegmentedControl } from '@/components/shared/segmented-control';
import { WidgetCard } from '@/components/shared/widget-card';
import { usePatientsOverTime } from '@/hooks/use-dashboard';
import type { TimelineRange } from '@/types/dashboard';

// Recharts is heavy: load it on demand, only on the dashboard, and never on the server.
const TimelineAreaChart = dynamic(
  () =>
    import('@/components/charts/timeline-area-chart').then((module) => module.TimelineAreaChart),
  { ssr: false, loading: () => <ChartSkeleton className="h-65" /> },
);

const RANGE_OPTIONS = [
  { value: '7d', label: '7D', ariaLabel: '7D, last 7 days' },
  { value: '30d', label: '30D', ariaLabel: '30D, last 30 days' },
  { value: '12m', label: '12M', ariaLabel: '12M, last 12 months' },
] as const;

const DESCRIPTIONS: Record<TimelineRange, string> = {
  '7d': 'Admissions per day, last 7 days',
  '30d': 'Admissions per day, last 30 days',
  '12m': 'Admissions per month, last 12 months',
};

export function TimelineWidget() {
  const [range, setRange] = useState<TimelineRange>('30d');
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } =
    usePatientsOverTime(range);

  return (
    <WidgetCard
      title="Patients over time"
      description={DESCRIPTIONS[range]}
      action={
        <SegmentedControl
          label="Time range"
          value={range}
          options={RANGE_OPTIONS}
          onChange={setRange}
        />
      }
      isLoading={isLoading}
      // A failed range must show its own error, not the previous range's data held as a placeholder.
      isError={isError && (isPlaceholderData || !data)}
      onRetry={() => void refetch()}
      isRetrying={isFetching}
      isEmpty={data !== undefined && data.every((point) => point.count === 0)}
      emptyMessage="No admissions in this period"
      skeleton={<ChartSkeleton className="h-65" />}
      minHeightClass="min-h-65"
      className="lg:col-span-2"
    >
      {data && <TimelineAreaChart data={data} isUpdating={isPlaceholderData} />}
    </WidgetCard>
  );
}
