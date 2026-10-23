'use client';

import { RouteError } from '@/components/shared/route-error';

// Sits inside the dashboard layout, so the sidebar and top bar stay usable when a page breaks.
export default function DashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  return <RouteError error={error} retry={retry} />;
}
