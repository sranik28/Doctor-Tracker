import { PageHeader } from '@/components/shared/page-header';

import { ConditionsWidget } from './conditions-widget';
import { DoctorsWidget } from './doctors-widget';
import { RecentPatientsWidget } from './recent-patients-widget';
import { SpecializationsWidget } from './specializations-widget';
import {
  NewPatientsCard,
  TopSpecializationCard,
  TotalDoctorsCard,
  TotalPatientsCard,
} from './stat-cards';
import { TimelineWidget } from './timeline-widget';

/** Every widget fetches and fails on its own; this component only arranges them. */
export function DashboardView() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader title="Dashboard" description="How your doctors and patients are doing." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TotalDoctorsCard />
        <TotalPatientsCard />
        <NewPatientsCard />
        <TopSpecializationCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TimelineWidget />
        <ConditionsWidget />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DoctorsWidget />
        <SpecializationsWidget />
      </div>

      <RecentPatientsWidget />
    </div>
  );
}
