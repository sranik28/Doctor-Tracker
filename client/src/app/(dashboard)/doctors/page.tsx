import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doctors',
};

export default function DoctorsPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Doctors</h1>
    </section>
  );
}
