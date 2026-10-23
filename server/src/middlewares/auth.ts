import type { RequestHandler } from 'express';

import { ApiError } from '../utils/ApiError.js';
import { ACCESS_TOKEN_COOKIE, readCookie } from '../utils/auth-cookies.js';
import { verifyAccessToken } from '../utils/jwt.js';

/** Requires a valid access token cookie and attaches `req.user`. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const token = readCookie(req, ACCESS_TOKEN_COOKIE);

  if (!token) {
    next(ApiError.unauthorized());
    return;
  }

  const payload = verifyAccessToken(token);
  req.user = { id: payload.sub, role: payload.role };
  next();
};
