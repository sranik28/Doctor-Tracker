import axios, { type InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// A 401 from these means "bad credentials" / "session over", never "refresh and retry".
const NO_REFRESH_ENDPOINTS = ['/auth/login', '/auth/refresh'];

const shouldSkipRefresh = (url: string | undefined): boolean =>
  NO_REFRESH_ENDPOINTS.some((endpoint) => url?.endsWith(endpoint));

// One shared refresh: parallel 401s all wait on the same request instead of each rotating the token.
let refreshPromise: Promise<void> | null = null;

const refreshSession = (): Promise<void> => {
  refreshPromise ??= api
    .post('/auth/refresh')
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

// Full navigation on purpose: it drops every in-memory cache, so no stale user data survives.
const redirectToLogin = (): void => {
  if (typeof window === 'undefined') return;

  const { pathname, search } = window.location;
  if (pathname.startsWith('/login')) return;

  // Runs outside React (no router here), and the hard reload is the point: it wipes client state.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/login?next=${encodeURIComponent(`${pathname}${search}`)}`);
};

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
      throw error;
    }

    const config: RetriableRequestConfig = error.config;
    if (config._retry || shouldSkipRefresh(config.url)) {
      throw error;
    }

    config._retry = true;

    try {
      await refreshSession();
    } catch {
      redirectToLogin();
      throw error;
    }

    return api(config);
  },
);
