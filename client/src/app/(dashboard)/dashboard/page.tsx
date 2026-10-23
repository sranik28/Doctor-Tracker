import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
    </section>
  );
}
