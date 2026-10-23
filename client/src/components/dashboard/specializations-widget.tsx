'use client';

import dynamic from 'next/dynamic';

import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { WidgetCard } from '@/components/shared/widget-card';
import { useSpecializationBreakdown } from '@/hooks/use-dashboard';

const SpecializationBarChart = dynamic(
  () =>
    import('@/components/charts/specialization-bar-chart').then(
      (module) => module.SpecializationBarChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton className="h-85" /> },
);

export function SpecializationsWidget() {
  const { data, isLoading, isError, refetch, isRefetching } = useSpecializationBreakdown();

  return (
    <WidgetCard
      title="Doctors by specialization"
      description="Number of doctors in each specialization"
      isLoading={isLoading}
      isError={isError && !data}
      onRetry={() => void refetch()}
      isRetrying={isRefetching}
      isEmpty={data?.length === 0}
      emptyMessage="No doctors yet"
      skeleton={<ChartSkeleton className="h-85" />}
      minHeightClass="min-h-85"
    >
      {data && <SpecializationBarChart data={data} />}
    </WidgetCard>
  );
}
