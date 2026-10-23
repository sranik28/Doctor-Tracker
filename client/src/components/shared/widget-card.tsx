'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from 'cn';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface WidgetCardProps {
  title: string;
  description?: string;
  /** Right side of the header, e.g. a range toggle or a "View all" link. */
  action?: ReactNode;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  isRetrying?: boolean;
  /** True when the request succeeded but there is nothing to show. */
  isEmpty?: boolean;
  emptyMessage?: string;
  /** Skeleton shaped like the content, so the layout doesn't jump when data arrives. */
  skeleton: ReactNode;
  /** Minimum body height, keeping states the same size as the real content. */
  minHeightClass?: string;
  className?: string;
  children: ReactNode;
}

/**
 * A dashboard card that owns its own loading, error (with retry) and empty states,
 * so one failing request never takes down the rest of the page.
 */
export function WidgetCard({
  title,
  description,
  action,
  isLoading,
  isError,
  onRetry,
  isRetrying = false,
  isEmpty = false,
  emptyMessage = 'No data yet',
  skeleton,
  minHeightClass,
  className,
  children,
}: WidgetCardProps) {
  const body = (() => {
    if (isLoading) return skeleton;

    if (isError) {
      return (
        <div
          role="alert"
          className="flex h-full min-h-32 flex-col items-center justify-center gap-3 text-center"
        >
          <AlertTriangle className="size-6 text-muted-foreground" aria-hidden="true" />
          <div className="grid gap-0.5">
            <p className="text-sm font-medium">Couldn&apos;t load {title.toLowerCase()}</p>
            <p className="text-xs text-muted-foreground">Check your connection and try again.</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
            <RefreshCw className={cn(isRetrying && 'animate-spin')} aria-hidden="true" />
            Retry
          </Button>
        </div>
      );
    }

    if (isEmpty) {
      return (
        <p className="flex h-full min-h-32 items-center justify-center text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      );
    }

    return children;
  })();

  return (
    <Card className={cn('min-w-0', className)}>
      <CardHeader>
        <CardTitle as="h2" className="text-base">
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className={cn('min-w-0', minHeightClass)}>{body}</CardContent>
    </Card>
  );
}
