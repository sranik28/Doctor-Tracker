'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';

import { isNavItemActive, NAV_ITEMS } from '@/lib/nav-items';

interface SidebarNavProps {
  /** Called after a link is chosen, e.g. to close the mobile drawer. */
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="grid gap-1">
      {NAV_ITEMS.map(({ title, href, icon: Icon }) => {
        const isActive = isNavItemActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {title}
          </Link>
        );
      })}
    </nav>
  );
}
