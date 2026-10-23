'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface FilterBarProps {
  /** Always visible, e.g. the search box. */
  search?: ReactNode;
  /** Filter controls: inline from md up, inside a bottom sheet below md. */
  children: ReactNode;
  /** Number of active filters, shown on the mobile trigger. */
  activeCount: number;
  /** Shown as "Clear filters" when any filter or search is active. */
  onClear?: (() => void) | undefined;
}

export function FilterBar({ search, children, activeCount, onClear }: FilterBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <div className="flex items-center gap-2 md:w-72">
        {search && <div className="min-w-0 flex-1">{search}</div>}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="shrink-0 md:hidden">
              <SlidersHorizontal aria-hidden="true" />
              Filters
              {activeCount > 0 && (
                <Badge className="ml-0.5 h-5 min-w-5 rounded-full px-1.5 tabular-nums">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85svh] gap-0 rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Narrow down the list.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-3 overflow-y-auto px-4 pb-2">{children}</div>
            <SheetFooter className="flex-row">
              {onClear && (
                <Button variant="outline" className="flex-1" onClick={onClear}>
                  Clear all
                </Button>
              )}
              <Button className="flex-1" onClick={() => setOpen(false)}>
                Done
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden flex-wrap items-center gap-2 md:flex">
        {children}
        {onClear && (
          <Button variant="ghost" onClick={onClear}>
            <X aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
