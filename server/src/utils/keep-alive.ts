const KEEP_ALIVE_INTERVAL_MS = 12 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Calls this server's own public /api/health on a timer. Free hosting tiers (e.g. Render)
 * put a service to sleep after ~15 minutes without inbound traffic; the request goes out to
 * the public URL and comes back in through the platform's proxy, which counts as traffic.
 *
 * It only works while the process is running: after a deploy, crash or restart nothing pings
 * until the next real request wakes it. Returns a function that stops the timer.
 */
export const startKeepAlive = (
  baseUrl: string,
  intervalMs: number = KEEP_ALIVE_INTERVAL_MS,
): (() => void) => {
  const healthUrl = new URL('/api/health', baseUrl).toString();

  const ping = async (): Promise<void> => {
    try {
      const response = await fetch(healthUrl, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      console.info(`[keep-alive] ${healthUrl} -> ${response.status}`);
    } catch (error) {
      console.warn(
        `[keep-alive] ${healthUrl} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const timer = setInterval(() => {
    void ping();
  }, intervalMs);
  // Never keep the process alive just for this timer.
  timer.unref();

  console.info(`[keep-alive] pinging ${healthUrl} every ${Math.round(intervalMs / 60_000)} min`);
  return () => {
    clearInterval(timer);
  };
};
