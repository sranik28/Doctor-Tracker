import type { RequestHandler } from 'express';

const PUBLIC_MAX_AGE_SECONDS = 60;

/** Public, anonymous responses may be cached briefly by browsers and CDNs. */
export const publicCache: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', `public, max-age=${PUBLIC_MAX_AGE_SECONDS}`);
  next();
};
