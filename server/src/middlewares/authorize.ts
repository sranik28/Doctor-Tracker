import type { RequestHandler } from 'express';

import type { UserRole } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';

/** Restricts a route to the given roles. Must run after `authenticate`. */
export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }

    next(roles.includes(req.user.role) ? undefined : ApiError.forbidden());
  };
