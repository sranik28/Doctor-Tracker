'use client';

import { useSyncExternalStore } from 'react';

import {
  getSelectedHospital,
  setSelectedHospital,
  subscribeToHospital,
} from '@/lib/hospital-store';

/** The hospital chosen in the sidebar switcher; `undefined` means all hospitals. */
export function useSelectedHospital() {
  const hospital = useSyncExternalStore(subscribeToHospital, getSelectedHospital, () => undefined);
  return { hospital, setHospital: setSelectedHospital };
}
