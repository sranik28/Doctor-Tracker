interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const MAX_ENTRIES = 200;

/**
 * Tiny in-memory TTL cache with request coalescing.
 *
 * Tradeoff (by design): entries expire only by time, there is no invalidation. A dashboard
 * number can therefore be up to `ttlMs` stale after a patient is added or deleted. The cache
 * is also per process, so several server instances each keep their own copy, and a restart
 * empties it. That is acceptable for read-mostly aggregate numbers; anything that must be
 * exact right after a write should skip the cache.
 */
export class TtlCache {
  private readonly entries = new Map<string, CacheEntry<unknown>>();
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(private readonly ttlMs: number) {}

  /** Returns the cached value, or runs `loader` once (concurrent callers share that run). */
  async getOrSet<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = this.entries.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value as T;

    const pending = this.inFlight.get(key);
    if (pending) return pending as Promise<T>;

    const request = loader()
      .then((value) => {
        this.set(key, value);
        return value;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, request);
    return request;
  }

  private set(key: string, value: unknown): void {
    if (this.entries.size >= MAX_ENTRIES) {
      // Drop the oldest-inserted entry; Map iterates in insertion order.
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.entries.clear();
  }
}
