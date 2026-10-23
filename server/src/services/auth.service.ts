import { UserModel, type UserDocument } from '../models/user.model.js';
import type { LoginInput } from '../validations/auth.validation.js';
import { ApiError } from '../utils/ApiError.js';
import type { AuthTokens } from '../utils/auth-cookies.js';
import { sha256 } from '../utils/hash.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { simulatePasswordCheck, verifyPassword } from '../utils/password.js';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

export interface AuthSession {
  user: UserDocument;
  tokens: AuthTokens;
}

export const loginUser = async ({ email, password }: LoginInput): Promise<AuthSession> => {
  const user = await UserModel.findOne({ email }).select('+password');

  if (!user) {
    await simulatePasswordCheck(password);
    throw ApiError.unauthorized(INVALID_CREDENTIALS_MESSAGE);
  }

  if (!(await verifyPassword(password, user.password))) {
    throw ApiError.unauthorized(INVALID_CREDENTIALS_MESSAGE);
  }

  const userId = user.id;
  const refreshToken = signRefreshToken(userId);
  await UserModel.updateOne({ _id: user._id }, { refreshTokenHash: sha256(refreshToken) });

  return {
    user,
    tokens: { accessToken: signAccessToken(userId, user.role), refreshToken },
  };
};

/**
 * Rotates the refresh token. The swap is a single compare-and-set on the stored hash,
 * so a token can be redeemed only once. A correctly signed token that no longer matches
 * means it was already rotated (possible theft): the session is revoked.
 */
export const refreshSession = async (refreshToken: string | undefined): Promise<AuthSession> => {
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token missing');
  }

  const { sub: userId } = verifyRefreshToken(refreshToken);
  const nextRefreshToken = signRefreshToken(userId);

  const user = await UserModel.findOneAndUpdate(
    { _id: userId, refreshTokenHash: sha256(refreshToken) },
    { refreshTokenHash: sha256(nextRefreshToken) },
  );

  if (!user) {
    await UserModel.updateOne({ _id: userId }, { refreshTokenHash: null });
    throw ApiError.unauthorized('Session is no longer valid. Please log in again.');
  }

  return {
    user,
    tokens: { accessToken: signAccessToken(userId, user.role), refreshToken: nextRefreshToken },
  };
};

/** Revokes the session tied to the refresh token. Never fails: logout must always succeed. */
export const logoutUser = async (refreshToken: string | undefined): Promise<void> => {
  if (!refreshToken) return;

  try {
    const { sub: userId } = verifyRefreshToken(refreshToken);
    await UserModel.updateOne({ _id: userId }, { refreshTokenHash: null });
  } catch {
    // Expired or tampered token: nothing to revoke.
  }
};

export const getCurrentUser = async (userId: string): Promise<UserDocument> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  return user;
};
