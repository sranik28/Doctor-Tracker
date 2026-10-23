import type { RequestHandler } from 'express';

/**
 * API responses are per-user admin data. `no-store` stops browsers and any shared proxy or CDN
 * in front of the API from caching them (Express would otherwise add weak ETags and let them).
 */
export const noStore: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};
