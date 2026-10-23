'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import type { Matcher } from 'react-day-picker';
import { cn } from 'cn';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type TriggerProps = Omit<ComponentProps<typeof Button>, 'value' | 'onChange' | 'children'>;

interface DatePickerProps extends TriggerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  /** Days that can't be picked, e.g. `{ after: new Date() }`. */
  disabledDays?: Matcher;
  /** Earliest month reachable in the month/year dropdowns. */
  startMonth?: Date;
}

/**
 * Single-date picker. Extra props (id, aria-*) go to the trigger button, so it works inside
 * a form field's <FormControl>.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabledDays,
  startMonth = new Date(2000, 0),
  className,
  ...triggerProps
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start gap-2 font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
          {...triggerProps}
        >
          <CalendarIcon aria-hidden="true" />
          {value ? format(value, 'd MMM yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          defaultMonth={value}
          disabled={disabledDays}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
