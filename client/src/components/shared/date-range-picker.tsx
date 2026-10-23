'use client';

import { format, parseISO, subMonths } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { cn } from 'cn';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMediaQuery } from '@/hooks/use-media-query';

/** Dates are plain "YYYY-MM-DD" strings so they can live in the URL unchanged. */
export interface DateRangeValue {
  from?: string | undefined;
  to?: string | undefined;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  placeholder?: string;
  className?: string;
}

const toDate = (value: string | undefined) => (value ? parseISO(value) : undefined);
const toIsoDate = (date: Date | undefined) => (date ? format(date, 'yyyy-MM-dd') : undefined);

const formatLabel = ({ from, to }: DateRangeValue): string | undefined => {
  const fromDate = toDate(from);
  const toDateValue = toDate(to);
  if (fromDate && toDateValue) {
    return `${format(fromDate, 'd MMM yyyy')} – ${format(toDateValue, 'd MMM yyyy')}`;
  }
  if (fromDate) return `From ${format(fromDate, 'd MMM yyyy')}`;
  if (toDateValue) return `Until ${format(toDateValue, 'd MMM yyyy')}`;
  return undefined;
};

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Date range',
  className,
}: DateRangePickerProps) {
  const isWide = useMediaQuery('(min-width: 768px)');
  const [open, setOpen] = useState(false);
  // While open, edit a draft; apply once both ends are picked or the popover closes.
  const [draft, setDraft] = useState<DateRange | undefined>();

  const label = formatLabel(value);
  const hasValue = Boolean(value.from ?? value.to);

  const apply = (range: DateRange | undefined) => {
    onChange({ from: toIsoDate(range?.from), to: toIsoDate(range?.to) });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft({ from: toDate(value.from), to: toDate(value.to) });
    } else if (draft?.from && toIsoDate(draft.from) !== value.from) {
      apply(draft);
    }
    setOpen(nextOpen);
  };

  const handleSelect = (range: DateRange | undefined) => {
    setDraft(range);
    if (range?.from && range.to && range.from.getTime() !== range.to.getTime()) {
      apply(range);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start gap-2 font-normal',
            !hasValue && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon aria-hidden="true" />
          <span className="truncate">{label ?? placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={draft}
          onSelect={handleSelect}
          numberOfMonths={isWide ? 2 : 1}
          // Future dates are disabled, so with two months show last month + this month.
          defaultMonth={draft?.from ?? (isWide ? subMonths(new Date(), 1) : new Date())}
          disabled={{ after: new Date() }}
        />
        <div className="flex items-center justify-between gap-2 border-t p-2">
          <span className="px-1 text-xs text-muted-foreground">
            {draft?.from && !draft.to ? 'Pick an end date' : 'Pick a start date'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(undefined);
              onChange({ from: undefined, to: undefined });
              setOpen(false);
            }}
            disabled={!hasValue && !draft?.from}
          >
            <X aria-hidden="true" />
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
