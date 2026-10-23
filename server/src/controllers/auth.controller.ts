import type { ParamsDictionary } from 'express-serve-static-core';

import { getCurrentUser, loginUser, logoutUser, refreshSession } from '../services/auth.service.js';
import type { LoginInput } from '../validations/auth.validation.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  clearAuthCookies,
  readCookie,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from '../utils/auth-cookies.js';

export const login = asyncHandler<ParamsDictionary, unknown, LoginInput>(async (req, res) => {
  const { user, tokens } = await loginUser(req.body);
  setAuthCookies(res, tokens);
  sendSuccess(res, { user });
});

export const refresh = asyncHandler(async (req, res) => {
  try {
    const { user, tokens } = await refreshSession(readCookie(req, REFRESH_TOKEN_COOKIE));
    setAuthCookies(res, tokens);
    sendSuccess(res, { user });
  } catch (error) {
    // A failed refresh ends the session on the client too.
    clearAuthCookies(res);
    throw error;
  }
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(readCookie(req, REFRESH_TOKEN_COOKIE));
  clearAuthCookies(res);
  sendSuccess(res, null);
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await getCurrentUser(req.user.id);
  sendSuccess(res, { user });
});
