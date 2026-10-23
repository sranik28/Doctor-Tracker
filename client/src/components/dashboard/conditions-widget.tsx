'use client';

import dynamic from 'next/dynamic';

import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { WidgetCard } from '@/components/shared/widget-card';
import { useConditionBreakdown } from '@/hooks/use-dashboard';

const ConditionsDonutChart = dynamic(
  () =>
    import('@/components/charts/conditions-donut-chart').then(
      (module) => module.ConditionsDonutChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton className="h-65" /> },
);

export function ConditionsWidget() {
  const { data, isLoading, isError, refetch, isRefetching } = useConditionBreakdown();

  return (
    <WidgetCard
      title="Patient conditions"
      description="Top 6 conditions, the rest grouped as Other"
      isLoading={isLoading}
      isError={isError && !data}
      onRetry={() => void refetch()}
      isRetrying={isRefetching}
      isEmpty={data?.length === 0}
      emptyMessage="No patients yet"
      skeleton={<ChartSkeleton className="h-65" />}
      minHeightClass="min-h-65"
    >
      {data && <ConditionsDonutChart data={data} />}
    </WidgetCard>
  );
}
