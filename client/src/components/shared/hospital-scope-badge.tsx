'use client';

import { Building2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useSelectedHospital } from '@/hooks/use-selected-hospital';

/** Shown next to a page title while the panel is scoped to one hospital. */
export function HospitalScopeBadge() {
  const { hospital } = useSelectedHospital();
  if (!hospital) return null;

  return (
    <Badge variant="secondary" className="gap-1">
      <Building2 aria-hidden="true" />
      {hospital}
    </Badge>
  );
}
