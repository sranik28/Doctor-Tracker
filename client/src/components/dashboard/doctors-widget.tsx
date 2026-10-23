'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { WidgetCard } from '@/components/shared/widget-card';
import { usePatientsPerDoctor } from '@/hooks/use-dashboard';
import { formatNumber } from '@/lib/format';

const DoctorBarChart = dynamic(
  () => import('@/components/charts/doctor-bar-chart').then((module) => module.DoctorBarChart),
  { ssr: false, loading: () => <ChartSkeleton className="h-85" /> },
);

export function DoctorsWidget() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = usePatientsPerDoctor(10);

  return (
    <WidgetCard
      title="Patients per doctor"
      description="Top 10 by patient count. Select a bar to open the doctor."
      isLoading={isLoading}
      isError={isError && !data}
      onRetry={() => void refetch()}
      isRetrying={isRefetching}
      isEmpty={data?.length === 0}
      emptyMessage="No patients assigned yet"
      skeleton={<ChartSkeleton className="h-85" />}
      minHeightClass="min-h-85"
    >
      {data && (
        <>
          <DoctorBarChart
            data={data}
            onSelect={(doctorId) => router.push(`/doctors/${doctorId}`)}
          />
          {/* Keyboard and screen-reader route to the same links the bars open. */}
          <ul className="sr-only">
            {data.map((row) => (
              <li key={row.doctorId}>
                <Link href={`/doctors/${row.doctorId}`}>
                  {row.name}, {row.specialization}: {formatNumber(row.count)} patients
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </WidgetCard>
  );
}
