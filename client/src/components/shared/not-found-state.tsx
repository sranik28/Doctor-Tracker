import { SearchX } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';

/** The body of every 404 screen. */
export function NotFoundState() {
  return (
    <EmptyState
      icon={SearchX}
      headingLevel="h1"
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      className="mx-auto w-full max-w-xl"
      action={
        <Button asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      }
    />
  );
}
