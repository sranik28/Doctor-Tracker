'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from 'cn';

import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchInputProps {
  /** Initial value. To reset the input from outside, change the component's `key`. */
  defaultValue?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
  'aria-label'?: string;
}

/** Text input that reports its (trimmed) value only after the user stops typing. */
export function SearchInput({
  defaultValue = '',
  onSearch,
  placeholder = 'Search…',
  delay = 400,
  className,
  'aria-label': ariaLabel = placeholder,
}: SearchInputProps) {
  const [text, setText] = useState(defaultValue);
  const debounced = useDebounce(text.trim(), delay);
  const lastSent = useRef(defaultValue);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  useEffect(() => {
    if (debounced === lastSent.current) return;
    lastSent.current = debounced;
    onSearchRef.current(debounced);
  }, [debounced]);

  const clear = () => {
    setText('');
    lastSent.current = '';
    onSearchRef.current('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pr-9 pl-8 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={clear}
          className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Clear search"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
