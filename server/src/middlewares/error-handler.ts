import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { isProduction } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { sendError } from '../utils/apiResponse.js';

const hasStatus = (error: unknown): error is { status: number; type?: string } =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  typeof error.status === 'number';

// body-parser types look like "entity.parse.failed" -> "ENTITY_PARSE_FAILED"
const toErrorCode = (type: string | undefined): string =>
  type ? type.replace(/[^a-z0-9]+/gi, '_').toUpperCase() : 'BAD_REQUEST';

const DUPLICATE_KEY_CODE = 11000;

/** Maps Mongo E11000 to a 409 that names the conflicting field. */
const fromDuplicateKeyError = (error: InstanceType<typeof mongoose.mongo.MongoServerError>) => {
  const keyPattern: unknown = error.keyPattern;
  const field =
    typeof keyPattern === 'object' && keyPattern !== null ? Object.keys(keyPattern)[0] : undefined;

  if (field === 'email') {
    return new ApiError(409, 'DUPLICATE_EMAIL', 'This email is already in use', { field });
  }

  return new ApiError(
    409,
    'DUPLICATE_KEY',
    'A record with this value already exists',
    field ? { field } : undefined,
  );
};

const normalizeError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  if (error instanceof mongoose.mongo.MongoServerError && error.code === DUPLICATE_KEY_CODE) {
    return fromDuplicateKeyError(error);
  }

  if (error instanceof ZodError) {
    return ApiError.validation(error.issues.map(({ path, message }) => ({ path, message })));
  }

  if (error instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${error.path}: ${String(error.value)}`);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return ApiError.validation(
      Object.values(error.errors).map(({ path, message }) => ({ path, message })),
    );
  }

  // Errors raised by body-parser (malformed JSON, payload too large, ...)
  if (hasStatus(error) && error.status >= 400 && error.status < 500) {
    const message = error instanceof Error ? error.message : 'Bad request';
    return new ApiError(error.status, toErrorCode(error.type), message);
  }

  return ApiError.internal();
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  const apiError = normalizeError(error);

  if (apiError.statusCode >= 500) {
    console.error('[error]', error);
  }

  const details =
    apiError.details ??
    (!isProduction && apiError.statusCode >= 500 && error instanceof Error
      ? error.stack
      : undefined);

  sendError(res, apiError.statusCode, apiError.code, apiError.message, details);
};
