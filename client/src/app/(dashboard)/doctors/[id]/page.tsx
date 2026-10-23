import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Doctor details',
};

// Placeholder until the doctor detail phase.
export default function DoctorDetailPage() {
  return (
    <section className="grid gap-4">
      <Link
        href="/doctors"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to doctors
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Doctor details</h1>
    </section>
  );
}
