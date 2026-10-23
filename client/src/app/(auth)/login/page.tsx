import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
    </main>
  );
}
