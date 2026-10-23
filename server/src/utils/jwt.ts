import { randomUUID } from 'node:crypto';

import jwt, { type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';

import { env } from '../config/env.js';
import { USER_ROLES, type UserRole } from '../models/user.model.js';
import { ApiError } from './ApiError.js';

const ALGORITHM = 'HS256';

type ExpiresIn = NonNullable<SignOptions['expiresIn']>;

const accessPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.enum(USER_ROLES),
});

const refreshPayloadSchema = z.object({
  sub: z.string().min(1),
  jti: z.string().min(1),
});

export type AccessTokenPayload = z.infer<typeof accessPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshPayloadSchema>;

export const signAccessToken = (userId: string, role: UserRole): string =>
  jwt.sign({ role }, env.JWT_ACCESS_SECRET, {
    algorithm: ALGORITHM,
    subject: userId,
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as ExpiresIn,
  });

/** Each refresh token carries a random jti so every rotation yields a distinct token. */
export const signRefreshToken = (userId: string): string =>
  jwt.sign({}, env.JWT_REFRESH_SECRET, {
    algorithm: ALGORITHM,
    subject: userId,
    jwtid: randomUUID(),
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as ExpiresIn,
  });

const verifyToken = <T>(
  token: string,
  secret: string,
  schema: z.ZodType<T>,
  errorMessage: string,
): T => {
  try {
    const decoded = jwt.verify(token, secret, { algorithms: [ALGORITHM] });
    return schema.parse(decoded);
  } catch {
    throw ApiError.unauthorized(errorMessage);
  }
};

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  verifyToken(token, env.JWT_ACCESS_SECRET, accessPayloadSchema, 'Invalid or expired session');

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  verifyToken(token, env.JWT_REFRESH_SECRET, refreshPayloadSchema, 'Invalid or expired session');
