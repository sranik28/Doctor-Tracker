import type { Metadata } from 'next';
import { Suspense } from 'react';

import {
  PatientDetailSkeleton,
  PatientDetailView,
} from '@/components/patients/patient-detail-view';

export const metadata: Metadata = {
  title: 'Patient details',
};

export default function PatientDetailPage() {
  return (
    // The id comes from the URL, which needs a Suspense boundary.
    <Suspense fallback={<PatientDetailSkeleton />}>
      <PatientDetailView />
    </Suspense>
  );
}
