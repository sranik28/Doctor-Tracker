import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doctors',
};

export default function DoctorsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Doctors</h1>
    </main>
  );
}
