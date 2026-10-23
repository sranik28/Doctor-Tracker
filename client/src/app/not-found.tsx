import type { Metadata } from 'next';

import { NotFoundState } from '@/components/shared/not-found-state';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <NotFoundState />
    </main>
  );
}
