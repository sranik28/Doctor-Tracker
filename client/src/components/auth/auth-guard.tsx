'use client';

import { RefreshCw, ServerCrash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { AppShellSkeleton } from '@/components/layout/app-shell-skeleton';
import { Button } from '@/components/ui/button';
import { useMe } from '@/hooks/use-auth';
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api-error';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * The real route guard: renders children only once /auth/me confirms the session.
 * On 401 the API client has already refreshed or redirected to /login, so we keep the
 * skeleton up. Other failures (API down) get a retry instead of a redirect loop.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { data: user, error, refetch, isFetching } = useMe();

  // `null` means the user signed out in this tab (e.g. Back after logout).
  useEffect(() => {
    if (user === null) router.replace('/login');
  }, [user, router]);

  if (user) return children;

  if (error && getApiErrorStatus(error) !== 401) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ServerCrash className="size-6 text-muted-foreground" aria-hidden="true" />
          </span>
          <div className="grid gap-1">
            <h1 className="text-lg font-semibold">We can&apos;t reach the server</h1>
            <p className="text-sm text-muted-foreground">{getApiErrorMessage(error)}</p>
          </div>
          <Button onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? 'animate-spin' : undefined} aria-hidden="true" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return <AppShellSkeleton />;
}
