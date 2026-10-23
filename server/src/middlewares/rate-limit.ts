import { rateLimit } from 'express-rate-limit';

import { ApiError } from '../utils/ApiError.js';

const LOGIN_WINDOW_MINUTES = 15;

/** 5 failed login attempts per IP per 15 minutes; successful logins are not counted. */
export const loginRateLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MINUTES * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      ApiError.tooManyRequests(
        `Too many login attempts. Please try again in ${LOGIN_WINDOW_MINUTES} minutes.`,
      ),
    );
  },
});
