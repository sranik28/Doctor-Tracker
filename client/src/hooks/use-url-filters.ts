'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { z } from 'zod';

type FilterValue = string | number | undefined;
type FilterRecord = Record<string, FilterValue>;

/**
 * Filters stored in the URL query string, parsed by a Zod schema whose fields all have
 * fallbacks (`.catch`). Values equal to the schema's defaults are left out of the URL.
 * Changing anything other than `page` resets to page 1.
 */
export function useUrlFilters<TSchema extends z.ZodType<FilterRecord & { page: number }>>(
  schema: TSchema,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const defaults = useMemo(() => schema.parse({}), [schema]);
  const filters = useMemo(
    () => schema.parse(Object.fromEntries(new URLSearchParams(queryString))),
    [schema, queryString],
  );

  const writeFilters = useCallback(
    (next: z.output<TSchema>) => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === '' || value === defaults[key]) continue;
        params.set(key, String(value));
      }
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [defaults, pathname, router],
  );

  const setFilters = useCallback(
    (patch: Partial<z.output<TSchema>>) => {
      writeFilters({ ...filters, ...patch, page: patch.page ?? 1 });
    },
    [filters, writeFilters],
  );

  const setPage = useCallback(
    (page: number) => {
      writeFilters({ ...filters, page });
    },
    [filters, writeFilters],
  );

  return { filters, defaults, setFilters, setPage };
}
