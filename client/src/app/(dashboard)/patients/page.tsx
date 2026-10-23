import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patients',
};

export default function PatientsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
    </main>
  );
}
