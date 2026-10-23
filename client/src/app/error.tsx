'use client';

import { RouteError } from '@/components/shared/route-error';

// Catches errors in routes outside the dashboard (e.g. login). The dashboard has its own.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <RouteError error={error} retry={retry} />
    </main>
  );
}
