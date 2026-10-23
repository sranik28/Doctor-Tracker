'use client';

import { useCallback, useState } from 'react';

/**
 * SearchInput owns its text while typing. To reset it from outside, remount it with a new key
 * and starting value. The value travels with the key because the URL may not have updated
 * yet in the render that remounts it.
 */
export function useSearchSeed(initialValue: string | undefined) {
  const [seed, setSeed] = useState(() => ({ key: 0, value: initialValue }));

  const resetSearch = useCallback(() => {
    setSeed((current) => ({ key: current.key + 1, value: undefined }));
  }, []);

  return { searchKey: seed.key, searchDefaultValue: seed.value, resetSearch };
}
