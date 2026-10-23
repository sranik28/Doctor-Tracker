'use client';

import dynamic from 'next/dynamic';

import { Input } from '@/components/ui/input';

/** The phone input pulls in libphonenumber and the flag icons, so it loads only when a form opens. */
export const PhoneField = dynamic(() => import('./phone-field-input'), {
  ssr: false,
  loading: () => <Input disabled placeholder="+880 1711-000000" aria-label="Phone" />,
});
