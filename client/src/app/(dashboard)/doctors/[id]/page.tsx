import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DoctorDetailSkeleton, DoctorDetailView } from '@/components/doctors/doctor-detail-view';

export const metadata: Metadata = {
  title: 'Doctor details',
};

export default function DoctorDetailPage() {
  return (
    // The id and the patients' page/search come from the URL, which needs a Suspense boundary.
    <Suspense fallback={<DoctorDetailSkeleton />}>
      <DoctorDetailView />
    </Suspense>
  );
}
