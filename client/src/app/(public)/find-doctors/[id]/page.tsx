import type { Metadata } from 'next';
import { Suspense } from 'react';

import {
  PublicDoctorProfile,
  PublicDoctorProfileSkeleton,
} from '@/components/public/public-doctor-profile';

export const metadata: Metadata = {
  title: 'Doctor profile',
};

export default function PublicDoctorPage() {
  return (
    <Suspense fallback={<PublicDoctorProfileSkeleton />}>
      <PublicDoctorProfile />
    </Suspense>
  );
}
