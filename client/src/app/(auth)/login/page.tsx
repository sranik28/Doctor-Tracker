import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginBrandPanel } from '@/components/auth/login-brand-panel';
import { LoginForm } from '@/components/auth/login-form';
import { LoginFormSkeleton } from '@/components/auth/login-form-skeleton';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <LoginBrandPanel />

      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:px-8 lg:items-center">
        <div className="grid w-full max-w-sm gap-8">
          <div className="grid gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your admin account to continue.
            </p>
          </div>

          {/* useSearchParams (for ?next=) needs a Suspense boundary to keep the page prerendered. */}
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
