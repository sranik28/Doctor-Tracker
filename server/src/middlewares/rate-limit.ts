import type { Request } from 'express';
import { rateLimit } from 'express-rate-limit';

import { ApiError } from '../utils/ApiError.js';
import type { LoginInput } from '../validations/auth.validation.js';

const LOGIN_WINDOW_MINUTES = 15;
const LOGIN_WINDOW_MS = LOGIN_WINDOW_MINUTES * 60 * 1000;

const tooManyLoginAttempts = () =>
  ApiError.tooManyRequests(
    `Too many login attempts. Please try again in ${LOGIN_WINDOW_MINUTES} minutes.`,
  );

/** 5 failed login attempts per IP per 15 minutes; successful logins are not counted. */
export const loginRateLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MS,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(tooManyLoginAttempts());
  },
});

/**
 * 10 failed login attempts per account per 15 minutes, whatever IP they claim to come from.
 * The per-IP limit depends on X-Forwarded-For, which a client can forge whenever no trusted
 * proxy overwrites it; this one can't be dodged that way. It applies to unknown emails too,
 * so a 429 doesn't reveal whether an account exists. Must run after body validation.
 */
export const loginAccountRateLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MS,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  identifier: 'login-account',
  keyGenerator: (req: Request) => `login-account:${(req.body as LoginInput).email}`,
  handler: (_req, _res, next) => {
    next(tooManyLoginAttempts());
  },
});
