import type { ReactNode } from 'react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { TopBar } from '@/components/layout/top-bar';

// Everything below is gated on a client-side session check (AuthGuard), so the prerendered
// shell is always the skeleton and navigation into this group is allowed to block on /auth/me.
export const instant = false;

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-svh">
        <AppSidebar />
        <div className="flex min-h-svh flex-col md:pl-64">
          <TopBar />
          <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
