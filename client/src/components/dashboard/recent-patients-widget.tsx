'use client';

import { format, parseISO } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { ConditionBadge } from '@/components/patients/condition-badge';
import { WidgetCard } from '@/components/shared/widget-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRecentPatients } from '@/hooks/use-dashboard';

const formatDate = (iso: string) => format(parseISO(iso), 'd MMM yyyy');

const RecentSkeleton = (
  <div className="grid gap-3" aria-hidden="true">
    {Array.from({ length: 5 }, (_, index) => (
      <Skeleton key={index} className="h-10 w-full" />
    ))}
  </div>
);

export function RecentPatientsWidget() {
  const { data, isLoading, isError, refetch, isRefetching } = useRecentPatients(5);

  return (
    <WidgetCard
      title="Recent patients"
      description="The latest admissions"
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/patients">
            View all
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      }
      isLoading={isLoading}
      isError={isError && !data}
      onRetry={() => void refetch()}
      isRetrying={isRefetching}
      isEmpty={data?.length === 0}
      emptyMessage="No patients yet"
      skeleton={RecentSkeleton}
    >
      {data && (
        <>
          <ul className="grid gap-3 lg:hidden" aria-label="Recent patients">
            {data.map((patient) => (
              <li key={patient._id} className="grid gap-2 rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 truncate font-medium">{patient.name}</span>
                  <time
                    dateTime={patient.admittedAt}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {formatDate(patient.admittedAt)}
                  </time>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <ConditionBadge condition={patient.condition} />
                  {patient.doctor && (
                    <Link
                      href={`/doctors/${patient.doctor._id}`}
                      className="truncate text-sm hover:underline"
                    >
                      {patient.doctor.name}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <Table className="hidden lg:table">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead className="text-right">Admitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((patient) => (
                <TableRow key={patient._id}>
                  <TableCell className="max-w-48 truncate font-medium">{patient.name}</TableCell>
                  <TableCell>
                    <ConditionBadge condition={patient.condition} />
                  </TableCell>
                  <TableCell className="max-w-56 truncate">
                    {patient.doctor ? (
                      <Link href={`/doctors/${patient.doctor._id}`} className="hover:underline">
                        {patient.doctor.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                    <time dateTime={patient.admittedAt}>{formatDate(patient.admittedAt)}</time>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </WidgetCard>
  );
}
