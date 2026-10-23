import type { Metadata } from 'next';
import { Suspense } from 'react';

import {
  PublicDoctorsView,
  PublicDoctorsViewSkeleton,
} from '@/components/public/public-doctors-view';

export const metadata: Metadata = {
  title: 'Find a doctor',
  description: 'Search doctors by name, hospital or specialization.',
};

export default function FindDoctorsPage() {
  return (
    // Filters are read from the URL (useSearchParams), which needs a Suspense boundary.
    <Suspense fallback={<PublicDoctorsViewSkeleton />}>
      <PublicDoctorsView />
    </Suspense>
  );
}
