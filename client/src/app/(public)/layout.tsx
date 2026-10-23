import type { ReactNode } from 'react';

import { PublicFooter } from '@/components/public/public-footer';
import { PublicHeader } from '@/components/public/public-header';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
