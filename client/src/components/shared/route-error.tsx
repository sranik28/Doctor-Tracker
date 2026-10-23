'use client';

import { RefreshCw, TriangleAlert } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';

interface RouteErrorProps {
  /** Whatever was thrown; only a server-side digest is shown, never the message. */
  error: unknown;
  retry: () => void;
  /** Where "Go to dashboard" points; omit to hide that button. */
  homeHref?: string;
}

const getDigest = (error: unknown): string | undefined =>
  typeof error === 'object' &&
  error !== null &&
  'digest' in error &&
  typeof error.digest === 'string'
    ? error.digest
    : undefined;

/** The body of every error boundary: same wording, same actions, everywhere. */
export function RouteError({ error, retry, homeHref = '/dashboard' }: RouteErrorProps) {
  const digest = getDigest(error);

  return (
    <EmptyState
      icon={TriangleAlert}
      headingLevel="h1"
      title="Something went wrong"
      description="An unexpected error occurred. You can try again, or head back to the dashboard."
      className="mx-auto w-full max-w-xl"
      action={
        <div className="grid justify-items-center gap-3">
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={retry}>
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <Link href={homeHref}>Go to dashboard</Link>
            </Button>
          </div>
          {digest && <p className="text-xs text-muted-foreground">Reference: {digest}</p>}
        </div>
      }
    />
  );
}
