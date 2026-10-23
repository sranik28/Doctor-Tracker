import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PatientsView, PatientsViewSkeleton } from '@/components/patients/patients-view';

export const metadata: Metadata = {
  title: 'Patients',
};

export default function PatientsPage() {
  return (
    // Filters are read from the URL (useSearchParams), which needs a Suspense boundary.
    <Suspense fallback={<PatientsViewSkeleton />}>
      <PatientsView />
    </Suspense>
  );
}
