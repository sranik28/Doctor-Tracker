import { LogIn } from 'lucide-react';
import Link from 'next/link';

import { ThemeToggle } from '@/components/layout/theme-toggle';
import { AppLogo } from '@/components/shared/app-logo';
import { Button } from '@/components/ui/button';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Doctor Tracker home"
        >
          <AppLogo />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 sm:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/find-doctors">Find a doctor</Link>
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/login">
              <LogIn aria-hidden="true" />
              Staff login
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
