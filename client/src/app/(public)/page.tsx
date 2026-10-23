import { CalendarCheck, Search, Stethoscope } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { SpecializationLinks } from '@/components/public/specialization-links';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: { absolute: 'Doctor Tracker | Find a doctor' },
  description: 'Find the right doctor by name, hospital or specialization.',
};

const STEPS = [
  { icon: Search, title: 'Search', text: 'Look up a doctor by name or hospital.' },
  { icon: Stethoscope, title: 'Choose', text: 'Narrow down by specialization and compare.' },
  { icon: CalendarCheck, title: 'Get in touch', text: 'Contact the hospital to book your visit.' },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,var(--primary)/0.12,transparent_45%),radial-gradient(circle_at_85%_90%,var(--primary)/0.08,transparent_40%)]"
        />
        <div className="mx-auto grid w-full max-w-3xl justify-items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Find the right doctor, fast.
          </h1>
          <p className="max-w-xl text-balance text-muted-foreground sm:text-lg">
            Browse our network of doctors by specialization and hospital.
          </p>

          {/* A plain GET form: works before any JavaScript has loaded. */}
          <form
            action="/find-doctors"
            method="get"
            role="search"
            className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
          >
            <Input
              type="search"
              name="search"
              placeholder="Search name or hospital"
              aria-label="Search doctors by name or hospital"
              maxLength={100}
              className="h-11 flex-1"
            />
            <Button type="submit" size="lg" className="h-11">
              <Search aria-hidden="true" />
              Search
            </Button>
          </form>

          <div className="grid w-full gap-3 pt-4">
            <p className="text-sm text-muted-foreground">Or browse by specialization</p>
            <SpecializationLinks />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="grid justify-items-center gap-2 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-semibold">
                {index + 1}. {title}
              </h3>
              <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/find-doctors">Browse all doctors</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
