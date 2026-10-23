import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DoctorsView, DoctorsViewSkeleton } from '@/components/doctors/doctors-view';

export const metadata: Metadata = {
  title: 'Doctors',
};

export default function DoctorsPage() {
  return (
    // Filters are read from the URL (useSearchParams), which needs a Suspense boundary.
    <Suspense fallback={<DoctorsViewSkeleton />}>
      <DoctorsView />
    </Suspense>
  );
}
