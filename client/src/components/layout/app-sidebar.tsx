import Link from 'next/link';

import { AppLogo } from '@/components/shared/app-logo';

import { SidebarNav } from './sidebar-nav';

/** Fixed desktop sidebar; on mobile the same nav lives in MobileNav's drawer. */
export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="rounded-md focus-visible:ring-2 focus-visible:outline-none"
        >
          <AppLogo />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <SidebarNav />
      </div>
    </aside>
  );
}
