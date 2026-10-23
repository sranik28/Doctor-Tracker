'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  type LucideIcon,
  Minus,
  Stethoscope,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from 'cn';

import { WidgetCard } from '@/components/shared/widget-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats, useSpecializationBreakdown } from '@/hooks/use-dashboard';
import { formatNumber, formatPercent } from '@/lib/format';

interface StatValueProps {
  value: ReactNode;
  caption: ReactNode;
  /** Text values (e.g. a specialization name) are set smaller than numbers so they fit. */
  isText?: boolean;
}

function StatValue({ value, caption, isText = false }: StatValueProps) {
  return (
    <div className="grid min-w-0 gap-1">
      <p
        className={cn(
          'truncate font-semibold tracking-tight tabular-nums',
          isText ? 'text-2xl' : 'text-3xl',
        )}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </p>
      <div className="text-sm text-muted-foreground">{caption}</div>
    </div>
  );
}

/** The card's icon sits in the header, so the value below can use the full width. */
function StatIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

const StatSkeleton = (
  <div className="grid gap-2" aria-hidden="true">
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-4 w-32" />
  </div>
);

/** Month-over-month change: an icon + label, never color alone. `null` = nothing to compare to. */
export function GrowthBadge({ growthPercent }: { growthPercent: number | null }) {
  if (growthPercent === null) {
    return (
      <Badge variant="outline" className="gap-1">
        <Sparkles aria-hidden="true" />
        New
      </Badge>
    );
  }

  if (growthPercent === 0) {
    return (
      <Badge variant="outline" className="gap-1">
        <Minus aria-hidden="true" />
        No change
      </Badge>
    );
  }

  const isUp = growthPercent > 0;
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  return (
    <Badge variant="outline" className="gap-1 tabular-nums">
      <Icon className={isUp ? 'text-status-good' : 'text-status-critical'} aria-hidden="true" />
      {isUp ? '+' : ''}
      {formatPercent(growthPercent)}
      <span className="sr-only">{isUp ? 'increase' : 'decrease'} compared with last month</span>
    </Badge>
  );
}

const statCardProps = { minHeightClass: 'min-h-16', skeleton: StatSkeleton } as const;

export function TotalDoctorsCard() {
  const { data, isLoading, isError, refetch, isRefetching } = useDashboardStats();
  return (
    <WidgetCard
      title="Total doctors"
      action={<StatIcon icon={Stethoscope} />}
      isLoading={isLoading}
      isError={isError && !data}
      onRetry={() => void refetch()}
      isRetrying={isRefetching}
      {...statCardProps}
    >
      {data && <StatValue value={formatNumber(data.totalDoctors)} caption="In your network" />}
    </WidgetCard>
  );
}

export function TotalPatientsCard() {
  const { data, isLoading, isError, refetch, isRefetching } = useDashboardStats();
  return (
    <WidgetCard
      title="Total patients"
      action={<StatIcon icon={Users} />}
      isLoading={isLoading}
      isError={isError && !data}
      onRetry={() => void refetch()}
      isRetrying={isRefetching}
      {...statCardProps}
    >
      {data && <StatValue value={formatNumber(data.totalPatients)} caption="All time" />}
    </WidgetCard>
  );
}

export function NewPatientsCard() {
  const { data, isLoading, isError, refetch, isRefetching } = useDashboardStats();
  return (
    <WidgetCard
      title="New patients this month"
      action={<StatIcon icon={UserPlus} />}
      isLoading={isLoading}
      isError={isError && !data}
      onRetry={() => void refetch()}
      isRetrying={isRefetching}
      {...statCardProps}
    >
      {data && (
        <StatValue
          value={formatNumber(data.patientsThisMonth)}
          caption={
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <GrowthBadge growthPercent={data.growthPercent} />
              <span>vs {formatNumber(data.patientsLastMonth)} last month</span>
            </span>
          }
        />
      )}
    </WidgetCard>
  );
}

export function TopSpecializationCard() {
  const { data, isLoading, isError, refetch, isRefetching } = useSpecializationBreakdown();
  const top = data?.[0];
  return (
    <WidgetCard
      title="Top specialization"
      action={<StatIcon icon={Stethoscope} />}
      isLoading={isLoading}
      isError={isError && !data}
      onRetry={() => void refetch()}
      isRetrying={isRefetching}
      isEmpty={data?.length === 0}
      emptyMessage="No doctors yet"
      {...statCardProps}
    >
      {top && (
        <StatValue
          isText
          value={top.specialization}
          caption={`${formatNumber(top.doctorCount)} ${top.doctorCount === 1 ? 'doctor' : 'doctors'}`}
        />
      )}
    </WidgetCard>
  );
}
