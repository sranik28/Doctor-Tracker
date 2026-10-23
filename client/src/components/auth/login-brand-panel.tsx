import { Activity, ShieldCheck, Users } from 'lucide-react';

import { AppLogo } from '@/components/shared/app-logo';

const FEATURES = [
  { icon: Users, text: 'Doctors and their patients in one place' },
  { icon: Activity, text: 'Admissions and workload at a glance' },
  { icon: ShieldCheck, text: 'Secure, admin-only access' },
] as const;

export function LoginBrandPanel() {
  return (
    <section className="relative isolate flex flex-col justify-between gap-6 overflow-hidden bg-primary px-6 py-8 text-primary-foreground sm:px-10 lg:min-h-svh lg:py-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,oklch(1_0_0/0.12),transparent_45%),radial-gradient(circle_at_80%_90%,oklch(1_0_0/0.08),transparent_40%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(1_0_0/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.05)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black_40%,transparent_80%)] bg-size-[48px_48px]"
      />

      <AppLogo inverted />

      <div className="grid max-w-md gap-3 lg:gap-6">
        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl lg:text-4xl">
          Care teams, organised.
        </h2>
        <p className="text-sm text-primary-foreground/70 sm:text-base">
          Manage doctors, track patients and keep an eye on admissions from a single dashboard.
        </p>
        <ul className="hidden gap-4 pt-2 lg:grid">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/85">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-foreground/10">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="hidden text-xs text-primary-foreground/50 lg:block">
        Doctor Tracker · Admin console
      </p>
    </section>
  );
}
