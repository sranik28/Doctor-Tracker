import type { CookieOptions, Request, Response } from 'express';

import { env, isProduction } from '../config/env.js';
import { durationToMs } from './duration.js';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

const accessTokenMaxAge = durationToMs(env.ACCESS_TOKEN_EXPIRES_IN);
const refreshTokenMaxAge = durationToMs(env.REFRESH_TOKEN_EXPIRES_IN);

export const setAuthCookies = (res: Response, { accessToken, refreshToken }: AuthTokens): void => {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...baseCookieOptions, maxAge: accessTokenMaxAge });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: refreshTokenMaxAge,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseCookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseCookieOptions);
};

export const readCookie = (req: Request, name: string): string | undefined => {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const value = cookies?.[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};
