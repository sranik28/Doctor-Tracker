'use client';

import { useMediaQuery } from './use-media-query';

// Matches Tailwind's `md` breakpoint, which the sidebar's CSS switches on.
const MOBILE_QUERY = '(max-width: 767px)';

/** True below the `md` breakpoint. Used by the shadcn Sidebar to pick drawer vs. rail. */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY);
}
