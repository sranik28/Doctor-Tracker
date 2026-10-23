import { AppLogo } from '@/components/shared/app-logo';

import { MobileNav } from './mobile-nav';
import { UserMenu } from './user-menu';

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-6">
      <MobileNav />
      <AppLogo className="text-sm md:hidden" />
      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}
